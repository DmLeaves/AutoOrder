import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    // Other routes can be added here later
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;