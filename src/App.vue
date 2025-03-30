<template>
  <div class="app-container">
    <!-- Custom title bar -->
    <header class="title-bar">
      <div class="app-title">订单管理系统</div>
      <div class="window-controls">
        <div class="window-control-btn minimize-btn" @click="minimizeWindow">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="5" width="8" height="2" fill="currentColor" />
          </svg>
        </div>
        <div class="window-control-btn maximize-btn" @click="maximizeWindow">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="2" width="8" height="8" stroke="currentColor" fill="none" stroke-width="1" />
          </svg>
        </div>
        <div class="window-control-btn close-btn" @click="closeWindow">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.5" />
            <line x1="2" y1="10" x2="10" y2="2" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <div class="app-content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    minimizeWindow() {
      window.electron.window.minimize();
    },
    maximizeWindow() {
      window.electron.window.maximize();
    },
    closeWindow() {
      window.electron.window.close();
    }
  }
}
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--primary-bg);
}

.app-title {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 30px);
}
</style>