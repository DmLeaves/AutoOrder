<template>
  <MainLayout
      @category-selected="handleCategorySelected"
      @subcategory-selected="handleSubcategorySelected"
      @refresh-data="fetchData">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="dashboard-title"><span class="accent-text">订单管理</span>系统</h1>
        <div class="dashboard-stats">
          <!-- 总订单卡片 - 固定显示 -->
          <div class="stat-card clickable" @click="filterByCategory(null)">
            <div class="stat-value accent-text">{{ getTotalOrderCount }}</div>
            <div class="stat-label">总订单</div>
          </div>
          <div
              v-for="category in categories"
              :key="category.value"
              class="stat-card clickable"
              @click="filterByCategory(category.value)"
          >
            <div :class="getCategoryClass(category.value)">{{ getCategoryCount(category.value) }}</div>
            <div class="stat-label">{{ category.name }}</div>
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
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderStore } from '../store';
import MainLayout from '../layouts/MainLayout.vue';
import OrderList from '../components/OrderList.vue';

export default {
  name: 'Dashboard',
  components: {
    MainLayout,
    OrderList
  },
  setup() {
    const orderStore = useOrderStore();
    const { orders, categories, loading, error } = storeToRefs(orderStore);

    const selectedCategory = ref(null);
    const selectedMonth = ref(null);
    const selectedOrder = ref(null);

    // 计算总订单数
    const getTotalOrderCount = computed(() => {
      return orders.value.length;
    });

    // 根据分类获取订单数量
    const getCategoryCount = (categoryValue) => {
      return orders.value.filter(order => order.category === categoryValue).length;
    };

    // 根据分类获取样式类名
    const getCategoryClass = (categoryValue) => {
      const classMap = {
        'in-progress': 'stat-value accent-cyan',
        'completed': 'stat-value accent-green',
        'abnormal': 'stat-value accent-red'
      };

      return classMap[categoryValue] || 'stat-value'; // 默认白色
    };

    const fetchData = async () => {
      // 获取订单数据
      await orderStore.fetchOrders();

      // 如果分类尚未加载，也加载分类数据
      if (categories.value.length === 0) {
        await orderStore.fetchCategories();
      }
    };

    const handleCategorySelected = (category) => {
      selectedCategory.value = category;
      selectedMonth.value = null;
    };

    const handleSubcategorySelected = ({ category, month }) => {
      selectedCategory.value = category;
      selectedMonth.value = month;
    };

    const handleOrderSelected = (order) => {
      selectedOrder.value = order;
    };

    const filterByCategory = (category) => {
      selectedCategory.value = category;
      selectedMonth.value = null;
    };

    onMounted(() => {
      fetchData();
    });

    return {
      loading,
      error,
      categories,
      selectedCategory,
      selectedMonth,
      selectedOrder,
      fetchData,
      handleCategorySelected,
      handleSubcategorySelected,
      handleOrderSelected,
      getTotalOrderCount,
      getCategoryCount,
      getCategoryClass,
      filterByCategory
    };
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

.stat-card.clickable {
  cursor: pointer;
  transition: all var(--transition-normal);
}

.stat-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  border-color: var(--accent-blue);
}
</style>