<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  months: {
    type: Array,
    required: true
  },
  cities: {
    type: Array,
    required: true
  },
  incomeTrend: {
    type: Object,
    required: true
  },
  incomeRanking: {
    type: Object,
    required: true
  },
  incomeProvinceGrowth: {
    type: Object,
    required: true
  }
})

const viewMode = ref('trend')
const metric = ref('total')
const monthIndex = ref(props.months.length - 1)
const selectedCity = ref('六盘水市')
const chartRef = ref(null)
let chartInstance = null

const monthLabel = computed(() => props.months[monthIndex.value])
const trendData = computed(() => props.incomeTrend[selectedCity.value]?.[metric.value] || { balance: [], growth: [] })
const rankingData = computed(() => props.incomeRanking[monthLabel.value]?.[metric.value] || [])

function renderChart() {
  if (!chartInstance) return
  const option = viewMode.value === 'trend' ? createTrendOption() : createRankingOption()
  chartInstance.setOption(option, true)
}

function createTrendOption() {
  return {
    grid: { left: 42, right: 38, top: 34, bottom: 30 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: props.months,
      axisLabel: { color: '#86a8d7' }
    },
    yAxis: [
      {
        type: 'value',
        name: '余额',
        axisLabel: { color: '#86a8d7' },
        splitLine: { lineStyle: { color: 'rgba(88, 133, 202, 0.2)' } }
      },
      {
        type: 'value',
        name: '增速(%)',
        axisLabel: { color: '#86a8d7' }
      }
    ],
    series: [
      {
        name: '余额',
        type: 'bar',
        data: trendData.value.balance,
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#5bf8d8' },
            { offset: 1, color: '#1c7be8' }
          ])
        }
      },
      {
        name: '同比增速',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: trendData.value.growth,
        lineStyle: { color: '#f8db7b', width: 2 },
        itemStyle: { color: '#f8db7b' }
      },
      {
        name: '全省同比增速',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        data: props.incomeProvinceGrowth[metric.value],
        lineStyle: { color: '#60bcff', type: 'dashed' }
      }
    ]
  }
}

function createRankingOption() {
  const rows = [...rankingData.value].reverse()
  return {
    grid: { left: 70, right: 95, top: 26, bottom: 24 },
    tooltip: { trigger: 'item' },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: {
      type: 'category',
      data: rows.map((row) => row.city),
      axisLabel: { color: '#96b9e9' }
    },
    series: [
      {
        type: 'bar',
        data: rows.map((row) => row.value),
        realtimeSort: true,
        label: {
          show: true,
          position: 'right',
          color: '#d9e8ff',
          formatter(params) {
            const row = rows[params.dataIndex]
            return `${formatNumber(row.value)}  ${row.share}%`
          }
        },
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color(params) {
            return rows[params.dataIndex].isLiupanshui ? '#ffcd64' : '#3193ff'
          }
        }
      }
    ]
  }
}

function formatNumber(value) {
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

watch([viewMode, metric, selectedCity, monthIndex], async () => {
  await nextTick()
  renderChart()
})

onMounted(() => {
  chartInstance = echarts.init(chartRef.value)
  renderChart()
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
</script>

<template>
  <div class="panel panel-card">
    <div class="header">
      <h2>两项收入板块</h2>
      <div class="mode-switch">
        <button type="button" :class="{ active: viewMode === 'trend' }" @click="viewMode = 'trend'">看趋势</button>
        <button type="button" :class="{ active: viewMode === 'rank' }" @click="viewMode = 'rank'">看排名</button>
      </div>
    </div>

    <div class="toolbar">
      <div class="metric-switch">
        <button type="button" :class="{ active: metric === 'interest' }" @click="metric = 'interest'">利息净收入</button>
        <button type="button" :class="{ active: metric === 'fee' }" @click="metric = 'fee'">手续费及佣金</button>
        <button type="button" :class="{ active: metric === 'total' }" @click="metric = 'total'">两项收入总和</button>
      </div>

      <select v-if="viewMode === 'trend'" v-model="selectedCity" class="city-select">
        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
      </select>
      <div v-else class="month-ctrl">
        <input v-model="monthIndex" type="range" :max="months.length - 1" min="0" step="1" />
        <span>{{ monthLabel }}</span>
      </div>
    </div>

    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<style scoped>
.panel-card {
  margin-top: 12px;
  padding: 14px;
  min-height: 348px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

h2 {
  margin: 0;
  color: #d6ebff;
  font-size: 19px;
}

.mode-switch,
.metric-switch {
  display: inline-flex;
  gap: 6px;
  background: rgba(10, 29, 67, 0.58);
  border: 1px solid rgba(74, 139, 230, 0.35);
  border-radius: 8px;
  padding: 4px;
}

button {
  border: 1px solid transparent;
  border-radius: 6px;
  background: rgba(15, 45, 103, 0.65);
  color: #94b7e7;
  padding: 5px 8px;
  font-size: 12px;
  cursor: pointer;
}

button.active {
  color: #ffd27f;
  border-color: rgba(255, 210, 127, 0.6);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.city-select {
  background: rgba(8, 27, 63, 0.8);
  border: 1px solid rgba(74, 139, 230, 0.4);
  color: #c6dcff;
  border-radius: 6px;
  padding: 5px 8px;
}

.month-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9bbce9;
  font-size: 12px;
}

.chart {
  min-height: 248px;
}
</style>
