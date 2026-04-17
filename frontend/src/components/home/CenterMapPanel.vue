<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import guizhouProvinceGeoJson from '@noahsun/echarts-map-json/geometryProvince/52.json'

const props = defineProps({
  mapPayload: {
    type: Object,
    required: true
  },
  months: {
    type: Array,
    required: true
  }
})

const metric = ref('deposit')
const monthIndex = ref(props.months.length - 1)
const chartRef = ref(null)
let chartInstance = null

const monthLabel = computed(() => props.months[monthIndex.value])
const mapRows = computed(() => props.mapPayload[monthLabel.value] || [])
const cityNameAlias = {
  黔东南苗族侗族自治州: '黔东南州',
  黔南布依族苗族自治州: '黔南州',
  黔西南布依族苗族自治州: '黔西南州',
  毕节地区: '毕节市',
  铜仁地区: '铜仁市'
}

const normalizedGeoJson = normalizeGeoJsonNames(guizhouProvinceGeoJson)

function buildOption() {
  const rows = mapRows.value.map((row) => ({
    ...row,
    value: metric.value === 'deposit' ? row.deposit : row.loan
  }))
  const values = rows.map((row) => row.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  return {
    tooltip: {
      trigger: 'item',
      formatter(params) {
        const cityName = normalizeCityName(params.name)
        const row = rows.find((item) => item.name === cityName)
        if (!row) return params.name
        const depositGrowthClass = row.depositGrowth < 0 ? 'negative' : ''
        const loanGrowthClass = row.loanGrowth < 0 ? 'negative' : ''
        return `
          <div style="min-width:220px">
            <div style="color:#f8fbff;font-weight:700;margin-bottom:6px">${row.name}（第${row.rank}位）</div>
            <div style="color:#b9d8ff">存款：${formatNumber(row.deposit)}亿元 <span class="${depositGrowthClass}" style="color:${row.depositGrowth < 0 ? '#ff6b7f' : '#77f7ce'}">同比${row.depositGrowth}%</span></div>
            <div style="color:#b9d8ff">贷款：${formatNumber(row.loan)}亿元 <span class="${loanGrowthClass}" style="color:${row.loanGrowth < 0 ? '#ff6b7f' : '#77f7ce'}">同比${row.loanGrowth}%</span></div>
            <div style="margin-top:6px;color:${row.isAlert ? '#ff9ca8' : '#68f7d0'}">${row.isAlert ? '触发预警' : '状态正常'}</div>
          </div>
        `
      }
    },
    visualMap: {
      min,
      max,
      left: 24,
      bottom: 22,
      text: ['高', '低'],
      textStyle: { color: '#9ec7ff' },
      calculable: true,
      inRange: {
        color: ['#0f2b67', '#1f63bf', '#2fd2dd']
      }
    },
    series: [
      {
        type: 'map',
        map: 'guizhou-custom',
        roam: true,
        zoom: 1.12,
        label: { show: true, color: '#d4e5ff', fontSize: 11 },
        emphasis: {
          label: { color: '#fff' },
          itemStyle: { areaColor: '#57c3ff' }
        },
        itemStyle: {
          borderColor: '#57a7ff',
          borderWidth: 1.1
        },
        data: rows.map((row) => ({
          name: row.name,
          value: row.value,
          itemStyle: row.name === '六盘水市'
            ? {
                borderColor: '#ffd76b',
                borderWidth: 2.2,
                shadowBlur: 20,
                shadowColor: 'rgba(255, 215, 107, 0.65)'
              }
            : {}
        }))
      }
    ]
  }
}

watch([metric, monthIndex], async () => {
  await nextTick()
  chartInstance?.setOption(buildOption(), true)
})

onMounted(() => {
  echarts.registerMap('guizhou-custom', normalizedGeoJson)
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(buildOption())
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chartInstance?.dispose()
  chartInstance = null
})

function onResize() {
  chartInstance?.resize()
}

function formatNumber(value) {
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

function normalizeCityName(name) {
  return cityNameAlias[name] || name
}

function normalizeGeoJsonNames(geoJson) {
  return {
    ...geoJson,
    features: geoJson.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        name: normalizeCityName(feature.properties.name)
      }
    }))
  }
}
</script>

<template>
  <div class="panel panel-card">
    <div class="panel-header">
      <h2>贵州省金融态势地图</h2>
      <div class="toggle">
        <button type="button" :class="{ active: metric === 'deposit' }" @click="metric = 'deposit'">存款态势</button>
        <button type="button" :class="{ active: metric === 'loan' }" @click="metric = 'loan'">贷款态势</button>
      </div>
    </div>

    <div class="month-bar">
      <span>当前月份：{{ monthLabel }}</span>
      <input v-model="monthIndex" type="range" :max="months.length - 1" min="0" step="1" />
      <button type="button" class="drill-btn">进入六盘水全景</button>
    </div>

    <div ref="chartRef" class="map-chart"></div>
  </div>
</template>

<style scoped>
.panel-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 670px;
  gap: 12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 {
  margin: 0;
  color: #d8ebff;
  font-size: 22px;
}

.toggle {
  display: flex;
  gap: 6px;
}

button {
  border: 1px solid rgba(92, 159, 255, 0.45);
  background: rgba(10, 37, 90, 0.6);
  color: #95b9f0;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
}

button.active {
  color: #ffd978;
  border-color: rgba(255, 217, 120, 0.8);
  box-shadow: 0 0 14px rgba(255, 217, 120, 0.35);
}

.month-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #9ec4f7;
  font-size: 13px;
}

.month-bar input {
  flex: 1;
}

.drill-btn {
  border-color: rgba(61, 255, 204, 0.55);
  color: #7efcd5;
}

.map-chart {
  flex: 1;
  min-height: 560px;
}
</style>
