import {createRouter, createWebHistory} from 'vue-router'
import {useUserStore} from '@/stores/userStore'
import AppLayout from '@/views/main/AppLayout.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/main/LoginView.vue'),
            meta: {requiresAuth: false}
        },
        {
            path: '/',
            component: AppLayout,
            meta: {requiresAuth: true},
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/app/AgentView.vue')
                },
                {
                    path: '/users',
                    name: 'users',
                    component: () => import('@/views/user/UserManage.vue')
                },
                {
                    path: '/applications',
                    name: 'applications',
                    component: () => import('@/views/application/ApplicationManage.vue')
                },
                {
                    path: '/system/llm-provider-defines',
                    name: 'llm-provider-defines',
                    component: () => import('@/views/system/LlmProviderDefineManage.vue')
                },

                // 应用相关路由
                {
                    path: '/app/agents',
                    name: 'app-agents',
                    component: () => import('@/views/app/AgentView.vue'),
                    meta: {requiresApp: true}
                },
                {
                    path: '/app/conversations',
                    name: 'app-conversations',
                    component: () => import('@/views/app/ConversationView.vue'),
                    meta: {requiresApp: true}
                }
            ]
        }
    ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // 如果用户未初始化，先初始化
    if (!userStore.isAuthenticated && userStore.token) {
        await userStore.initializeAuth()
    }

    // 检查是否需要认证
    if (to.meta.requiresAuth !== false && !userStore.isAuthenticated) {
        next('/login')
    } else if (to.path === '/login' && userStore.isAuthenticated) {
        next('/')
    } else {
        // 检查是否需要选择应用
        if (to.meta.requiresApp) {
            const selectedApp = localStorage.getItem('selectedApp')
            if (!selectedApp) {
                // 如果没有选择应用，跳转到首页
                next('/')
                return
            }
        }
        next()
    }
})

export default router
