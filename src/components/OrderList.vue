<template>
  <div class="order-list-container">
    <div class="list-header">
      <h2 class="list-title">订单列表</h2>
      <div class="list-filters">
        <input
            type="text"
            class="form-input search-input"
            placeholder="搜索订单..."
            v-model="searchQuery"
        />
      </div>
    </div>

    <div class="table-container">
      <table class="order-table">
        <thead>
        <tr>
          <th>订单编号</th>
          <th>开发费</th>
          <th>起始时间</th>
          <th>截止时间</th>
          <th>联系人</th>
          <th>订单状态</th>
          <th>备注</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="order in filteredOrders"
            :key="order.id"
            @click="selectOrder(order)"
            :class="{
              'selected-row': selectedOrder && selectedOrder.id === order.id
            }"
        >
          <td>{{ order.id }}</td>
          <td>{{ order.fee }}</td>
          <td>{{ formatDate(order.startDate) }}</td>
          <!-- 只对“截止时间”这一栏高亮 -->
          <td :class="getEndDateHighlightClass(order)">
            {{ formatDate(order.endDate) }}
          </td>
          <td>{{ order.contact }}</td>
          <td>
            <QuickStatusUpdate
                :order-id="order.id"
                :status="order.status"
                @status-updated="handleStatusUpdated"
            />
          </td>
          <td class="remarks-cell">{{ order.remarks }}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon" @click.stop="editOrder(order)">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                  <path
                      d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                  ></path>
                </svg>
              </button>
              <button class="btn-icon" @click.stop="openFolder(order)">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                  <path
                      d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                  ></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="filteredOrders.length === 0" class="empty-state">
      <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-disabled)"
          stroke-width="1"
      >
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
      <p>没有找到匹配的订单</p>
    </div>

    <!-- 编辑订单模态窗口 -->
    <EditOrderModal
        :visible="editModalVisible"
        :order="orderToEdit"
        @close="handleEditModalClose"
        @order-updated="handleOrderUpdated"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderStore } from '../store';
import QuickStatusUpdate from './QuickStatusUpdate.vue';
import EditOrderModal from './EditOrderModal.vue';

export default {
  name: 'OrderList',
  components: {
    QuickStatusUpdate,
    EditOrderModal
  },
  props: {
    category: {
      type: String,
      default: null
    },
    month: {
      type: String,
      default: null
    }
  },
  emits: ['order-selected', 'refresh-data'],
  setup(props, { emit }) {
    const orderStore = useOrderStore();
    const { orders } = storeToRefs(orderStore);

    const searchQuery = ref('');
    const selectedOrder = ref(null);
    const editModalVisible = ref(false);
    const orderToEdit = ref(null);

    // 过滤后的订单
    const filteredOrders = computed(() => {
      let filtered = orders.value;

      // 如果分类不是 'paid' 则排除掉已收款的订单
      if (props.category !== 'paid') {
        filtered = filtered.filter(order => order.status !== 'paid');
      }

      // 根据 category 和 month 进行二次过滤
      if (props.category) {
        filtered = filtered.filter(order => order.category === props.category);

        if (props.month) {
          filtered = filtered.filter(order => order.month === props.month);
        }
      }

      // 搜索功能
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(order =>
            (order.id && order.id.toLowerCase().includes(query)) ||
            (order.contact && order.contact.toLowerCase().includes(query)) ||
            (order.remarks && order.remarks.toLowerCase().includes(query)) ||
            (order.status && order.status.toLowerCase().includes(query))
        );
      }

      return filtered;
    });

    // 点击行，选中订单
    const selectOrder = (order) => {
      selectedOrder.value = order;
      emit('order-selected', order);
    };

    // 编辑订单
    const editOrder = async (order) => {
      orderToEdit.value = order;
      editModalVisible.value = true;
    };

    // 关闭编辑订单模态
    const handleEditModalClose = () => {
      editModalVisible.value = false;
      orderToEdit.value = null;
    };

    // 刷新
    const handleOrderUpdated = () => {
      emit('refresh-data');
    };
    const handleStatusUpdated = () => {
      emit('refresh-data');
    };

    // 打开对应订单的文件夹
    const openFolder = (order) => {
      if (window.electron && window.electron.files) {
        const folderPath = 'D:\\收纳\\临时桌面\\工作资源文件\\' + order.id;
        window.electron.files.openFolder(folderPath).then(result => {
          if (!result.success) {
            console.error('打开文件夹失败:', result.error);
          }
        });
      }
    };

    // 将日期转为本地时间字符串
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('zh-CN');
    };

    // 根据订单状态获取样式（此处未使用，可按需保留或移除）
    const getStatusClass = (status) => {
      if (!status) return '';
      const statusMap = {
        'in-progress': 'status-badge status-in-progress',
        'completed': 'status-badge status-completed',
        'abnormal': 'status-badge status-abnormal'
      };
      return statusMap[status] || '';
    };

    // ★★★ 核心：根据截止日期与当前日期的天数差，为“截止时间”栏位添加不同程度的高亮
    const getEndDateHighlightClass = (order) => {
      // 只有订单状态为 in-progress 时才需要警示
      if (order.status !== '进行中') {
        return '';
      }


      const now = new Date();
      const end = new Date(order.endDate);
      if (!end.getTime()) {
        // 如果没有有效的截止日期
        return '';
      }

      // 计算剩余天数
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // 剩余 5 天或以内进入警示区
      if (diffDays <= 0) {
        // 已经过期/到期
        return 'warning-level-3';
      } else if (diffDays <= 1) {
        return 'warning-level-3';
      } else if (diffDays <= 2) {
        return 'warning-level-2';
      } else if (diffDays <= 5) {
        return 'warning-level-1';
      } else {
        return '';
      }
    };

    return {
      filteredOrders,
      searchQuery,
      selectedOrder,
      editModalVisible,
      orderToEdit,
      selectOrder,
      editOrder,
      openFolder,
      formatDate,
      getStatusClass,
      getEndDateHighlightClass,
      handleEditModalClose,
      handleOrderUpdated,
      handleStatusUpdated
    };
  }
};
</script>

<style scoped>
.order-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.list-title {
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
}

.list-filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.search-input {
  width: 250px;
  max-width: 100%;
}

.table-container {
  flex: 1;
  overflow: auto;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.order-table th {
  position: sticky;
  top: 0;
  background-color: var(--tertiary-bg);
  z-index: 1;
}

.order-table th:first-child {
  width: 100px;
}

.order-table th:nth-child(2) {
  width: 80px;
}

.order-table th:nth-child(3),
.order-table th:nth-child(4) {
  width: 120px;
}

.order-table th:nth-child(5) {
  width: 100px;
}

.order-table th:nth-child(6) {
  width: 100px;
}

.order-table th:last-child {
  width: 100px;
}

.order-table td,
.order-table th {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.order-table tr {
  transition: background-color var(--transition-fast);
  cursor: pointer;
}

.order-table tr:hover {
  background-color: rgba(77, 166, 255, 0.05);
}

.selected-row {
  background-color: rgba(77, 166, 255, 0.1) !important;
}

.remarks-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--accent-blue);
  border-color: var(--accent-blue);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-disabled);
}

.empty-state svg {
  margin-bottom: var(--spacing-md);
}

.warning-level-1 {
  color: #ff9800; /* 橙色 */
}
.warning-level-2 {
  color: #ff5722; /* 较为鲜艳 */
  font-weight: bold;
}
.warning-level-3 {
  color: #ff0000; /* 最明显的红色 */
  font-weight: bold;
}
</style>
