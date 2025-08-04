<template>
  <a-layout class="lemon-theme">
    <!-- 顶部工具栏 -->
    <a-layout-header class="main-navbar">
      <div class="header-content">
        <img src="../../assets/images/common/logo-horizontal-banner.png" class="logo-image" alt="Logo"/>

        <div class="header-actions">
          <!-- 应用选择下拉菜单 -->
          <a-dropdown v-model:open="showAppMenu" placement="bottomRight">
            <a-button type="text" class="app-select-btn">
              <template #icon>
                <AppstoreOutlined />
              </template>
              {{ selectedApp ? selectedApp.name : '选择应用' }}
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu class="app-menu">
                <a-menu-item-group title="应用列表">
                  <a-menu-item
                    v-for="app in applications"
                    :key="app.id"
                    @click="selectApp(app)"
                    :class="{ 'ant-menu-item-selected': selectedApp?.id === app.id }"
                  >
                    <div class="app-menu-item">
                      <div class="app-name">{{ app.name }}</div>
                      <div class="app-description">{{ app.description }}</div>
                    </div>
                  </a-menu-item>
                </a-menu-item-group>
                <a-menu-divider />
                <a-menu-item @click="$router.push('/applications')">
                  <template #icon>
                    <SettingOutlined />
                  </template>
                  应用管理
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- 用户系统管理下拉菜单 -->
          <a-dropdown placement="bottomRight">
            <a-button type="text" class="system-btn">
              <template #icon>
                <UserOutlined />
              </template>
              系统管理
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="$router.push('/users')">
                  <template #icon>
                    <TeamOutlined />
                  </template>
                  用户管理
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- 用户菜单 -->
          <a-dropdown placement="bottomRight">
            <a-button type="text" class="user-btn">
              <UserOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item disabled>
                  <div class="user-info">
                    <div class="user-name">{{ userStore.userFullName }}</div>
                    <div class="user-subtitle">当前用户</div>
                  </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="handleLogout">
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>

    <!-- 主内容区域 -->
    <a-layout class="main-content">
      <div class="content-wrapper">
        <!-- 当选择了应用时显示左侧导航和内容 -->
        <div v-if="selectedApp" class="app-layout">
          <!-- 左侧二级导航菜单 -->
          <a-layout-sider
            v-model:collapsed="secondaryNavCollapsed"
            :trigger="null"
            collapsible
            width="250"
            class="secondary-nav"
          >
            <!-- 二级导航头部 -->
            <div class="secondary-nav-header">
              <div class="nav-header-content">
                <AppstoreOutlined class="nav-icon" />
                <span class="nav-title">{{ selectedApp.name }}</span>
              </div>
              <a-button
                type="text"
                @click="toggleSecondaryNav"
                class="nav-toggle-btn"
              >
                <MenuFoldOutlined v-if="!secondaryNavCollapsed" />
                <MenuUnfoldOutlined v-else />
              </a-button>
            </div>

            <a-menu
              mode="inline"
              :selected-keys="[$route.path]"
              class="secondary-menu"
            >
              <a-menu-item
                v-for="item in appMenuItems"
                :key="item.to"
                @click="$router.push(item.to)"
              >
                <template #icon>
                  <component :is="item.icon" />
                </template>
                {{ item.title }}
              </a-menu-item>
            </a-menu>
          </a-layout-sider>

          <!-- 右侧内容区域 -->
          <a-layout class="app-content">
            <!-- 内容区域头部，显示菜单按钮 -->
            <a-layout-header class="content-header">
              <a-button
                type="text"
                @click="toggleSecondaryNav"
                class="content-menu-btn"
              >
                <MenuOutlined />
              </a-button>
              <span class="content-title">{{ selectedApp.name }}</span>
            </a-layout-header>

            <a-layout-content class="content-body">
              <router-view/>
            </a-layout-content>
          </a-layout>
        </div>

        <!-- 当没有选择应用时，根据当前路由决定显示内容 -->
        <div v-else class="standalone-content">
          <!-- 如果是用户管理或应用管理页面，直接显示内容 -->
          <div v-if="$route.path === '/users' || $route.path === '/applications'">
            <router-view/>
          </div>
          <!-- 其他页面显示选择应用提示 -->
          <div v-else class="select-app-prompt">
            <a-card class="prompt-card">
              <template #cover>
                <div class="prompt-icon">
                  <AppstoreOutlined />
                </div>
              </template>
              <a-card-meta
                title="请先选择要管理的应用"
                description="在顶部导航栏中选择一个应用开始管理"
              />
              <template #actions>
                <a-button type="primary" @click="showAppMenu = true">
                  选择应用
                </a-button>
              </template>
            </a-card>
          </div>
        </div>
      </div>
    </a-layout>

    <!-- 创建应用对话框 -->
    <a-modal
      v-model:open="showCreateAppDialog"
      title="创建新应用"
      @ok="createApp"
      :confirm-loading="creatingApp"
      :ok-text="'创建'"
      :cancel-text="'取消'"
    >
      <a-form
        ref="createAppForm"
        :model="newApp"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item name="name" label="应用名称">
          <a-input
            v-model:value="newApp.name"
            placeholder="请输入应用名称"
            size="large"
          />
        </a-form-item>
        <a-form-item name="description" label="应用描述">
          <a-textarea
            v-model:value="newApp.description"
            placeholder="请输入应用描述"
            :rows="4"
            size="large"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'
