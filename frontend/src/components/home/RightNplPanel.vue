<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  nplTrend: {
    type: Object,
    required: true
  },
  months: {
    type: Array,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null

function renderChart() {
  if (!chartInstance) return

  const colors = props.nplTrend.liupanshui.map((value, idx) => {
    return value > props.nplTrend.province[idx] ? '#ff7388' : '#6ef0ff'
  })

  chartInstance.setOption(
    {
      grid: { left: 44, right: 28, top: 40, bottom: 30 },
      tooltip: { trigger: 'axis' },
      legend: {
        top: 8,
        textStyle: { color: '#9ec6f4' }
      },
      xAxis: {
        type: 'category',
        data: props.months,
        axisLabel: { color: '#8db1e4' },
        axisLine: { lineStyle: { color: '#345b96' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8db1e4', formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(79, 126, 198, 0.2)' } }
      },
      series: [
        {
          name: '全省不良贷款率',
          type: 'line',
          data: props.nplTrend.province,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#56adff', type: 'dashed', width: 2 }
        },
        {
          name: '六盘水不良贷款率',
          type: 'line',
          data: props.nplTrend.liupanshui,
          smooth: true,
          lineStyle: { color: '#6ef0ff', width: 2.2 },
          itemStyle: {
            color(params) {
              return colors[params.dataIndex]
            }
          },
          markPoint: {
            data: props.nplTrend.liupanshui
              .map((value, idx) => ({
                value,
                name: value > props.nplTrend.province[idx] ? '高于均值' : '',
                xAxis: idx,
                yAxis: value
              }))
              .filter((item) => item.name),
            itemStyle: { color: '#ff7388' },
            label: { color: '#ffc6cf' }
          }
        }
      ]
    },
    true
  )
}

watch(() => props.nplTrend, async () => {
  await nextTick()
  renderChart()
}, { deep: true })

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
    <div class="title-row">
      <h2>不良贷款率监测</h2>
      <span class="badge">红线监控</span>
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<style scoped>
.panel-card {
  padding: 14px;
  min-height: 310px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 {
  margin: 0;
  color: #d7ebff;
  font-size: 19px;
}

.badge {
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 119, 132, 0.65);
  color: #ffadb8;
  font-size: 12px;
}

.chart {
  min-height: 246px;
}
</style>
