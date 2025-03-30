<template>
  <MainLayout
      @category-selected="handleCategorySelected"
      @subcategory-selected="handleSubcategorySelected">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="dashboard-title"><span class="accent-text">订单管理</span>系统</h1>
        <div class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-value accent-text">{{ stats.total }}</div>
            <div class="stat-label">总订单</div>
          </div>
          <div class="stat-card">
            <div class="stat-value accent-cyan">{{ stats.inProgress }}</div>
            <div class="stat-label">进行中</div>
          </div>
          <div class="stat-card">
            <div class="stat-value accent-green">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card">
            <div class="stat-value accent-red">{{ stats.abnormal }}</div>
            <div class="stat-label">异常</div>
          </div>
        </div>
      </div>

      <OrderList
          :category="selectedCategory"
          :month="selectedMonth"
          @order-selected="handleOrderSelected"
      />
    </div>
  </MainLayout>
</template>

<script>
import MainLayout from '../layouts/MainLayout.vue';
import OrderList from '../components/OrderList.vue';
import ordersData from '../mock/orders.json';

export default {
  name: 'Dashboard',
  components: {
    MainLayout,
    OrderList
  },
  data() {
    return {
      selectedCategory: null,
      selectedMonth: null,
      selectedOrder: null
    };
  },
  computed: {
    stats() {
      const orders = ordersData.orders;
      return {
        total: orders.length,
        inProgress: orders.filter(order => order.category === 'in-progress').length,
        completed: orders.filter(order => order.category === 'completed').length,
        abnormal: orders.filter(order => order.category === 'abnormal').length
      };
    }
  },
  methods: {
    handleCategorySelected(category) {
      this.selectedCategory = category;
      this.selectedMonth = null;
    },
    handleSubcategorySelected({ category, month }) {
      this.selectedCategory = category;
      this.selectedMonth = month;
    },
    handleOrderSelected(order) {
      this.selectedOrder = order;
    }
  },
  mounted() {
    // In Vue 3, we need to use a different approach for global events
    // We'll use provide/inject or direct component references
    // For now, we'll just use a simple workaround by adding refs
  }
}
</script>

<style scoped>
.dashboard-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-header {
  margin-bottom: var(--spacing-lg);
}

.dashboard-title {
  font-size: 24px;
  margin-bottom: var(--spacing-md);
}

.accent-text {
  color: var(--accent-blue);
}

.accent-cyan {
  color: var(--accent-cyan);
}

.accent-green {
  color: var(--status-success);
}

.accent-red {
  color: var(--status-error);
}

.dashboard-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.stat-card {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  min-width: 120px;
  flex: 1;
  max-width: 180px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>