import type { Application } from '@/dto/application.ts'
import applicationService from '@/services/applicationService.ts'
import {
  AppstoreOutlined,
  DownOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  RobotOutlined,
  MessageOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 状态
const showAppMenu = ref(false)
const showCreateAppDialog = ref(false)
const creatingApp = ref(false)
const applications = ref<Application[]>([])
const selectedApp = ref<Application | null>(null)
const secondaryNavCollapsed = ref(false)

// 新应用表单
const newApp = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入应用描述', trigger: 'blur' }
  ]
}

// 应用菜单项（二级导航）
const appMenuItems = computed(() => [
  {
    title: '智能体管理',
    icon: RobotOutlined,
    to: '/app/agents'
  },
  {
    title: '对话管理',
    icon: MessageOutlined,
    to: '/app/conversations'
  },
  {
    title: '应用设置',
    icon: SettingOutlined,
    to: '/app/settings'
  }
])

// 获取应用列表
const fetchApplications = async () => {
  try {
    const response = await applicationService.getAllApplications()
    applications.value = response.applications
  } catch (error) {
    console.error('获取应用列表失败:', error)
  }
}

// 选择应用
const selectApp = (app: Application) => {
  selectedApp.value = app
  showAppMenu.value = false
  // 可以在这里保存选中的应用到本地存储
  localStorage.setItem('selectedApp', JSON.stringify(app))
}

// 切换二级导航
const toggleSecondaryNav = () => {
  secondaryNavCollapsed.value = !secondaryNavCollapsed.value
}

// 创建应用
const createApp = async () => {
  try {
    creatingApp.value = true
    const response = await applicationService.saveApplication(newApp)

    // 重置表单
    newApp.name = ''
    newApp.description = ''
    showCreateAppDialog.value = false

    // 刷新应用列表
    await fetchApplications()
  } catch (error) {
    console.error('创建应用失败:', error)
  } finally {
    creatingApp.value = false
  }
}

// 处理登出
const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

// 初始化
onMounted(async () => {
  await fetchApplications()

  // 恢复上次选择的应用
  const savedApp = localStorage.getItem('selectedApp')
  if (savedApp) {
    const app = JSON.parse(savedApp)
    const foundApp = applications.value.find(a => a.id === app.id)
    if (foundApp) {
      selectedApp.value = foundApp
    }
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.lemon-theme {
  min-height: 100vh;
}

.main-navbar {
  background: $gradient-primary !important;
  padding: 0;
  height: 64px;
  line-height: 64px;
  border-bottom: 1px solid $border-light;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
}

.logo-image {
  height: 60px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-select-btn,
.system-btn,
.user-btn {
  color: white !important;
  border: none !important;
  height: 40px;
  padding: 0 12px;
}

.app-select-btn:hover,
.system-btn:hover,
.user-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.app-menu {
  min-width: 300px;
}

.app-menu-item {
  .app-name {
    font-weight: 500;
    color: $text-primary;
  }
  
  .app-description {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 2px;
  }
}

.user-info {
  .user-name {
    font-weight: 500;
    color: $text-primary;
  }
  
  .user-subtitle {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 2px;
  }
}

.main-content {
  height: calc(100vh - 64px);
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-layout {
  display: flex;
  height: 100%;
}

.secondary-nav {
  border-right: 1px solid $border-light;
  background: $bg-secondary;
}

.secondary-nav-header {
  background: $gradient-soft;
  color: $text-primary;
  padding: 16px 24px;
  border-bottom: 1px solid $border-light;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-icon {
  font-size: 18px;
  color: $text-primary;
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  color: $text-primary;
}

.nav-toggle-btn {
  color: $text-primary !important;
  border: none !important;
}

.secondary-menu {
  border-right: none;
  background: transparent;
}

.app-content {
  background-color: $bg-primary;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-header {
  background: $bg-secondary;
  padding: 16px 24px;
  border-bottom: 1px solid $border-light;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 64px;
  line-height: 64px;
}

.content-menu-btn {
  color: $text-primary !important;
  border: none !important;
}

.content-title {
  font-size: 18px;
  font-weight: 500;
  color: $text-primary;
}

.content-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.standalone-content {
  height: 100%;
  overflow-y: auto;
}

.select-app-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.prompt-card {
  max-width: 400px;
  text-align: center;
}

.prompt-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  background: #f5f5f5;
  
  .anticon {
    font-size: 64px;
    color: #d9d9d9;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .app-select-btn,
  .system-btn {
    display: none;
  }
  
  .secondary-nav {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }
}
</style> 