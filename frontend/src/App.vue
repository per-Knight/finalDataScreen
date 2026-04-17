<script setup>
import { computed } from 'vue'
import HeaderBar from './components/home/HeaderBar.vue'
import AlertMarquee from './components/home/AlertMarquee.vue'
import LeftDepositLoanPanel from './components/home/LeftDepositLoanPanel.vue'
import CenterMapPanel from './components/home/CenterMapPanel.vue'
import RightNplPanel from './components/home/RightNplPanel.vue'
import RightIncomePanel from './components/home/RightIncomePanel.vue'
import { homePageData } from './mock/homePageData'
import { pageRoutes } from './config/pageRoutes'

const pageTitle = '六盘水市人民银行金融数据综合驾驶舱'

const nowDisplay = computed(() => {
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  return `${date} ${time}`
})
</script>

<template>
  <div class="screen-page">
    <HeaderBar :title="pageTitle" :routes="pageRoutes" :time-label="nowDisplay" />

    <AlertMarquee :alerts="homePageData.alerts" />

    <main class="screen-main">
      <section class="column-left">
        <LeftDepositLoanPanel
          :months="homePageData.months"
          :cities="homePageData.cities"
          :deposit-loan-trend="homePageData.depositLoanTrend"
          :deposit-loan-ranking="homePageData.depositLoanRanking"
          :province-avg-growth="homePageData.provinceAvgGrowth"
        />
      </section>

      <section class="column-center">
        <CenterMapPanel
          :map-payload="homePageData.mapPayload"
          :months="homePageData.months"
        />
      </section>

      <section class="column-right">
        <RightNplPanel :npl-trend="homePageData.nplTrend" :months="homePageData.months" />
        <RightIncomePanel
          :months="homePageData.months"
          :cities="homePageData.cities"
          :income-trend="homePageData.incomeTrend"
          :income-ranking="homePageData.incomeRanking"
          :income-province-growth="homePageData.incomeProvinceGrowth"
        />
      </section>
    </main>
  </div>
</template>
