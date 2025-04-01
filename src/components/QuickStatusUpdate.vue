<template>
  <div class="status-dropdown-container">
    <div @click="toggleDropdown" :class="['status-badge', `status-${getStatusClass}`]">
      {{ statusDisplay }}
    </div>

    <div v-if="isOpen" class="status-dropdown">
      <div
          v-for="option in statusOptions"
          :key="option.value"
          class="status-option"
          :class="{ active: currentStatus === option.value }"
          @click="selectStatus(option.value)"
      >
        <span :class="['status-indicator', `status-${option.class}`]"></span>
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useOrderStore } from '../store';

export default {
  name: 'QuickStatusUpdate',
  props: {
    orderId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    }
  },
  emits: ['status-updated'],
  setup(props, { emit }) {
    const orderStore = useOrderStore();
    const isOpen = ref(false);
    const currentStatus = ref('');

    // 状态映射对象 - 处理可能的中文状态或其他格式
    const statusMapping = {
      // 英文ID到英文ID的映射（直接返回）
      'in-progress': 'in-progress',
      'completed': 'completed',
      'abnormal': 'abnormal',
      'paid': 'paid',
      // 中文到英文的映射
      '进行中': 'in-progress',
      '已完成': 'completed',
      '异常': 'abnormal',
      '已收款': 'paid'
    };

    // 状态选项
    const statusOptions = [
      { value: 'in-progress', label: '进行中', class: 'in-progress' },
      { value: 'completed', label: '已完成', class: 'completed' },
      { value: 'abnormal', label: '异常', class: 'abnormal' },
      { value: 'paid', label: '已收款', class: 'paid' }
    ];

    // 初始化并且监听status变化
    watch(() => props.status, (newStatus) => {
      // 映射状态值，如果映射不存在则默认为"in-progress"
      currentStatus.value = statusMapping[newStatus] || 'in-progress';
      console.log('状态已映射:', newStatus, '->', currentStatus.value);
    }, { immediate: true });

    // 状态显示文本
    const statusDisplay = computed(() => {
      const option = statusOptions.find(opt => opt.value === currentStatus.value);
      return option ? option.label : '未知';
    });

    // 状态CSS类
    const getStatusClass = computed(() => {
      const option = statusOptions.find(opt => opt.value === currentStatus.value);
      return option ? option.class : '';
    });

    // 切换下拉菜单
    const toggleDropdown = (e) => {
      e.stopPropagation();
      isOpen.value = !isOpen.value;
    };

    // 选择状态
    const selectStatus = async (status) => {
      if (status === currentStatus.value) {
        isOpen.value = false;
        return;
      }

      try {
        // 获取订单详情
        const order = await orderStore.fetchOrderById(props.orderId);
        if (!order) throw new Error('获取订单详情失败');

        // 根据新状态确定分类
        const category = status;

        // 准备更新数据
        const orderData = {
          ...order,
          status,
          category
        };

        // 更新订单
        await orderStore.updateOrder(props.orderId, orderData);

        // 更新本地状态
        currentStatus.value = status;

        // 发出更新事件
        emit('status-updated', { id: props.orderId, status });
      } catch (error) {
        console.error('更新订单状态失败:', error);
      } finally {
        isOpen.value = false;
      }
    };

    // 点击外部关闭下拉菜单
    const handleClickOutside = (e) => {
      if (isOpen.value) {
        isOpen.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      isOpen,
      currentStatus,
      statusOptions,
      statusDisplay,
      getStatusClass,
      toggleDropdown,
      selectStatus
    };
  }
};
</script>

<style scoped>
.status-dropdown-container {
  position: relative;
  display: inline-block;
}

.status-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  min-width: 120px;
  background-color: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--card-shadow);
  z-index: 10;
  overflow: hidden;
}

.status-option {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--text-primary);
  transition: background-color var(--transition-fast);
}

.status-option:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.status-option.active {
  background-color: rgba(77, 166, 255, 0.1);
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-indicator.status-in-progress {
  background-color: var(--accent-blue);
}

.status-indicator.status-completed {
  background-color: var(--status-success);
}

.status-indicator.status-abnormal {
  background-color: var(--status-error);
}

.status-badge {
  cursor: pointer;
  user-select: none;
}
</style>