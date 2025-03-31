import axios from 'axios';

// 创建一个axios实例
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器 - 可以在这里添加认证令牌等
api.interceptors.request.use(
    config => {
        // 如果有token，可以在这里添加到请求头
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers['Authorization'] = `Bearer ${token}`;
        // }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理通用错误
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        console.error('API错误:', error.response || error);
        return Promise.reject(error);
    }
);

// 订单相关API
export const orderAPI = {
    // 获取所有订单
    getAllOrders: () => {
        return api.get('/api/orders');
    },

    getOrdersData: () => {
        return api.get('/api/orders/data');
    },

    getOrderCategories: () => {
        return api.get('/api/orders/categories');
    },

    // 获取特定订单
    getOrderById: (id) => {
        return api.get(`/api/orders/${id}`);
    },

    // 创建新订单
    createOrder: (orderData) => {
        return api.post('/api/orders', orderData);
    },

    // 更新订单
    updateOrder: (id, orderData) => {
        return api.put(`/api/orders/${id}`, orderData);
    },

    // 删除订单
    deleteOrder: (id) => {
        return api.delete(`/api/orders/${id}`);
    }
};

// 用户相关API
export const userAPI = {
    // 获取所有用户
    getAllUsers: () => {
        return api.get('/api/users');
    },

    // 获取特定用户
    getUserById: (id) => {
        return api.get(`/api/users/${id}`);
    },

    // 通过用户名获取用户
    getUserByUsername: (username) => {
        return api.get(`/api/users/username/${username}`);
    },

    // 创建新用户
    createUser: (userData) => {
        return api.post('/api/users', userData);
    },

    // 更新用户
    updateUser: (id, userData) => {
        return api.put(`/api/users/${id}`, userData);
    },

    // 删除用户
    deleteUser: (id) => {
        return api.delete(`/api/users/${id}`);
    }
};

// 联系人相关API
export const contactAPI = {
    // 获取所有联系人
    getAllContacts: () => {
        return api.get('/api/contacts');
    },

    // 获取特定联系人
    getContactById: (id) => {
        return api.get(`/api/contacts/${id}`);
    },

    // 通过名称获取联系人
    getContactByName: (name) => {
        return api.get(`/api/contacts/name/${name}`);
    },

    // 创建新联系人
    createContact: (contactData) => {
        return api.post('/api/contacts', contactData);
    },

    // 更新联系人
    updateContact: (id, contactData) => {
        return api.put(`/api/contacts/${id}`, contactData);
    },

    // 删除联系人
    deleteContact: (id) => {
        return api.delete(`/api/contacts/${id}`);
    }
};

// 用户-订单关系API
export const userOrderAPI = {
    // 获取所有用户-订单关系
    getAllUserOrders: () => {
        return api.get('/api/user-orders');
    },

    // 获取特定用户的所有订单
    getUserOrders: (userId) => {
        return api.get(`/api/user-orders/user/${userId}`);
    },

    // 获取特定订单的所有关联用户
    getOrderUsers: (orderId) => {
        return api.get(`/api/user-orders/order/${orderId}`);
    },

    // 分配订单给用户
    assignOrderToUser: (userId, orderId, role) => {
        return api.post('/api/user-orders/assign', { userId, orderId, role });
    },

    // 移除用户的订单分配
    removeOrderAssignment: (userId, orderId) => {
        return api.delete(`/api/user-orders/user/${userId}/order/${orderId}`);
    }
};

export default {
    order: orderAPI,
    user: userAPI,
    contact: contactAPI,
    userOrder: userOrderAPI
};