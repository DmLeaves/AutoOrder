<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="greeting-section">
          <div class="greeting-text">统计分析</div>
        </div>
      </div>

      <div class="sidebar-content">
        <nav class="stats-nav">
          <ul class="stats-menu">
            <li
                v-for="item in menuItems"
                :key="item.id"
                :class="['stats-menu-item', { active: isActiveRoute(item.route), 'menu-disabled': !item.implemented }]"
                @click="navigateToMenu(item)"
            >
              <div class="menu-item-content">
                <span class="menu-icon">
                  <component :is="item.icon" />
                </span>
                <span class="menu-label">{{ item.label }}</span>
                <span v-if="!item.implemented" class="development-badge">开发中</span>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <div class="top-actions">
        <button class="btn btn-primary back-btn" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          <span>返回</span>
        </button>
      </div>

      <div class="content-area">
        <slot></slot>
      </div>
    </main>

    <!-- 功能开发中提示 -->
    <div v-if="showDevToast" class="dev-toast">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>该功能正在开发中，敬请期待！</span>
    </div>
  </div>
</template>

<script>
import { ref, h } from 'vue';
import router from "@/router";
import { useRoute } from 'vue-router';

export default {
  name: 'StatisticsLayout',
  setup() {
    const route = useRoute();
    const showDevToast = ref(false);

    // 图标组件创建函数
    const createIcon = (d) => {
      return () => h('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, [h('path', { d })]);
    };

    // 菜单项配置，使用函数式组件作为图标
    const menuItems = [
      {
        id: 'dashboard',
        label: '仪表盘',
        icon: createIcon('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'),
        route: '/statistics',
        implemented: true
      },
      {
        id: 'income',
        label: '收入分析',
        icon: createIcon('M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'),
        route: '/income-analysis',
        implemented: false
      },
      {
        id: 'orders',
        label: '订单分析',
        icon: createIcon('M22 12h-4l-3 9L9 3l-3 9H2'),
        route: '/order-analysis',
        implemented: false
      },
      {
        id: 'anomalies',
        label: '异常分析',
        icon: createIcon('M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'),
        route: '/anomaly-analysis',
        implemented: false
      },
      {
        id: 'calculator',
        label: '快捷计算',
        icon: createIcon('M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5z'),
        route: '/calculator',
        implemented: true
      },
      {
        id: 'export',
        label: '快捷导出',
        icon: createIcon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3'),
        route: '/export',
        implemented: true
      }
    ];

    // 检查当前路由是否活跃
    const isActiveRoute = (routePath) => {
      return route.path === routePath;
    };

    // 导航到指定菜单
    const navigateToMenu = (item) => {
      if (!item.implemented) {
        // 显示开发中提示
        showDevToast.value = true;
        setTimeout(() => {
          showDevToast.value = false;
        }, 3000);
        return;
      }

      if (route.path !== item.route) {
        router.push(item.route);
      }
    };

    // 返回首页
    const goBack = () => {
      router.push('/');
    };

    return {
      menuItems,
      isActiveRoute,
      navigateToMenu,
      goBack,
      showDevToast
    };
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

.sidebar {
  width: 220px;
  min-width: 220px;
  background-color: var(--secondary-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-top {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.greeting-section {
  padding: var(--spacing-md);
  text-align: center;
}

.greeting-text {
  font-weight: 500;
  color: var(--text-secondary);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding-top: var(--spacing-md);
}

.stats-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stats-menu-item {
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-left: 3px solid transparent;
}

.stats-menu-item:hover:not(.menu-disabled) {
  background-color: rgba(77, 166, 255, 0.08);
}

.stats-menu-item.active {
  background-color: rgba(77, 166, 255, 0.15);
  border-left-color: var(--accent-blue);
}

.menu-item-content {
  display: flex;
  align-items: center;
  position: relative;
}

.menu-icon {
  margin-right: var(--spacing-md);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.active .menu-icon {
  color: var(--accent-blue);
}

.menu-label {
  font-weight: 500;
}

.active .menu-label {
  color: var(--accent-blue);
}

/* 菜单禁用样式 */
.menu-disabled {
  opacity: 0.7;
  cursor: default;
}

.menu-disabled:hover {
  background-color: transparent;
}

.development-badge {
  background-color: var(--status-warning);
  color: var(--primary-bg);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: var(--spacing-sm);
  font-weight: bold;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
}

.top-actions {
  padding: var(--spacing-md);
  display: flex;
  justify-content: flex-start;
  border-bottom: 1px solid var(--border-color);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
}

/* 开发中提示 */
.dev-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--tertiary-bg);
  border: 1px solid var(--status-warning);
  border-radius: var(--border-radius-md);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s forwards;
}

.dev-toast svg {
  color: var(--status-warning);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>