<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="greeting-section">
          <div class="greeting-text">问候/登录</div>
        </div>
      </div>

      <div class="sidebar-content">
        <OrderCategory @category-selected="$emit('category-selected', $event)"
                       @subcategory-selected="$emit('subcategory-selected', $event)" />
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <div class="top-actions">
        <button class="btn btn-primary add-order-btn" @click="showAddOrderModal">
          <span>添加订单</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div class="content-area">
        <slot></slot>
      </div>

      <!-- 添加订单模态窗口 -->
      <AddOrderModal
          :visible="addOrderModalVisible"
          @close="addOrderModalVisible = false"
          @order-added="handleOrderAdded"
      />
    </main>

    <!-- Right sidebar / Action panel -->
    <aside class="action-panel">
      <div class="action-buttons">
        <button class="btn btn-secondary action-btn">统计信息</button>
        <button class="btn btn-secondary action-btn">后台管理</button>
        <button class="btn btn-secondary action-btn" @click="openResourceFolder">资源文件</button>
        <button class="btn btn-secondary action-btn" @click="openProjectFolder">项目文件</button>
      </div>
    </aside>
  </div>
</template>

<script>
import { ref } from 'vue';
import OrderCategory from '../components/OrderCategory.vue';
import AddOrderModal from '../components/AddOrderModal.vue';

export default {
  name: 'MainLayout',
  components: {
    OrderCategory,
    AddOrderModal
  },
  emits: ['category-selected', 'subcategory-selected', 'refresh-data'],
  setup(props, { emit }) {
    const addOrderModalVisible = ref(false);

    const showAddOrderModal = () => {
      console.log('显示添加订单模态窗口');
      addOrderModalVisible.value = true;
    };

    const handleOrderAdded = () => {
      // 通知父组件刷新数据
      emit('refresh-data');
    };

    const openResourceFolder = () => {
      if (window.electron && window.electron.files) {
        window.electron.files.openFolder('D:\\收纳\\临时桌面\\工作资源文件')
            .then(result => {
              if (!result.success) {
                console.error('打开资源文件夹失败:', result.error);
              }
            });
      }
    };

    const openProjectFolder = () => {
      if (window.electron && window.electron.files) {
        window.electron.files.openFolder('D:\\project')
            .then(result => {
              if (!result.success) {
                console.error('打开项目文件夹失败:', result.error);
              }
            });
      }
    };

    return {
      addOrderModalVisible,
      showAddOrderModal,
      handleOrderAdded,
      openResourceFolder,
      openProjectFolder
    };
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100%;
  max-height: 100vh;
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
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--spacing-lg);
}

.top-actions {
  padding: var(--spacing-md);
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid var(--border-color);
}

.add-order-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.content-area {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.action-panel {
  width: 150px;
  min-width: 150px;
  background-color: var(--secondary-bg);
  border-left: 1px solid var(--border-color);
  padding: var(--spacing-md);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}

.action-btn {
  width: 100%;
  text-align: center;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
}

.action-btn:hover {
  background-color: rgba(77, 166, 255, 0.1);
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>