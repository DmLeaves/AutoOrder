<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">设置</h2>
        <button class="close-button" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <div class="settings-tabs">
          <div
              class="tab-item"
              :class="{ active: activeTab === 'buttons' }"
              @click="activeTab = 'buttons'"
          >
            自定义按钮
          </div>
          <!-- 预留其他设置分类 -->
        </div>

        <div class="tab-content">
          <!-- 按钮设置面板 -->
          <div v-if="activeTab === 'buttons'" class="buttons-panel">
            <h3 class="section-title">快捷按钮设置</h3>
            <p class="section-description">
              配置主页面右侧面板的快捷按钮。你可以添加、编辑或删除自定义按钮。
            </p>

            <!-- 按钮列表 -->
            <div class="button-list">
              <div v-for="button in customButtons" :key="button.id" class="button-item">
                <div class="button-info">
                  <div class="button-name">{{ button.name }}</div>
                  <div class="button-path text-ellipsis">{{ button.path }}</div>
                </div>

                <div class="button-actions">
                  <button
                      class="action-button edit-button"
                      @click="editButton(button)"
                      :disabled="isFixedButton(button.id)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>

                  <button
                      class="action-button delete-button"
                      @click="promptDeleteButton(button)"
                      :disabled="isFixedButton(button.id)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="customButtons.length === 0" class="empty-state">
                <p>暂无自定义按钮</p>
              </div>
            </div>

            <!-- 添加/编辑按钮表单 -->
            <div
                class="button-form-container"
                :class="{ 'is-editing': isEditing }"
            >
              <h4 class="form-title">{{ isEditing ? '编辑按钮' : '添加新按钮' }}</h4>

              <div class="form-group">
                <label class="form-label">按钮名称</label>
                <input
                    type="text"
                    class="form-input"
                    v-model="formData.name"
                    placeholder="输入按钮名称"
                />
              </div>

              <div class="form-group">
                <label class="form-label">文件夹路径</label>
                <div class="path-input-group">
                  <input
                      type="text"
                      class="form-input"
                      v-model="formData.path"
                      placeholder="输入文件夹路径"
                  />
                  <button
                      class="btn btn-secondary browse-button"
                      @click="browseFolderPath"
                  >
                    浏览...
                  </button>
                </div>
              </div>

              <div class="form-actions">
                <button
                    class="btn btn-secondary"
                    @click="resetForm"
                >
                  取消
                </button>
                <button
                    class="btn btn-primary"
                    @click="saveButton"
                    :disabled="!isFormValid"
                >
                  {{ isEditing ? '保存' : '添加' }}
                </button>
              </div>
            </div>

            <!-- 分隔线 -->
            <div class="divider"></div>

            <!-- 其他操作 -->
            <div class="other-actions">
              <button class="btn btn-secondary" @click="resetToDefault">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6"></path>
                  <path d="M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                重置为默认配置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <div v-if="showDeleteConfirm" class="confirm-modal" @click.stop>
      <div class="confirm-content">
        <h4>确认删除</h4>
        <p>你确定要删除按钮 "{{ buttonToDelete?.name }}" 吗？</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" @click="cancelDelete">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import localStorageService from '../services/localStorageService';

