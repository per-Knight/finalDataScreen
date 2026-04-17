<script setup>
const props = defineProps({
  alerts: {
    type: Array,
    default: () => []
  }
})

const alertText = props.alerts.join('  ｜  ')
</script>

<template>
  <section class="alert-bar panel" aria-label="预警跑马灯">
    <span class="alert-tag">预警</span>
    <div class="alert-scroll">
      <p class="alert-text">{{ alertText || '当前暂无预警信息。' }}</p>
      <p class="alert-text">{{ alertText || '当前暂无预警信息。' }}</p>
    </div>
  </section>
</template>

<style scoped>
.alert-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
}

.alert-tag {
  flex: 0 0 auto;
  color: #ff9aa2;
  font-weight: 600;
  border: 1px solid rgba(255, 85, 103, 0.7);
  border-radius: 999px;
  padding: 4px 12px;
  box-shadow: 0 0 12px rgba(255, 85, 103, 0.35);
}

.alert-scroll {
  overflow: hidden;
  display: flex;
  white-space: nowrap;
  width: 100%;
}

.alert-text {
  color: #ffcad0;
  font-size: 14px;
  margin: 0;
  padding-right: 40px;
  animation: marquee 24s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
