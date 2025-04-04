<template>
  <StatisticsLayout>
    <div class="export-container">
      <h1 class="page-title">快捷<span class="accent-text">导出</span></h1>

      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载订单数据中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="fetchCompletedOrders">重新加载</button>
      </div>

      <!-- 数据内容 -->
      <template v-else>
        <!-- 联系人卡片区域 -->
        <div class="contact-section">
          <h3 class="section-title">按联系人分组 ({{ Object.keys(groupedOrders).length }})</h3>

          <div class="contact-cards">
            <div
                v-for="(orders, contact) in groupedOrders"
                :key="contact"
                :class="['contact-card', { active: selectedContact === contact }]"
                @click="selectContact(contact)"
            >
              <div class="contact-name">{{ contact }}</div>
              <div class="order-count">{{ orders.length }} 个订单</div>
              <div class="total-amount">¥{{ calculateTotalAmount(orders) }}</div>
            </div>
          </div>
        </div>

        <!-- 订单详情区域 -->
        <div v-if="selectedContact" class="orders-detail-card">
          <div class="detail-header">
            <h3>{{ selectedContact }} 的订单</h3>
            <div class="actions">
              <button class="btn btn-primary copy-btn" @click="copyOrderIds">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>复制订单号</span>
              </button>
            </div>
          </div>

          <div class="id-list">
            <div class="id-chips">
              <div
                  v-for="order in getSelectedContactOrders()"
                  :key="order.id"
                  class="id-chip"
              >
                {{ order.id }}
                <span class="fee-badge">¥{{ formatNumber(order.fee) }}</span>
              </div>
            </div>
          </div>

          <div class="summary-section">
            <div class="summary-item">
              <div class="summary-label">订单数量</div>
              <div class="summary-value">{{ getSelectedContactOrders().length }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">总金额</div>
              <div class="summary-value accent-text">¥{{ calculateTotalAmount(getSelectedContactOrders()) }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">平均单价</div>
              <div class="summary-value">¥{{ calculateAverageAmount(getSelectedContactOrders()) }}</div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-selection">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" stroke-width="1">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          <p>请选择一位联系人查看订单详情</p>
        </div>

        <!-- 复制成功提示 -->
        <div v-if="showCopySuccess" class="copy-success-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>订单ID已复制到剪贴板</span>
        </div>
      </template>
    </div>
  </StatisticsLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import StatisticsLayout from '../layouts/StatisticsLayout.vue';
import api from '../services/api';

export default {
  name: 'Export',
  components: {
    StatisticsLayout
  },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const completedOrders = ref([]);
    const selectedContact = ref(null);
    const showCopySuccess = ref(false);

    // 根据联系人分组订单
    const groupedOrders = computed(() => {
      if (!completedOrders.value || completedOrders.value.length === 0) {
        return {};
      }

      const grouped = {};

      completedOrders.value.forEach(order => {
        const contact = order.contact || '未指定';

        if (!grouped[contact]) {
          grouped[contact] = [];
        }

        grouped[contact].push(order);
      });

      return grouped;
    });

    // 获取所有已完成的订单
    const fetchCompletedOrders = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await api.statistics.getCompletedOrders();
        completedOrders.value = response.data;

        // 金额转换为数字
        completedOrders.value.forEach(order => {
          if (order.fee && typeof order.fee === 'string') {
            order.fee = parseFloat(order.fee);
          }
        });

        console.log('Completed orders loaded:', completedOrders.value.length);
      } catch (err) {
        console.error('Error fetching completed orders:', err);
        error.value = '获取订单数据失败，请稍后再试';
      } finally {
        loading.value = false;
      }
    };

    // 选择联系人
    const selectContact = (contact) => {
      selectedContact.value = contact;

      // 自动复制订单ID
      copyOrderIds();
    };

    // 获取选中联系人的订单
    const getSelectedContactOrders = () => {
      if (!selectedContact.value || !groupedOrders.value[selectedContact.value]) {
        return [];
      }

      return groupedOrders.value[selectedContact.value];
    };

    // 计算订单总金额
    const calculateTotalAmount = (orders) => {
      if (!orders || orders.length === 0) return '0.00';

      const total = orders.reduce((sum, order) => {
        const fee = typeof order.fee === 'number' ? order.fee :
            (typeof order.fee === 'string' ? parseFloat(order.fee) : 0);

        return sum + (fee || 0);
      }, 0);

      return formatNumber(total);
    };

    // 计算平均金额
    const calculateAverageAmount = (orders) => {
      if (!orders || orders.length === 0) return '0.00';

      const total = orders.reduce((sum, order) => {
        const fee = typeof order.fee === 'number' ? order.fee :
            (typeof order.fee === 'string' ? parseFloat(order.fee) : 0);

        return sum + (fee || 0);
      }, 0);

      const average = total / orders.length;

      return formatNumber(average);
    };

    // 格式化数字
    const formatNumber = (num) => {
      if (typeof num !== 'number' || isNaN(num)) {
        num = 0;
      }

      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 复制订单ID到剪贴板
    const copyOrderIds = () => {
      if (!selectedContact.value) return;

      const orders = getSelectedContactOrders();
      if (orders.length === 0) return;

      // 生成订单ID文本
      const orderIdText = orders.map(order => order.id).join(', ');

      // 复制到剪贴板
      navigator.clipboard.writeText(orderIdText)
          .then(() => {
            // 显示成功提示
            showCopySuccess.value = true;

            // 3秒后隐藏提示
            setTimeout(() => {
              showCopySuccess.value = false;
            }, 3000);
          })
          .catch(err => {
            console.error('复制失败:', err);
          });
    };

    onMounted(() => {
      fetchCompletedOrders();
    });

    return {
      loading,
      error,
      completedOrders,
      groupedOrders,
      selectedContact,
      showCopySuccess,
      selectContact,
      getSelectedContactOrders,
      calculateTotalAmount,
      calculateAverageAmount,
      formatNumber,
      copyOrderIds,
      fetchCompletedOrders
    };
  }
}
</script>

<style scoped>
.export-container {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: relative;
}

.page-title {
  font-size: 28px;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.accent-text {
  color: var(--accent-blue);
}

/* 联系人卡片区域 */
.contact-section {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

.section-title {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 18px;
  font-weight: 500;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.contact-card {
  background-color: var(--tertiary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: var(--accent-blue);
}

.contact-card.active {
  background-color: rgba(77, 166, 255, 0.15);
  border-color: var(--accent-blue);
}

.contact-name {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.total-amount {
  font-size: 16px;
  font-weight: 500;
  color: var(--accent-cyan);
  margin-top: var(--spacing-xs);
}

/* 订单详情卡片 */
.orders-detail-card {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.id-list {
  background-color: var(--tertiary-bg);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
}

.id-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.id-chip {
  background-color: rgba(77, 166, 255, 0.15);
  border: 1px solid var(--accent-blue);
  border-radius: var(--border-radius-sm);
  padding: 4px 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.fee-badge {
  background-color: var(--accent-blue);
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
}

.summary-section {
  display: flex;
  justify-content: space-between;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.summary-value {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.summary-value.accent-text {
  color: var(--accent-cyan);
}

/* 空状态 */
.empty-selection {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
  min-height: 200px;
}

.empty-selection svg {
  margin-bottom: var(--spacing-md);
  opacity: 0.7;
}

/* 复制成功提示 */
.copy-success-toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--status-success);
  color: white;
  padding: 12px 20px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.3s ease, fadeOut 0.3s ease 2.7s;
  z-index: 1000;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
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
  .contact-cards {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .summary-section {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }
}
</style>