<template>
  <StatisticsLayout>
    <div class="calculator-container">
      <h1 class="page-title">快捷<span class="accent-text">计算</span></h1>

      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载订单数据中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="fetchOrderData">重新加载</button>
      </div>

      <!-- 数据内容 -->
      <template v-else>
        <!-- 结果展示区域 -->
        <div class="result-card">
          <div class="result-header">
            <h3>筛选结果</h3>
            <div class="filter-pills">
              <div class="filter-pill">{{ selectedMonth || '全部月份' }}</div>
              <div class="filter-pill">{{ getStatusLabel(selectedStatus) }}</div>
            </div>
          </div>
          <div class="result-body">
            <div class="big-number">
              <span class="currency">¥</span>
              <span>{{ formatCurrency(calculatedTotal) }}</span>
            </div>
            <div class="result-label">订单总额</div>
          </div>
          <div class="result-footer">
            <div class="stat-item">
              <div class="stat-value">{{ filteredOrders.length }}</div>
              <div class="stat-label">订单数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ calculateAverageFee(filteredOrders) }}</div>
              <div class="stat-label">平均单价</div>
            </div>
          </div>
        </div>

        <!-- 月份筛选 -->
        <div class="filter-section">
          <h3 class="section-title">月份筛选</h3>
          <div class="filter-cards">
            <div
                v-for="month in availableMonths"
                :key="month"
                :class="['filter-card', { active: selectedMonth === month }]"
                @click="toggleMonthFilter(month)"
            >
              {{ month }}
            </div>
            <div
                :class="['filter-card', { active: selectedMonth === null }]"
                @click="toggleMonthFilter(null)"
            >
              全部
            </div>
          </div>
        </div>

        <!-- 状态筛选 -->
        <div class="filter-section">
          <h3 class="section-title">状态筛选</h3>
          <div class="filter-cards">
            <div
                v-for="status in availableStatuses"
                :key="status"
                :class="['filter-card', { active: selectedStatus === status }, `status-${status}`]"
                @click="toggleStatusFilter(status)"
            >
              {{ getStatusLabel(status) }}
            </div>
            <div
                :class="['filter-card', { active: selectedStatus === null }]"
                @click="toggleStatusFilter(null)"
            >
              全部状态
            </div>
          </div>
        </div>

        <!-- 订单明细 -->
        <div class="orders-section">
          <h3 class="section-title">订单明细 ({{ filteredOrders.length }})</h3>
          <div class="orders-table-container">
            <table class="orders-table">
              <thead>
              <tr>
                <th>订单ID</th>
                <th>金额</th>
                <th>联系人</th>
                <th>开始日期</th>
                <th>状态</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="order in filteredOrders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>¥{{ formatNumber(order.fee) }}</td>
                <td>{{ order.contact }}</td>
                <td>{{ formatDate(order.startDate) }}</td>
                <td>
                    <span :class="['status-badge', `status-${order.status}`]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="5" class="empty-message">无符合条件的订单</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </StatisticsLayout>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import StatisticsLayout from '../layouts/StatisticsLayout.vue';
import api from '../services/api';

