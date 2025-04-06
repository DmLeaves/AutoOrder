/**
 * 本地存储服务
 * 用于管理应用配置的保存和读取
 */

// 默认按钮配置
const DEFAULT_BUTTONS = [
    {
        id: "resource-folder",
        name: "资源文件",
        path: "D:\\收纳\\临时桌面\\工作资源文件"
    },
    {
        id: "project-folder",
        name: "项目文件",
        path: "D:\\project"
    }
];

// 存储键名
const STORAGE_KEYS = {
    BUTTONS: 'autoorder_custom_buttons'
};

/**
 * 获取自定义按钮配置
 * @returns {Array} 按钮配置数组
 */
export function getCustomButtons() {
    try {
        const storedButtons = localStorage.getItem(STORAGE_KEYS.BUTTONS);
        if (storedButtons) {
            return JSON.parse(storedButtons);
        }

        // 如果没有存储过，返回默认配置并保存
        setCustomButtons(DEFAULT_BUTTONS);
        return DEFAULT_BUTTONS;
    } catch (error) {
        console.error('读取按钮配置失败:', error);
        return DEFAULT_BUTTONS;
    }
}

/**
 * 保存自定义按钮配置
 * @param {Array} buttons 按钮配置数组
 */
export function setCustomButtons(buttons) {
    try {
        localStorage.setItem(STORAGE_KEYS.BUTTONS, JSON.stringify(buttons));
        return true;
    } catch (error) {
        console.error('保存按钮配置失败:', error);
        return false;
    }
}

/**
 * 添加自定义按钮
 * @param {Object} button 按钮配置对象
 */
export function addCustomButton(button) {
    try {
        const buttons = getCustomButtons();
        // 生成唯一ID
        button.id = button.id || `button-${Date.now()}`;
        buttons.push(button);
        setCustomButtons(buttons);
        return true;
    } catch (error) {
        console.error('添加按钮失败:', error);
        return false;
    }
}

/**
 * 更新自定义按钮
 * @param {String} buttonId 按钮ID
 * @param {Object} updatedButton 更新后的按钮配置
 */
export function updateCustomButton(buttonId, updatedButton) {
    try {
        const buttons = getCustomButtons();
        const index = buttons.findIndex(b => b.id === buttonId);

        if (index !== -1) {
            buttons[index] = { ...buttons[index], ...updatedButton };
            setCustomButtons(buttons);
            return true;
        }

        return false;
    } catch (error) {
        console.error('更新按钮失败:', error);
        return false;
    }
}

/**
 * 删除自定义按钮
 * @param {String} buttonId 按钮ID
 */
export function deleteCustomButton(buttonId) {
    try {
        const buttons = getCustomButtons();
        const updatedButtons = buttons.filter(b => b.id !== buttonId);

        if (updatedButtons.length !== buttons.length) {
            setCustomButtons(updatedButtons);
            return true;
        }

        return false;
    } catch (error) {
        console.error('删除按钮失败:', error);
        return false;
    }
}

/**
 * 重置按钮配置为默认值
 */
export function resetCustomButtons() {
    try {
        setCustomButtons(DEFAULT_BUTTONS);
        return true;
    } catch (error) {
        console.error('重置按钮配置失败:', error);
        return false;
    }
}

export default {
    getCustomButtons,
    setCustomButtons,
    addCustomButton,
    updateCustomButton,
    deleteCustomButton,
    resetCustomButtons
};