export default {
  name: 'SettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'buttons-updated'],
  setup(props, { emit }) {
    const activeTab = ref('buttons');
    const customButtons = ref([]);
    const isEditing = ref(false);
    const editingButtonId = ref(null);
    const showDeleteConfirm = ref(false);
    const buttonToDelete = ref(null);

    // 表单数据
    const formData = reactive({
      name: '',
      path: ''
    });

    // 固定的按钮ID（这些按钮不能被编辑或删除）
    const fixedButtonIds = ['statistics', 'admin'];

    // 判断是否为固定按钮
    const isFixedButton = (buttonId) => {
      return fixedButtonIds.includes(buttonId);
    };

    // 表单验证
    const isFormValid = computed(() => {
      return formData.name && formData.name.trim() !== '' &&
          formData.path && formData.path.trim() !== '';
    });

    // 加载按钮配置
    const loadButtons = () => {
      customButtons.value = localStorageService.getCustomButtons();
    };

    // 关闭模态窗口
    const closeModal = () => {
      resetForm();
      emit('close');
    };

    // 重置表单
    const resetForm = () => {
      formData.name = '';
      formData.path = '';
      isEditing.value = false;
      editingButtonId.value = null;
    };

    // 编辑按钮
    const editButton = (button) => {
      if (isFixedButton(button.id)) return;

      formData.name = button.name;
      formData.path = button.path;
      isEditing.value = true;
      editingButtonId.value = button.id;
    };

    // 保存按钮
    const saveButton = () => {
      if (!isFormValid.value) return;

      const buttonData = {
        name: formData.name.trim(),
        path: formData.path.trim()
      };

      let success = false;

      if (isEditing.value && editingButtonId.value) {
        // 更新现有按钮
        success = localStorageService.updateCustomButton(editingButtonId.value, buttonData);
      } else {
        // 添加新按钮
        success = localStorageService.addCustomButton(buttonData);
      }

      if (success) {
        loadButtons();
        resetForm();
        emit('buttons-updated', customButtons.value);
      }
    };

    // 浏览文件夹路径
    const browseFolderPath = async () => {
      // 检查是否有Electron的文件选择API
      if (window.electron && window.electron.files && window.electron.files.selectFolder) {
        try {
          const result = await window.electron.files.selectFolder();
          if (result.success && result.path) {
            formData.path = result.path;
          }
        } catch (error) {
          console.error('选择文件夹失败:', error);
          // 如果API调用失败，回退到提示输入
          fallbackToPrompt();
        }
      } else {
        // 如果没有API，使用提示输入
        fallbackToPrompt();
      }
    };

    // 回退到提示输入
    const fallbackToPrompt = () => {
      const path = prompt('请输入文件夹路径:', formData.path);
      if (path !== null) {
        formData.path = path.trim();
      }
    };

    // 准备删除按钮
    const promptDeleteButton = (button) => {
      if (isFixedButton(button.id)) return;

      buttonToDelete.value = button;
      showDeleteConfirm.value = true;
    };

    // 取消删除
    const cancelDelete = () => {
      buttonToDelete.value = null;
      showDeleteConfirm.value = false;
    };

    // 确认删除
    const confirmDelete = () => {
      if (buttonToDelete.value) {
        const success = localStorageService.deleteCustomButton(buttonToDelete.value.id);

        if (success) {
          loadButtons();
          emit('buttons-updated', customButtons.value);
        }
      }

      cancelDelete();
    };

    // 重置为默认配置
    const resetToDefault = () => {
      const success = localStorageService.resetCustomButtons();

      if (success) {
        loadButtons();
        resetForm();
        emit('buttons-updated', customButtons.value);
      }
    };

    // 监听visible变化，当显示时加载按钮配置
    watch(() => props.visible, (newValue) => {
      if (newValue) {
        loadButtons();
      }
    });

    return {
      activeTab,
      customButtons,
      isEditing,
      formData,
      isFormValid,
      showDeleteConfirm,
      buttonToDelete,
      closeModal,
      resetForm,
      editButton,
      saveButton,
      browseFolderPath,
      promptDeleteButton,
      cancelDelete,
      confirmDelete,
      resetToDefault,
      isFixedButton
    };
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
}

.settings-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-lg);
}

.tab-item {
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-item:hover {
  color: var(--text-primary);
}

.tab-item.active {
  color: var(--accent-blue);
  border-bottom-color: var(--accent-blue);
}

.tab-content {
  flex: 1;
}

.section-title {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.button-list {
  margin-bottom: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.button-item {
  background-color: var(--tertiary-bg);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
}

.button-info {
  overflow: hidden;
}

.button-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.button-path {
  font-size: 12px;
  color: var(--text-secondary);
  max-width: 500px;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.button-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-button:hover:not(:disabled) {
  color: var(--accent-blue);
  border-color: var(--accent-blue);
}

.delete-button:hover:not(:disabled) {
  color: var(--status-error);
  border-color: var(--status-error);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-disabled);
  background-color: var(--tertiary-bg);
  border-radius: var(--border-radius-sm);
  border: 1px dashed var(--border-color);
}

.button-form-container {
  background-color: var(--tertiary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

.button-form-container.is-editing {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 1px var(--accent-blue);
}

.form-title {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  background-color: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-primary);
}

.form-input:focus {
  border-color: var(--accent-blue);
  outline: none;
}

.path-input-group {
  display: flex;
  gap: var(--spacing-sm);
}

.path-input-group .form-input {
  flex: 1;
}

.browse-button {
  white-space: nowrap;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-lg) 0;
}

.other-actions {
  display: flex;
  justify-content: center;
}

.other-actions .btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* 确认弹窗样式 */
.confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  z-index: 1100;
  border: 1px solid var(--border-color);
}

.confirm-content {
  text-align: center;
}

.confirm-content h4 {
  margin-top: 0;
  color: var(--text-primary);
}

.confirm-content p {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>