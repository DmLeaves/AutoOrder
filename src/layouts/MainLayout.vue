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
        <div class="top-actions-left">
          <button class="btn btn-secondary settings-btn" @click="showSettings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>设置</span>
          </button>
        </div>
        <div class="top-actions-right">
          <button class="btn btn-primary add-order-btn" @click="showAddOrderModal">
            <span>添加订单</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
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

      <!-- 设置模态窗口 -->
      <SettingsModal
          :visible="settingsModalVisible"
          @close="settingsModalVisible = false"
          @buttons-updated="handleButtonsUpdated"
      />
    </main>

    <!-- Right sidebar / Action panel -->
    <aside class="action-panel">
      <div class="action-buttons">
        <!-- 固定按钮 -->
        <button class="btn btn-secondary action-btn" @click="navigateToStatistics">统计信息</button>
        <button class="btn btn-secondary action-btn">后台管理</button>

        <!-- 自定义按钮 -->
        <button
            v-for="button in customButtons"
            :key="button.id"
            class="btn btn-secondary action-btn"
            @click="openCustomFolder(button.path)"
        >
          {{ button.name }}
        </button>
      </div>
    </aside>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import OrderCategory from '../components/OrderCategory.vue';
import AddOrderModal from '../components/AddOrderModal.vue';
import SettingsModal from '../components/SettingsModal.vue';
import router from "@/router";
import localStorageService from '../services/localStorageService';

export default {
  name: 'MainLayout',
  components: {
    OrderCategory,
    AddOrderModal,
    SettingsModal
  },
  emits: ['category-selected', 'subcategory-selected', 'refresh-data'],
  setup(props, { emit }) {
    const addOrderModalVisible = ref(false);
    const settingsModalVisible = ref(false);
    const customButtons = ref([]);

    // 加载自定义按钮
    const loadCustomButtons = () => {
      customButtons.value = localStorageService.getCustomButtons();
    };

    const showAddOrderModal = () => {
      console.log('显示添加订单模态窗口');
      addOrderModalVisible.value = true;
    };

    const handleOrderAdded = () => {
      // 通知父组件刷新数据
      emit('refresh-data');
    };

    // 显示设置模态窗口
    const showSettings = () => {
      settingsModalVisible.value = true;
    };

    // 处理按钮更新
    const handleButtonsUpdated = (updatedButtons) => {
      customButtons.value = updatedButtons;
    };

    // 打开自定义文件夹
    const openCustomFolder = (folderPath) => {
      if (window.electron && window.electron.files) {
        window.electron.files.openFolder(folderPath)
            .then(result => {
              if (!result.success) {
                console.error('打开文件夹失败:', result.error);
              }
            });
      }
    };

    const navigateToStatistics = () => {
      router.push('/statistics');
    };

    onMounted(() => {
      // 初始化时加载自定义按钮
      loadCustomButtons();
    });

    return {
      addOrderModalVisible,
      settingsModalVisible,
      customButtons,
      showAddOrderModal,
      handleOrderAdded,
      showSettings,
      handleButtonsUpdated,
      openCustomFolder,
      navigateToStatistics
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
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.top-actions-left, .top-actions-right {
  display: flex;
  align-items: center;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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