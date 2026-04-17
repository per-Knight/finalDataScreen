const cities = [
  '贵阳市',
  '六盘水市',
  '遵义市',
  '安顺市',
  '毕节市',
  '铜仁市',
  '黔东南州',
  '黔南州',
  '黔西南州'
]

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const citySeed = {
  贵阳市: { deposit: 5200, loan: 4800, npl: 1.62, income: 1050 },
  六盘水市: { deposit: 2050, loan: 1880, npl: 2.08, income: 510 },
  遵义市: { deposit: 3600, loan: 3220, npl: 1.82, income: 760 },
  安顺市: { deposit: 2280, loan: 2030, npl: 1.91, income: 490 },
  毕节市: { deposit: 2480, loan: 2160, npl: 2.02, income: 515 },
  铜仁市: { deposit: 2330, loan: 2090, npl: 1.87, income: 505 },
  黔东南州: { deposit: 2400, loan: 2110, npl: 1.86, income: 520 },
  黔南州: { deposit: 2360, loan: 2080, npl: 1.89, income: 500 },
  黔西南州: { deposit: 2210, loan: 1990, npl: 1.93, income: 485 }
}

const monthWave = [0.98, 0.99, 1.0, 1.01, 1.02, 1.025, 1.03, 1.038, 1.045, 1.05, 1.058, 1.066]

const depositLoanTrend = {}
const depositLoanRanking = {}
const mapPayload = {}
const incomeTrend = {}
const incomeRanking = {}

cities.forEach((city, cityIndex) => {
  const seed = citySeed[city]
  const decay = 1 + cityIndex * 0.012
  const deposits = monthWave.map((w, monthIndex) => round(seed.deposit * w * decay + monthIndex * 17, 2))
  const loans = monthWave.map((w, monthIndex) => round(seed.loan * w * decay + monthIndex * 13, 2))
  const depositGrowth = deposits.map((value, idx) => {
    if (idx === 0) return 3.1 - cityIndex * 0.12
    return round(((value - deposits[idx - 1]) / deposits[idx - 1]) * 100 + 2.1, 2)
  })
  const loanGrowth = loans.map((value, idx) => {
    if (idx === 0) return 2.8 - cityIndex * 0.14
    return round(((value - loans[idx - 1]) / loans[idx - 1]) * 100 + 1.7, 2)
  })

  depositLoanTrend[city] = {
    deposit: { balance: deposits, growth: depositGrowth },
    loan: { balance: loans, growth: loanGrowth }
  }

  const interestIncome = monthWave.map((w, monthIndex) => round(seed.income * 0.66 * w * decay + monthIndex * 5.2, 2))
  const feeIncome = monthWave.map((w, monthIndex) => round(seed.income * 0.34 * w * (decay - 0.01) + monthIndex * 2.8, 2))
  const totalIncome = interestIncome.map((value, idx) => round(value + feeIncome[idx], 2))
  incomeTrend[city] = {
    interest: {
      balance: interestIncome,
      growth: calculateGrowth(interestIncome, 1.9 - cityIndex * 0.05)
    },
    fee: {
      balance: feeIncome,
      growth: calculateGrowth(feeIncome, 1.4 - cityIndex * 0.06)
    },
    total: {
      balance: totalIncome,
      growth: calculateGrowth(totalIncome, 1.8 - cityIndex * 0.06)
    }
  }
})

months.forEach((month, monthIndex) => {
  const depositRows = cities.map((city) => {
    const depositBalance = depositLoanTrend[city].deposit.balance[monthIndex]
    return { city, value: depositBalance }
  })
  const loanRows = cities.map((city) => {
    const loanBalance = depositLoanTrend[city].loan.balance[monthIndex]
    return { city, value: loanBalance }
  })

  depositLoanRanking[month] = {
    deposit: addShareAndRank(depositRows),
    loan: addShareAndRank(loanRows)
  }

  const incomeRows = {
    interest: addShareAndRank(cities.map((city) => ({ city, value: incomeTrend[city].interest.balance[monthIndex] }))),
    fee: addShareAndRank(cities.map((city) => ({ city, value: incomeTrend[city].fee.balance[monthIndex] }))),
    total: addShareAndRank(cities.map((city) => ({ city, value: incomeTrend[city].total.balance[monthIndex] })))
  }

  incomeRanking[month] = incomeRows

  mapPayload[month] = cities.map((city) => {
    const deposit = depositLoanTrend[city].deposit.balance[monthIndex]
    const loan = depositLoanTrend[city].loan.balance[monthIndex]
    const depositGrowth = depositLoanTrend[city].deposit.growth[monthIndex]
    const loanGrowth = depositLoanTrend[city].loan.growth[monthIndex]
    const isAlert = city === '六盘水市'
      ? depositGrowth < 4.15 || loanGrowth < 3.95
      : depositGrowth < 2 || loanGrowth < 1.8
    return {
      name: city,
      value: deposit,
      deposit,
      loan,
      depositGrowth,
      loanGrowth,
      rank: depositLoanRanking[month].deposit.findIndex((row) => row.city === city) + 1,
      isAlert
    }
  })
})

const provinceAvgGrowth = {
  deposit: months.map(() => 4.15),
  loan: months.map(() => 3.95)
}

const incomeProvinceGrowth = {
  interest: months.map(() => 3.1),
  fee: months.map(() => 2.75),
  total: months.map(() => 2.96)
}

const nplTrend = {
  province: months.map((_, idx) => round(1.78 + idx * 0.01, 2)),
  liupanshui: months.map((_, idx) => round(2.03 + idx * 0.018 + (idx % 3 === 0 ? 0.02 : 0), 2))
}

const alerts = [
  '六盘水市存款同比增速低于全省平均水平，请重点关注结构性资金流向。',
  '六盘水市贷款同比增速连续2个月低于全省平均增速。',
  '部分机构两项收入同比负增长，建议排查手续费与佣金下滑原因。',
  '六盘水市不良贷款率高于全省均值，请持续跟踪风险敞口。'
]

export const homePageData = {
  cities,
  months,
  alerts,
  depositLoanTrend,
  depositLoanRanking,
  provinceAvgGrowth,
  mapPayload,
  nplTrend,
  incomeTrend,
  incomeRanking,
  incomeProvinceGrowth
}

function addShareAndRank(rows) {
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  return rows
    .map((row) => ({
      city: row.city,
      value: row.value,
      share: round((row.value / total) * 100, 1)
    }))
    .sort((a, b) => b.value - a.value)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      isLiupanshui: row.city === '六盘水市'
    }))
}

function calculateGrowth(data, base) {
  return data.map((value, idx) => {
    if (idx === 0) return round(base, 2)
    return round(((value - data[idx - 1]) / data[idx - 1]) * 100 + base, 2)
  })
}

function round(num, precision = 2) {
  return Number(num.toFixed(precision))
}
