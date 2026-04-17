<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  routes: {
    type: Array,
    required: true
  },
  timeLabel: {
    type: String,
    required: true
  }
})
</script>

<template>
  <header class="header-bar panel">
    <div class="header-meta">
      <p class="meta-item">时间：{{ timeLabel }}</p>
      <p class="meta-item">天气：多云 22℃</p>
      <p class="meta-item status">系统运行：正常</p>
    </div>

    <h1 class="header-title">{{ title }}</h1>

    <nav class="header-nav">
      <button
        v-for="route in routes"
        :key="route.key"
        type="button"
        class="nav-btn"
        :class="{ active: route.active }"
      >
        {{ route.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.header-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
}

.header-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  color: #8bb9ff;
  font-size: 13px;
}

.status {
  color: #23ffb8;
}

.header-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  text-align: center;
  color: #d9ecff;
  text-shadow: 0 0 12px rgba(0, 214, 255, 0.75);
  white-space: nowrap;
}

.header-nav {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.nav-btn {
  border: 1px solid rgba(75, 155, 255, 0.4);
  background: rgba(10, 28, 66, 0.68);
  color: #9ab9eb;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn.active {
  color: #ffd76b;
  border-color: rgba(255, 215, 107, 0.85);
  box-shadow: inset 0 -2px 0 rgba(255, 215, 107, 0.85), 0 0 10px rgba(255, 215, 107, 0.35);
}
</style>