export default {
  name: 'Calculator',
  components: {
    StatisticsLayout
  },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const orderData = ref([]);

    // 筛选条件
    const selectedMonth = ref(null);
    const selectedStatus = ref('completed');

    // 状态标签映射
    const statusLabels = {
      'completed': '已完成',
      'in-progress': '进行中',
      'abnormal': '异常',
      'paid': '已支付'
    };

    // 获取订单数据（最近三个月）
    const fetchOrderData = async () => {
      loading.value = true;
      error.value = null;
      orderData.value = [];

      try {
        // 获取当前日期
        const now = new Date();

        // 获取最近三个月的数据
        const months = [];
        for (let i = 0; i < 3; i++) {
          const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const year = targetDate.getFullYear();
          const month = targetDate.getMonth() + 1;
          months.push({ year, month });
        }

        // 批量获取数据
        const requests = months.map(({ year, month }) =>
            api.statistics.getMonthlyOrders(year, month)
                .then(response => response.data)
                .catch(err => {
                  console.warn(`Error fetching data for ${year}-${month}:`, err);
                  return []; // 出错时返回空数组，不中断其他请求
                })
        );

        const results = await Promise.all(requests);

        // 合并所有数据
        const allOrders = results.flat();

        // 将金额确保为数字类型
        allOrders.forEach(order => {
          if (order.fee && typeof order.fee === 'string') {
            order.fee = parseFloat(order.fee);
          }
        });

        // 按开始日期降序排序
        allOrders.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        orderData.value = allOrders;

        // 设置默认选中当前月份
        if (allOrders.length > 0) {
          const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
          if (availableMonths.value.includes(currentMonth)) {
            selectedMonth.value = currentMonth;
          } else {
            selectedMonth.value = availableMonths.value[0]; // 默认选第一个月
          }
        }
      } catch (err) {
        console.error('Error fetching orders data:', err);
        error.value = '获取订单数据失败，请稍后再试';
      } finally {
        loading.value = false;
      }
    };

    // 根据订单数据计算可用的月份
    const availableMonths = computed(() => {
      if (!orderData.value || orderData.value.length === 0) return [];

      // 使用Set去重
      const monthsSet = new Set();

      orderData.value.forEach(order => {
        if (order.startDate) {
          const date = new Date(order.startDate);
          const monthStr = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthsSet.add(monthStr);
        }
      });

      return Array.from(monthsSet).sort().reverse(); // 降序排列
    });

    // 根据订单数据计算可用的状态
    const availableStatuses = computed(() => {
      if (!orderData.value || orderData.value.length === 0) return [];

      // 使用Set去重
      const statusesSet = new Set();

      orderData.value.forEach(order => {
        if (order.status) {
          statusesSet.add(order.status);
        }
      });

      return Array.from(statusesSet);
    });

    // 根据筛选条件过滤订单
    const filteredOrders = computed(() => {
      if (!orderData.value || orderData.value.length === 0) return [];

      return orderData.value.filter(order => {
        // 月份筛选
        let monthMatch = true;
        if (selectedMonth.value) {
          const date = new Date(order.startDate);
          const orderMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthMatch = orderMonth === selectedMonth.value;
        }

        // 状态筛选
        let statusMatch = true;
        if (selectedStatus.value) {
          statusMatch = order.status === selectedStatus.value;
        }

        return monthMatch && statusMatch;
      });
    });

    // 计算过滤后订单的总额
    const calculatedTotal = computed(() => {
      if (!filteredOrders.value || filteredOrders.value.length === 0) return 0;

      let total = 0;

      filteredOrders.value.forEach(order => {
        // 确保fee是数字
        const fee = typeof order.fee === 'number' ? order.fee :
            (typeof order.fee === 'string' ? parseFloat(order.fee) : 0);

        total += fee || 0;
      });

      return total;
    });

    // 计算平均单价
    const calculateAverageFee = (orders) => {
      if (!orders || orders.length === 0) return '0.00';

      let total = 0;

      orders.forEach(order => {
        const fee = typeof order.fee === 'number' ? order.fee :
            (typeof order.fee === 'string' ? parseFloat(order.fee) : 0);

        total += fee || 0;
      });

      const average = total / orders.length;

      return formatNumber(average);
    };

    // 格式化数字为千分位
    const formatNumber = (num) => {
      // 确保num是一个数字
      if (typeof num !== 'number' || isNaN(num)) {
        num = 0;
      }

      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 格式化货币
    const formatCurrency = (num) => {
      return formatNumber(num);
    };

    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '';

      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // 获取状态标签
    const getStatusLabel = (status) => {
      return statusLabels[status] || status || '全部状态';
    };

    // 切换月份筛选
    const toggleMonthFilter = (month) => {
      selectedMonth.value = month;
    };

    // 切换状态筛选
    const toggleStatusFilter = (status) => {
      selectedStatus.value = status;
    };

    // 打印调试信息
    watch(calculatedTotal, (newValue) => {
      console.log('计算总额:', newValue);
    });

    watch(filteredOrders, (newValue) => {
      console.log('过滤后订单数量:', newValue.length);
      if (newValue.length > 0) {
        console.log('示例订单:', newValue[0]);
      }
    });

    onMounted(() => {
      fetchOrderData();
    });

    return {
      loading,
      error,
      orderData,
      selectedMonth,
      selectedStatus,
      availableMonths,
      availableStatuses,
      filteredOrders,
      calculatedTotal,
      calculateAverageFee,
      formatNumber,
      formatCurrency,
      formatDate,
      getStatusLabel,
      toggleMonthFilter,
      toggleStatusFilter,
      fetchOrderData
    };
  }
}
</script>

<style scoped>
.calculator-container {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.page-title {
  font-size: 28px;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.accent-text {
  color: var(--accent-blue);
}

/* 结果卡片 */
.result-card {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.filter-pills {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-pill {
  background-color: var(--tertiary-bg);
  color: var(--text-secondary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.result-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.big-number {
  font-size: 48px;
  font-weight: 700;
  color: var(--accent-cyan);
  display: flex;
  align-items: baseline;
  margin-bottom: var(--spacing-xs);
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

.currency {
  font-size: 28px;
  margin-right: var(--spacing-xs);
}

.result-label {
  font-size: 16px;
  color: var(--text-secondary);
}

.result-footer {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 筛选部分 */
.filter-section {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

.section-title {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
  font-size: 18px;
  font-weight: 500;
}

.filter-cards {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.filter-card {
  background-color: var(--tertiary-bg);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
}

.filter-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--accent-blue);
}

.filter-card.active {
  background-color: var(--accent-blue);
  color: white;
  font-weight: 500;
  border-color: var(--accent-blue);
}

/* 状态样式 */
.filter-card.status-completed.active {
  background-color: var(--status-success);
  border-color: var(--status-success);
}

.filter-card.status-in-progress.active {
  background-color: var(--accent-blue);
  border-color: var(--accent-blue);
}

.filter-card.status-abnormal.active {
  background-color: var(--status-error);
  border-color: var(--status-error);
}

.filter-card.status-paid.active {
  background-color: var(--accent-purple);
  border-color: var(--accent-purple);
}

/* 订单表格 */
.orders-section {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

.orders-table-container {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.orders-table th {
  color: var(--text-secondary);
  font-weight: 500;
  background-color: var(--tertiary-bg);
}

.orders-table tr:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-completed {
  background-color: rgba(0, 230, 118, 0.2);
  color: var(--status-success);
  border: 1px solid var(--status-success);
}

.status-badge.status-in-progress {
  background-color: rgba(77, 166, 255, 0.2);
  color: var(--accent-blue);
  border: 1px solid var(--accent-blue);
}

.status-badge.status-abnormal {
  background-color: rgba(255, 23, 68, 0.2);
  color: var(--status-error);
  border: 1px solid var(--status-error);
}

.status-badge.status-paid {
  background-color: rgba(123, 93, 250, 0.2);
  color: var(--accent-purple);
  border: 1px solid var(--accent-purple);
}

.empty-message {
  text-align: center;
  color: var(--text-disabled);
  font-style: italic;
}

/* 加载中状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(77, 166, 255, 0.2);
  border-top: 3px solid var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.error-message {
  color: var(--status-error);
  margin-bottom: var(--spacing-lg);
  font-size: 16px;
}

@media (max-width: 768px) {
  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-footer {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>