import { defineStore } from 'pinia';
import api from '../services/api';

// 订单存储
export const useOrderStore = defineStore('orders', {
    state: () => ({
        orders: [],
        categories: [],
        categoriesLoading: false,
        categoriesError: null,
        loading: false,
        error: null,
        currentOrder: null
    }),

    getters: {
        getOrdersByCategory: (state) => (category) => {
            return state.orders.filter(order => order.category === category);
        },

        getOrdersByMonth: (state) => (category, month) => {
            return state.orders.filter(order =>
                order.category === category && order.month === month
            );
        },

        getOrderById: (state) => (id) => {
            return state.orders.find(order => order.id === id);
        },

        getStats: (state) => {
            return {
                total: state.orders.length,
                inProgress: state.orders.filter(order => order.category === 'in-progress').length,
                completed: state.orders.filter(order => order.category === 'completed').length,
                abnormal: state.orders.filter(order => order.category === 'abnormal').length
            };
        }
    },

    actions: {
        // 获取所有订单
        async fetchOrders() {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.order.getAllOrders();
                this.orders = response.data;
            } catch (error) {
                this.error = error.message || '获取订单数据失败';
                console.error('获取订单数据失败:', error);
            } finally {
                this.loading = false;
            }
        },

        // 获取订单分类（用于侧边栏菜单）
        async fetchCategories() {
            this.categoriesLoading = true;
            this.categoriesError = null;

            try {
                const response = await api.order.getOrderCategories();
                this.categories = response.data.categories;
            } catch (error) {
                this.categoriesError = error.message || '获取分类数据失败';
                console.error('获取分类数据失败:', error);
            } finally {
                this.categoriesLoading = false;
            }
        },

        // 获取单个订单详情
        async fetchOrderById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.order.getOrderById(id);
                this.currentOrder = response.data;
                return response.data;
            } catch (error) {
                this.error = error.message || '获取订单详情失败';
                console.error('获取订单详情失败:', error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        // 创建新订单
        async createOrder(orderData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.order.createOrder(orderData);
                // 添加新订单到本地状态
                this.orders.push(response.data);
                return response.data;
            } catch (error) {
                this.error = error.message || '创建订单失败';
                console.error('创建订单失败:', error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        // 更新订单
        async updateOrder(id, orderData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.order.updateOrder(id, orderData);
                // 更新本地状态中的订单
                const index = this.orders.findIndex(order => order.id === id);
                if (index !== -1) {
                    this.orders[index] = response.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.message || '更新订单失败';
                console.error('更新订单失败:', error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        // 删除订单
        async deleteOrder(id) {
            this.loading = true;
            this.error = null;

            try {
                await api.order.deleteOrder(id);
                // 从本地状态移除订单
                this.orders = this.orders.filter(order => order.id !== id);
                return true;
            } catch (error) {
                this.error = error.message || '删除订单失败';
                console.error('删除订单失败:', error);
                return false;
            } finally {
                this.loading = false;
            }
        }
    }
});

// 联系人存储
export const useContactStore = defineStore('contacts', {
    state: () => ({
        contacts: [],
        loading: false,
        error: null
    }),

    getters: {
        getContactById: (state) => (id) => {
            return state.contacts.find(contact => contact.id === id);
        }
    },

    actions: {
        // 获取所有联系人
        async fetchContacts() {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.contact.getAllContacts();
                this.contacts = response.data;
            } catch (error) {
                this.error = error.message || '获取联系人失败';
                console.error('获取联系人失败:', error);
            } finally {
                this.loading = false;
            }
        },

        // 创建新联系人
        async createContact(contactData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.contact.createContact(contactData);
                this.contacts.push(response.data);
                return response.data;
            } catch (error) {
                this.error = error.message || '创建联系人失败';
                console.error('创建联系人失败:', error);
                return null;
            } finally {
                this.loading = false;
            }
        }
    }
});

// 用户存储
export const useUserStore = defineStore('users', {
    state: () => ({
        currentUser: null,
        users: [],
        loading: false,
        error: null,
        isAuthenticated: false
    }),

    actions: {
        // 登录
        async login(username, password) {
            this.loading = true;
            this.error = null;

            try {
                // 这里应该调用登录API，但示例中未提供，所以我们模拟一下
                const response = await api.user.getUserByUsername(username);

                // 在真实环境中，密码验证应该在服务器端进行
                // 这里只是示例，实际上不应该这样做
                this.currentUser = response.data;
                this.isAuthenticated = true;
                return true;
            } catch (error) {
                this.error = error.message || '登录失败';
                console.error('登录失败:', error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        // 登出
        logout() {
            this.currentUser = null;
            this.isAuthenticated = false;
        }
    }
});