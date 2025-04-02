import { createRouter, createWebHistory } from 'vue-router'
import ApiGenerator from '../components/ApiGenerator.vue'
import ApiDocumentation from '../components/ApiDocumentation.vue'
import ApiTester from '../components/ApiTester.vue'

const routes = [
    {
        path: '/',
        name: 'generator',
        component: ApiGenerator
    },
    {
        path: '/docs',
        name: 'documentation',
        component: ApiDocumentation
    },
    {
        path: '/test',
        name: 'tester',
        component: ApiTester
    }

]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router