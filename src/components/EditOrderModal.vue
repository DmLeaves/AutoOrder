<template>
  <div class="modal-backdrop" v-if="visible" @click="closeIfOutside">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">编辑订单</h3>
        <button class="close-button" @click="close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">订单编号 <span class="required">*</span></label>
              <input
                  type="text"
                  class="form-input"
                  v-model="formData.id"
                  :class="{ 'invalid': validationErrors.id }"
                  disabled
              >
              <div v-if="validationErrors.id" class="error-message">{{ validationErrors.id }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">开发费 <span class="required">*</span></label>
              <input
                  type="number"
                  class="form-input"
                  v-model.number="formData.fee"
                  :class="{ 'invalid': validationErrors.fee }"
                  placeholder="例如: 1000"
              >
              <div v-if="validationErrors.fee" class="error-message">{{ validationErrors.fee }}</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">开始日期 <span class="required">*</span></label>
              <input
                  type="date"
                  class="form-input"
                  v-model="formData.startDate"
                  :class="{ 'invalid': validationErrors.startDate }"
              >
              <div v-if="validationErrors.startDate" class="error-message">{{ validationErrors.startDate }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">截止日期 <span class="required">*</span></label>
              <input
                  type="date"
                  class="form-input"
                  v-model="formData.endDate"
                  :class="{ 'invalid': validationErrors.endDate }"
              >
              <div v-if="validationErrors.endDate" class="error-message">{{ validationErrors.endDate }}</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">联系人 <span class="required">*</span></label>
              <input
                  type="text"
                  class="form-input"
                  v-model="formData.contact"
                  :class="{ 'invalid': validationErrors.contact }"
                  placeholder="例如: 张三"
              >
              <div v-if="validationErrors.contact" class="error-message">{{ validationErrors.contact }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">订单状态 <span class="required">*</span></label>
              <select
                  class="form-input"
                  v-model="formData.status"
                  :class="{ 'invalid': validationErrors.status }"
              >
                <option value="">请选择状态</option>
                <option value="进行中">进行中</option>
                <option value="已完成">已完成</option>
                <option value="异常">异常</option>
                <option value="已收款">已收款</option>
              </select>
              <div v-if="validationErrors.status" class="error-message">{{ validationErrors.status }}</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea
                class="form-input"
                v-model="formData.remarks"
                placeholder="添加备注信息..."
                rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="close">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <span class="spinner"></span>
                提交中...
              </span>
              <span v-else>保存修改</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { useOrderStore } from '../store';

export default {
  name: 'EditOrderModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    order: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'order-updated'],
  setup(props, { emit }) {
    const orderStore = useOrderStore();
    const isSubmitting = ref(false);

    // 状态映射 - 从英文到中文
    const statusEnToZh = {
      'in-progress': '进行中',
      'completed': '已完成',
      'abnormal': '异常',
      'paid': '已收款'
    };

    // 状态映射 - 从中文到英文
    const statusZhToEn = {
      '进行中': 'in-progress',
      '已完成': 'completed',
      '异常': 'abnormal',
      '已收款': 'paid'
    };

    // 表单数据
    const formData = reactive({
      id: '',
      fee: null,
      startDate: '',
      endDate: '',
      contact: '',
      status: '',
      remarks: ''
    });

    // 验证错误
    const validationErrors = reactive({
      id: '',
      fee: '',
      startDate: '',
      endDate: '',
      contact: '',
      status: ''
    });

    watch(() => props.order, (newOrder) => {
      if (newOrder && Object.keys(newOrder).length > 0) {
        formData.id = newOrder.id || '';
        formData.fee = newOrder.fee || null;
        formData.startDate = newOrder.startDate || '';
        formData.endDate = newOrder.endDate || '';
        formData.contact = newOrder.contact || '';
        formData.status = newOrder.status || '';
        formData.remarks = newOrder.remarks || '';
      }
    }, { immediate: true });

    // 验证表单
    const validateForm = () => {
      let isValid = true;

      // 重置错误
      Object.keys(validationErrors).forEach(key => {
        validationErrors[key] = '';
      });

      // 验证订单ID
      if (!formData.id) {
        validationErrors.id = '请输入订单编号';
        isValid = false;
      }

      // 验证费用
      if (formData.fee === null || formData.fee === '') {
        validationErrors.fee = '请输入开发费';
        isValid = false;
      } else if (isNaN(formData.fee) || formData.fee <= 0) {
        validationErrors.fee = '开发费必须是大于0的数字';
        isValid = false;
      }

      // 验证开始日期
      if (!formData.startDate) {
        validationErrors.startDate = '请选择开始日期';
        isValid = false;
      }

      // 验证结束日期
      if (!formData.endDate) {
        validationErrors.endDate = '请选择截止日期';
        isValid = false;
      } else if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        validationErrors.endDate = '截止日期不能早于开始日期';
        isValid = false;
      }

      // 验证联系人
      if (!formData.contact) {
        validationErrors.contact = '请输入联系人姓名';
        isValid = false;
      }

      // 验证状态
      if (!formData.status) {
        validationErrors.status = '请选择订单状态';
        isValid = false;
      }

      return isValid;
    };

    // 提交表单
    const submitForm = async () => {
      if (!validateForm()) return;

      isSubmitting.value = true;

      try {
        // 确定月份值
        const startDate = new Date(formData.startDate);
        const month = `${startDate.getFullYear()}-${startDate.getMonth() + 1}`;

        // 创建要更新的订单数据对象
        const orderData = {
          id: formData.id,
          fee: formData.fee,
          startDate: formData.startDate,
          endDate: formData.endDate,
          contact: formData.contact,
          status: statusZhToEn[formData.status], // 转换为英文
          remarks: formData.remarks,
          category: statusZhToEn[formData.status], // 保持一致
          month
        };

        await orderStore.updateOrder(formData.id, orderData);

        emit('order-updated');
        emit('close');
      } catch (error) {
        console.error('更新订单失败:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    // 关闭模态窗口
    const close = () => {
      emit('close');
    };

    // 点击外部关闭
    const closeIfOutside = (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        close();
      }
    };

    return {
      formData,
      validationErrors,
      isSubmitting,
      submitForm,
      close,
      closeIfOutside
    };
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  -webkit-app-region: no-drag;
}

.modal-container {
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  z-index: 1001;
}

.modal-header {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.form-row {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

.required {
  color: var(--status-error);
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background-color: var(--tertiary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
  font-size: 14px;
}

.form-input:focus {
  border-color: var(--accent-blue);
  outline: none;
}

.form-input.invalid {
  border-color: var(--status-error);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  color: var(--status-error);
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>