<template>
  <div class="order-list-container">
    <div class="list-header">
      <h2 class="list-title">订单列表</h2>
      <div class="list-filters">
        <input type="text" class="form-input search-input" placeholder="搜索订单..." v-model="searchQuery" />
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
        <tr v-for="order in filteredOrders" :key="order.id" @click="selectOrder(order)" :class="{'selected-row': selectedOrder && selectedOrder.id === order.id}">
          <td>{{ order.id }}</td>
          <td>{{ order.fee }}</td>
          <td>{{ formatDate(order.startDate) }}</td>
          <td>{{ formatDate(order.endDate) }}</td>
          <td>{{ order.contact }}</td>
          <td>
            <span :class="getStatusClass(order.status)">{{ order.status }}</span>
          </td>
          <td class="remarks-cell">{{ order.remarks }}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon" @click.stop="editOrder(order)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
              <button class="btn-icon" @click.stop="openFolder(order)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
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
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" stroke-width="1">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
      <p>没有找到匹配的订单</p>
    </div>
  </div>
</template>

<script>
import ordersData from '../mock/orders.json';

export default {
  name: 'OrderList',
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
  data() {
    return {
      orders: ordersData.orders,
      selectedOrder: null,
      searchQuery: ''
    };
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders;

      // Filter by category and month if provided
      if (this.category) {
        filtered = filtered.filter(order => order.category === this.category);

        if (this.month) {
          filtered = filtered.filter(order => order.month === this.month);
        }
      }

      // Apply search query filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(order =>
            order.id.toLowerCase().includes(query) ||
            order.contact.toLowerCase().includes(query) ||
            order.remarks.toLowerCase().includes(query) ||
            order.status.toLowerCase().includes(query)
        );
      }

      return filtered;
    }
  },
  methods: {
    selectOrder(order) {
      this.selectedOrder = order;
      this.$emit('order-selected', order);
    },
    editOrder(order) {
      // To be implemented
      console.log('Edit order:', order.id);
    },
    openFolder(order) {
      // In a real app, would open the associated folder
      // using Electron's APIs
      console.log('Open folder for order:', order.id);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN');
    },
    getStatusClass(status) {
      const statusMap = {
        '进行中': 'status-badge status-in-progress',
        '已完成': 'status-badge status-completed',
        '异常': 'status-badge status-abnormal'
      };

      return statusMap[status] || '';
    }
  }
}
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

.order-table td, .order-table th {
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
</style>