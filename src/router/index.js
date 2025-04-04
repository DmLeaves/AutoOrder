import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Statistics from '../views/Statistics.vue';

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/statistics',
        name: 'Statistics',
        component: Statistics
    },
    {
        path: '/calculator',
        name: 'Calculator',
        component: () => import('../views/Calculator.vue')
    },
    {
        path: '/export',
        name: 'Export',
        component: () => import('../views/Export.vue')
    }
    // Other routes can be added here later
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;