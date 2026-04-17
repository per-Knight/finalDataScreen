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
  depositLoanTrend: {
    type: Object,
    required: true
  },
  depositLoanRanking: {
    type: Object,
    required: true
  },
  provinceAvgGrowth: {
    type: Object,
    required: true
  }
})

const viewMode = ref('trend')
const metric = ref('deposit')
const selectedCity = ref('六盘水市')
const monthIndex = ref(props.months.length - 1)
const playing = ref(false)

const chartRef = ref(null)
let chartInstance = null
let timer = null

const monthLabel = computed(() => props.months[monthIndex.value])

const rankingRows = computed(() => props.depositLoanRanking[monthLabel.value]?.[metric.value] || [])
const trendRows = computed(() => props.depositLoanTrend[selectedCity.value]?.[metric.value] || { balance: [], growth: [] })

function togglePlay() {
  playing.value = !playing.value
}

function startPlay() {
  clearInterval(timer)
  timer = setInterval(() => {
    monthIndex.value = (monthIndex.value + 1) % props.months.length
  }, 1600)
}

function stopPlay() {
  clearInterval(timer)
  timer = null
}

function renderChart() {
  if (!chartInstance) return
  if (viewMode.value === 'trend') {
    chartInstance.setOption(createTrendOption(), true)
  } else {
    chartInstance.setOption(createRankingOption(), true)
  }
}

function createTrendOption() {
  const data = trendRows.value
  return {
    grid: { left: 44, right: 44, top: 40, bottom: 36 },
    tooltip: { trigger: 'axis' },
    legend: {
      top: 8,
      textStyle: { color: '#9ec7ff' }
    },
    xAxis: {
      type: 'category',
      data: props.months,
      axisLine: { lineStyle: { color: '#2f5185' } },
      axisLabel: { color: '#86a6da' }
    },
    yAxis: [
      {
        type: 'value',
        name: '余额(亿元)',
        axisLabel: { color: '#86a6da' },
        splitLine: { lineStyle: { color: 'rgba(95, 140, 210, 0.2)' } }
      },
      {
        type: 'value',
        name: '增速(%)',
        axisLabel: { color: '#86a6da' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '余额',
        type: 'bar',
        barWidth: 18,
        data: data.balance,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3cf2ff' },
            { offset: 1, color: '#1654b8' }
          ])
        }
      },
      {
        name: '同比增速',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: data.growth,
        lineStyle: { color: '#fce97b', width: 2.2 },
        itemStyle: { color: '#fce97b' }
      },
      {
        name: '全省平均增速',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        data: props.provinceAvgGrowth[metric.value],
        lineStyle: { color: '#6ec8ff', type: 'dashed', width: 1.8 }
      }
    ]
  }
}

function createRankingOption() {
  const rows = [...rankingRows.value].reverse()
  return {
    grid: { left: 72, right: 90, top: 28, bottom: 32 },
    tooltip: { trigger: 'item' },
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: {
      type: 'category',
      data: rows.map((row) => row.city),
      axisLabel: { color: '#9ec7ff' },
      axisLine: { lineStyle: { color: '#2f5185' } }
    },
    series: [
      {
        type: 'bar',
        realtimeSort: true,
        data: rows.map((row) => row.value),
        label: {
          show: true,
          position: 'right',
          color: '#d6e7ff',
          formatter(params) {
            const row = rows[params.dataIndex]
            return `${formatNumber(row.value)}  占比${row.share}%`
          }
        },
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color(params) {
            return rows[params.dataIndex].isLiupanshui ? '#ffcd64' : '#2a8fff'
          }
        }
      }
    ]
  }
}

function formatNumber(value) {
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

watch([viewMode, metric, selectedCity, monthIndex], () => {
  nextTick(renderChart)
})

watch(playing, (value) => {
  if (value) startPlay()
  else stopPlay()
})

onMounted(() => {
  chartInstance = echarts.init(chartRef.value)
  renderChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  stopPlay()
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

function handleResize() {
  chartInstance?.resize()
}
</script>

<template>
  <div class="panel panel-card">
    <div class="panel-header">
      <h2>存贷款全景</h2>
      <div class="mode-switch">
        <button type="button" :class="{ active: viewMode === 'trend' }" @click="viewMode = 'trend'">看趋势</button>
        <button type="button" :class="{ active: viewMode === 'rank' }" @click="viewMode = 'rank'">看排名</button>
      </div>
    </div>

    <div class="toolbar">
      <div class="radio-group">
        <button type="button" :class="{ active: metric === 'deposit' }" @click="metric = 'deposit'">存款</button>
        <button type="button" :class="{ active: metric === 'loan' }" @click="metric = 'loan'">贷款</button>
      </div>
      <select v-if="viewMode === 'trend'" v-model="selectedCity" class="city-select">
        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
      </select>
      <div v-else class="month-ctrl">
        <button type="button" @click="togglePlay">{{ playing ? '暂停' : '播放' }}</button>
        <input v-model="monthIndex" type="range" :max="months.length - 1" min="0" step="1" />
        <span>{{ monthLabel }}</span>
      </div>
    </div>

    <div ref="chartRef" class="chart-area"></div>
  </div>
</template>

<style scoped>
.panel-card {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 470px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 {
  margin: 0;
  color: #d6e9ff;
  font-size: 20px;
}

.mode-switch,
.radio-group {
  display: inline-flex;
  gap: 6px;
  background: rgba(9, 25, 63, 0.6);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(69, 135, 223, 0.35);
}

button {
  border: 1px solid transparent;
  border-radius: 6px;
  background: rgba(13, 40, 94, 0.65);
  color: #8cb0e3;
  padding: 5px 10px;
  cursor: pointer;
}

button.active {
  color: #ffd27a;
  border-color: rgba(255, 210, 122, 0.55);
  background: rgba(255, 201, 94, 0.13);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.city-select {
  background: rgba(9, 25, 63, 0.76);
  border: 1px solid rgba(69, 135, 223, 0.5);
  color: #c5dcff;
  border-radius: 6px;
  padding: 6px 8px;
}

.month-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #96b8eb;
  font-size: 13px;
}

.chart-area {
  flex: 1;
  min-height: 360px;
}
</style>
