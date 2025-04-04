<template>
  <StatisticsLayout>
    <div class="statistics-container">
      <h1 class="page-title">数据<span class="accent-text">仪表盘</span></h1>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载统计数据中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="fetchDashboardStats">重新加载</button>
      </div>

      <!-- 数据内容 -->
      <template v-else>
        <!-- 指标卡片区域 -->
        <div class="metrics-row">
          <!-- 完成度 -->
          <div class="metric-card">
            <GradientDonutChart
                :value="statsData.completion_rate"
                :start-color="'#11be1a'"
                :end-color="'#4da6ff'"
                :size="120"
                :thickness="12"
            />
            <div class="metric-label">完成度</div>
          </div>

          <!-- 异常率 -->
          <div class="metric-card">
            <DonutChart
                :value="statsData.anomaly_rate"
                :color="'var(--status-error)'"
                :size="120"
                :thickness="12"
            />
            <div class="metric-label">异常率</div>
          </div>

          <!-- 总收款金额 -->
          <div class="metric-card wide-card">
            <div class="total-amount">
              <span class="amount-currency">¥</span>
              <span class="amount-value">{{ formatCurrency(statsData.total_collection) }}</span>
            </div>
            <div class="metric-label">总收款金额</div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="charts-container">
          <!-- 月收入图表 -->
          <div class="chart-card">
            <h3 class="chart-title">月份收入折线图</h3>
            <div class="chart-area">
              <LineChart
                  :chartData="monthlyIncomeChartData"
                  :color="'var(--accent-blue)'"
                  chartId="income-chart"
              />
            </div>
          </div>

          <!-- 月订单数量图表 -->
          <div class="chart-card">
            <h3 class="chart-title">接单数量折线图</h3>
            <div class="chart-area">
              <LineChart
                  :chartData="monthlyOrdersChartData"
                  :color="'var(--accent-purple)'"
                  chartId="orders-chart"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </StatisticsLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import StatisticsLayout from '../layouts/StatisticsLayout.vue';
import DonutChart from '../components/charts/DonutChart.vue';
import LineChart from '../components/charts/LineChart.vue';
import GradientDonutChart from '../components/charts/GradientDonutChart.vue';
import api from '../services/api';

export default {
  name: 'Statistics',
  components: {
    StatisticsLayout,
    DonutChart,
    LineChart,
    GradientDonutChart
  },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const statsData = ref({
      completion_rate: 0,
      anomaly_rate: 0,
      total_collection: 0,
      monthly_income: [],
      monthly_orders: []
    });

    // 格式化货币，添加千位分隔符
    const formatCurrency = (value) => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 获取仪表盘统计数据
    const fetchDashboardStats = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await api.statistics.getDashboardStats();
        statsData.value = response.data;
        console.log('Dashboard stats loaded:', statsData.value);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        error.value = '获取统计数据失败，请稍后再试';
      } finally {
        loading.value = false;
      }
    };

    // 准备月收入图表数据
    const monthlyIncomeChartData = computed(() => {
      if (!statsData.value.monthly_income || !statsData.value.monthly_income.length) {
        return {
          labels: [],
          datasets: [{
            label: '月收入',
            data: [],
            borderColor: 'var(--accent-blue)',
            backgroundColor: 'rgba(77, 166, 255, 0.1)',
            tension: 0.4,
            fill: true
          }]
        };
      }

      return {
        labels: statsData.value.monthly_income.map(item => {
          const [month, year] = item.month.split('-');
          return `${month}月`;
        }),
        datasets: [
          {
            label: '月收入',
            data: statsData.value.monthly_income.map(item => item.amount),
            borderColor: 'var(--accent-blue)',
            backgroundColor: 'rgba(77, 166, 255, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    });

    // 准备月订单数图表数据
    const monthlyOrdersChartData = computed(() => {
      if (!statsData.value.monthly_orders || !statsData.value.monthly_orders.length) {
        return {
          labels: [],
          datasets: [{
            label: '订单数量',
            data: [],
            borderColor: 'var(--accent-purple)',
            backgroundColor: 'rgba(123, 93, 250, 0.1)',
            tension: 0.4,
            fill: true
          }]
        };
      }

      return {
        labels: statsData.value.monthly_orders.map(item => {
          const [month, year] = item.month.split('-');
          return `${month}月`;
        }),
        datasets: [
          {
            label: '订单数量',
            data: statsData.value.monthly_orders.map(item => item.count),
            borderColor: 'var(--accent-purple)',
            backgroundColor: 'rgba(123, 93, 250, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    });

    onMounted(() => {
      fetchDashboardStats();
    });

    return {
      loading,
      error,
      statsData,
      formatCurrency,
      fetchDashboardStats,
      monthlyIncomeChartData,
      monthlyOrdersChartData
    };
  }
}
</script>

<style scoped>
.statistics-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: var(--spacing-md);
}

.page-title {
  font-size: 28px;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.accent-text {
  color: var(--accent-blue);
}

.metrics-row {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  width: 100%;
}

.metric-card {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: var(--accent-blue);
}

.wide-card {
  flex: 2;
  min-width: 250px;
}

.metric-label {
  font-size: 16px;
  color: var(--text-secondary);
  margin-top: var(--spacing-md);
  font-weight: 500;
}

.total-amount {
  font-size: 42px;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: baseline;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

.amount-currency {
  font-size: 28px;
  margin-right: var(--spacing-xs);
}

.charts-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--spacing-lg);
  width: 100%;
  overflow: hidden;
}

.chart-card {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: var(--accent-blue);
}

.chart-title {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-weight: 500;
  text-align: center;
}

.chart-area {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 200px;
}

/* 加载中状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 50px;
  height: 50px;
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
  height: 70vh;
}

.error-message {
  color: var(--status-error);
  margin-bottom: var(--spacing-lg);
  font-size: 16px;
}

@media (min-width: 1200px) {
  .charts-container {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .metrics-row {
    flex-direction: column;
  }
}
</style>