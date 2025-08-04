<template>
  <v-app class="lemon-theme">
    <!-- 顶部工具栏 -->
    <v-app-bar color="primary" dark class="main-navbar">
      <img src="../../assets/images/common/logo-horizontal-banner.png" class="logo-image"/>

      <v-spacer></v-spacer>

      <!-- 应用选择下拉菜单 -->
      <v-menu v-model="showAppMenu" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn
              v-bind="props"
              variant="text"
              class="mr-4"
              prepend-icon="mdi-apps"
          >
            {{ selectedApp ? selectedApp.name : '选择应用' }}
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-card min-width="300">
          <v-list>
            <v-list-subheader>应用列表</v-list-subheader>
            <v-list-item
                v-for="app in applications"
                :key="app.id"
                @click="selectApp(app)"
                :active="selectedApp?.id === app.id"
            >
              <v-list-item-title>{{ app.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ app.description }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item @click="$router.push('/applications')">
              <v-list-item-title class="text-primary">
                <v-icon start>mdi-cog</v-icon>
                应用管理
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <!-- 用户系统管理下拉菜单 -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
              v-bind="props"
              variant="text"
              class="mr-4"
              prepend-icon="mdi-account-cog"
          >
            系统管理
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-card min-width="200">
          <v-list>
            <v-list-item @click="$router.push('/users')">
              <v-list-item-title>
                <v-icon start>mdi-account-group</v-icon>
                用户管理
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <!-- 用户菜单 -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>{{ userStore.userFullName }}</v-list-item-title>
            <v-list-item-subtitle>当前用户</v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item @click="handleLogout">
            <v-list-item-title>退出登录</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- 主内容区域 -->
    <v-main class="main-content">
      <div class="content-wrapper">
        <!-- 当选择了应用时显示左侧导航和内容 -->
        <div v-if="selectedApp" class="app-layout">
          <!-- 左侧二级导航菜单 -->
          <v-navigation-drawer
              v-model="secondaryNavVisible"
              location="left"
              width="250"
              class="secondary-nav"
              temporary
          >
            <!-- 二级导航头部 -->
            <div class="secondary-nav-header">
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-apps</v-icon>
                <span class="text-h6">{{ selectedApp.name }}</span>
              </div>
              <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="toggleSecondaryNav"
                  class="nav-toggle-btn"
              />
            </div>

            <v-list>
              <v-list-item
                  v-for="item in appMenuItems"
                  :key="item.title"
                  :to="item.to"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  class="mb-1"
              />
            </v-list>
          </v-navigation-drawer>

          <!-- 右侧内容区域 -->
          <div class="app-content">
            <!-- 内容区域头部，显示菜单按钮 -->
            <div class="content-header">
              <v-btn
                  icon="mdi-menu"
                  variant="text"
                  @click="toggleSecondaryNav"
                  class="content-menu-btn"
              />
              <span class="content-title">{{ selectedApp.name }}</span>
            </div>

            <div class="content-body">
              <router-view/>
            </div>
          </div>
        </div>

        <!-- 当没有选择应用时，根据当前路由决定显示内容 -->
        <div v-else class="standalone-content">
          <!-- 如果是用户管理或应用管理页面，直接显示内容 -->
          <div v-if="$route.path === '/users' || $route.path === '/applications'">
            <router-view/>
          </div>
          <!-- 其他页面显示选择应用提示 -->
          <div v-else class="d-flex align-center justify-center" style="height: 60vh;">
            <v-card class="pa-8 text-center" max-width="400">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-apps</v-icon>
              <h2 class="text-h5 mb-2">请先选择要管理的应用</h2>
              <p class="text-body-1 text-medium-emphasis mb-4">
                在顶部导航栏中选择一个应用开始管理
              </p>
              <v-btn color="primary" @click="showAppMenu = true">
                选择应用
              </v-btn>
            </v-card>
          </div>
        </div>
      </div>
    </v-main>

    <!-- 创建应用对话框 -->
    <v-dialog v-model="showCreateAppDialog" max-width="500px">
      <v-card>
        <v-card-title>创建新应用</v-card-title>
        <v-card-text>
          <v-form ref="createAppForm">
            <v-text-field
                v-model="newApp.name"
                label="应用名称"
                :rules="[rules.required]"
                variant="outlined"
                required
            />
            <v-textarea
                v-model="newApp.description"
                label="应用描述"
                :rules="[rules.required]"
                variant="outlined"
                required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="grey" @click="showCreateAppDialog = false">取消</v-btn>
          <v-btn
              color="primary"
              :loading="creatingApp"
              @click="createApp"
          >
            创建
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/stores/userStore.ts'
import type {Application} from '@/dto/application.ts'
import applicationService from '@/services/applicationService.ts'

const router = useRouter()
const userStore = useUserStore()

// 状态
const showAppMenu = ref(false)
const showCreateAppDialog = ref(false)
const creatingApp = ref(false)
const applications = ref<Application[]>([])
const selectedApp = ref<Application | null>(null)
const secondaryNavVisible = ref(true)

// 新应用表单
const newApp = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  required: (value: string) => !!value || '此字段为必填项'
}

// 应用菜单项（二级导航）
const appMenuItems = computed(() => [
  {
    title: '智能体管理',
    icon: 'mdi-robot',
    to: '/app/agents'
  },
  {
    title: '对话管理',
    icon: 'mdi-chat',
    to: '/app/conversations'
  },
  {
    title: '应用设置',
    icon: 'mdi-cog',
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
  secondaryNavVisible.value = !secondaryNavVisible.value
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

.secondary-nav {
  border-right: 1px solid $border-light;
}

.secondary-nav-header {
  background: $gradient-soft;
  color: $text-primary;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-light;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-toggle-btn {
  color: $text-primary !important;
}

.main-navbar {
  background: $gradient-primary !important;

  .logo-image {
    height: 60px;
  }

  .v-btn--variant-text {
    color: white !important;
  }

  .v-menu .v-list-item-title {
    color: $text-primary !important;
  }
}

.main-content {
  height: calc(100vh - 64px); /* 减去导航栏高度 */
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

.app-content {
  background-color: $bg-primary;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-header {
  background: $bg-secondary;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-light;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex-shrink: 0;
}

.content-menu-btn {
  color: $text-primary !important;
}

.content-title {
  font-size: $font-size-lg;
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
</style>


<style scoped>
.top-nav {
  height: 64px !important;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.top-nav .v-list {
  padding: 0;
}

.top-nav .v-list-item {
  min-height: 64px;
  padding: 0 16px;
}
</style> 