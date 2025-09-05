<template>
  <a-layout class="lemon-theme">
    <!-- 顶部工具栏 -->
    <a-layout-header class="main-navbar">
      <div class="header-content">
        <div class="header-left">
          <img src="../../assets/images/common/logo-horizontal-banner.png" class="logo-image" alt="Logo"/>

          <!-- 应用选择下拉菜单 -->
          <a-dropdown v-model:open="showAppMenu" placement="bottomRight">
            <a-button type="text" class="app-select-btn">
              <template #icon>
                <AppstoreOutlined/>
              </template>
              {{ applicationStore.selectedAppName }}
              <DownOutlined/>
            </a-button>
            <template #overlay>
              <a-menu class="app-menu">
                <a-menu-item-group title="应用列表">
                  <template v-if="applicationStore.applications.length > 0">
                    <a-menu-item
                        v-for="app in applicationStore.applications"
                        :key="app.id"
                        @click="selectApp(app)"
                        :class="{
                        'ant-menu-item-selected': applicationStore.selectedApplication?.id === app.id,
                        'app-menu-item-selected': applicationStore.selectedApplication?.id === app.id 
                      }"
                    >
                      <div class="app-menu-item">
                        <div class="app-name">
                          {{ app.name }}
                          <CheckOutlined
                              v-if="applicationStore.selectedApplication?.id === app.id"
                              class="selected-icon"
                          />
                        </div>
                        <div class="app-description">{{ app.description }}</div>
                      </div>
                    </a-menu-item>
                  </template>
                  <template v-else>
                    <div class="empty-apps">
                      <div class="empty-icon">
                        <AppstoreOutlined/>
                      </div>
                      <div class="empty-text">暂无应用</div>
                      <div class="empty-hint">点击下方按钮创建应用</div>
                    </div>
                  </template>
                </a-menu-item-group>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- 应用功能菜单（只有选择了应用才显示） -->
          <div v-if="applicationStore.selectedApplication" class="app-menu-bar">
            <a-menu mode="horizontal" class="app-menu-horizontal">
              <a-menu-item
                  v-for="item in appMenuItems"
                  :key="item.to"
                  @click="$router.push(item.to)"
                  :class="{ 'ant-menu-item-selected': $route.path === item.to }"
              >
                <template #icon>
                  <component :is="item.icon"/>
                </template>
                {{ item.title }}
              </a-menu-item>

              <!-- 应用设置二级菜单 -->
              <a-sub-menu key="settings" class="settings-submenu">
                <template #icon>
                  <SettingOutlined/>
                </template>
                <template #title>
                  应用设置
                  <DownOutlined class="submenu-arrow"/>
                </template>
                <a-menu-item key="model-management" @click="$router.push('/app-settings/llm-manage')">
                  <template #icon>
                    <ApiOutlined/>
                  </template>
                  模型管理
                </a-menu-item>
                <a-menu-item key="mcp-tools" @click="$router.push('/app-settings/mcp-tools-manage')">
                  <template #icon>
                    <ToolOutlined/>
                  </template>
                  MCP工具管理
                </a-menu-item>
                <a-menu-item key="internal-tools" @click="$router.push('/app-settings/storage-config')">
                  <template #icon>
                    <FileOutlined/>
                  </template>
                  存储设置
                </a-menu-item>
                <a-menu-item key="internal-tools" @click="$router.push('/app-settings/internal-tools-manage')">
                  <template #icon>
                    <AppstoreOutlined/>
                  </template>
                  内部工具管理
                </a-menu-item>
              </a-sub-menu>
            </a-menu>
          </div>
        </div>

        <div class="header-actions">
          <!-- 用户系统管理下拉菜单 -->
          <a-dropdown placement="bottomRight">
            <a-button type="text" class="system-btn">
              <template #icon>
                <SettingOutlined/>
              </template>
              {{ $v_translate('system_settings')}}
              <DownOutlined/>
            </a-button>
            <template #overlay>
              <a-menu class="system-menu">
                <a-menu-item @click="$router.push('/system-settings/applications')">
                  <template #icon>
                    <AppstoreOutlined/>
                  </template>
                  应用管理
                </a-menu-item>
                <a-menu-item @click="$router.push('/system-settings/users')">
                  <template #icon>
                    <TeamOutlined/>
                  </template>
                  系统用户管理
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- 用户菜单 -->
          <a-dropdown placement="bottomRight">
            <a-button type="text" class="user-btn">
              <UserOutlined/>
            </a-button>
            <template #overlay>
              <a-menu class="user-menu">
                <a-menu-item disabled>
                  <div class="user-info">
                    <div class="user-name">{{ userStore.userFullName }}</div>
                    <div class="user-subtitle">当前用户</div>
                  </div>
                </a-menu-item>
                <a-menu-divider/>
                <a-menu-item @click="handleLogout">
                  <template #icon>
                    <LogoutOutlined/>
                  </template>
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
        <!-- 内容区域 -->
        <div class="main-content-area">
          <router-view/>
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
        width="500px"
    >
      <a-form
          ref="createAppForm"
          :model="newApp"
          :rules="rules"
          layout="vertical"
          @finish="createApp"
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
import {computed, onMounted, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/stores/userStore.ts'
import {useApplicationStore} from '@/stores/applicationStore.ts'
import {
  ApiOutlined,
  FileOutlined,
  AppstoreOutlined,
  CheckOutlined,
  DownOutlined,
  LogoutOutlined,
  MessageOutlined,
  RobotOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import i18n from '@/i18n.ts'

const v_scope = 'views.main.app_layout.'
defineExpose({
  v_scope
})

const router = useRouter()
const userStore = useUserStore()
const applicationStore = useApplicationStore()

// 状态
const showAppMenu = ref(false)
const showCreateAppDialog = ref(false)
const creatingApp = ref(false)

// 新应用表单
const newApp = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    {required: true, message: '请输入应用名称', trigger: 'blur'}
  ],
  description: [
    {required: true, message: '请输入应用描述', trigger: 'blur'}
  ]
}

// 应用菜单项（二级导航）
const appMenuItems = computed(() => [
  {
    title: i18n.global.t(v_scope + 'application_agent_manage'),
    icon: RobotOutlined,
    to: '/app-agents'
  },
  {
    title: '对话管理',
    icon: MessageOutlined,
    to: '/app-conversations'
  }
])

// 选择应用
const selectApp = (app: any) => {
  applicationStore.selectApplication(app)
  showAppMenu.value = false
}


// 创建应用
const createApp = async () => {
  try {
    creatingApp.value = true
    await applicationStore.saveApplication(newApp)

    // 重置表单
    newApp.name = ''
    newApp.description = ''
    showCreateAppDialog.value = false
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
  await applicationStore.initializeApplications()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.lemon-theme {
  min-height: 100vh;
  background: #FFFFFF;
}

.main-navbar {
  background: #FFFFFF !important;
  padding: 0;
  height: 64px;
  line-height: 64px;
  border-bottom: 1px solid #F0F0F0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
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
  color: #333333 !important;
  border: none !important;
  height: 40px;
  padding: 0 12px;
}

.app-select-btn:hover,
.system-btn:hover,
.user-btn:hover {
  background: #F8F8F8 !important;
  color: #333333 !important;
}

.app-menu-bar {
  margin-left: 16px;
  flex: 1;
  display: flex;
  align-items: center;
}

.app-menu-horizontal {
  background: transparent;
  border: none;
  line-height: 64px;
  flex: 1;
  display: flex;
  align-items: center;
}

.app-menu-horizontal .ant-menu-item {
  color: #333333;
  border-bottom: 2px solid transparent;
  margin: 0 8px;
  padding: 0 16px;
  white-space: nowrap;
}

.app-menu-horizontal .ant-menu-item:hover {
  color: #5ab067;
  border-bottom-color: #5ab067;
}

.app-menu-horizontal .ant-menu-item-selected {
  color: #5ab067;
  border-bottom-color: #5ab067;
  background: transparent;
}

.app-menu {
  min-width: 300px;
}

.system-menu {
  background: #FFFFFF;
  border: 1px solid #F0F0F0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  padding: 8px 0;
}

.system-menu .ant-menu-item {
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  font-size: 14px;
  margin: 0;
  border-radius: 0;

  &:hover {
    background-color: #F5F5F5;
    color: #5ab067;
  }

  .anticon {
    font-size: 14px;
    margin-right: 8px;
  }
}

.user-menu {
  min-width: 160px;
  padding: 8px 0;
}

.user-menu .ant-menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  font-size: 14px;
  margin: 0;
}

.user-menu .ant-menu-item:hover {
  background-color: #F5F5F5;
}

.user-menu .ant-menu-item .anticon {
  font-size: 16px;
  margin-right: 12px;
}

.user-menu .ant-menu-item-disabled {
  cursor: default;
  opacity: 1;
}

.app-menu-item {
  .app-name {
    font-weight: 500;
    color: #333333;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .selected-icon {
      color: #5ab067;
      font-size: 14px;
      margin-left: 8px;
    }
  }

  .app-description {
    font-size: 12px;
    color: #666666;
    margin-top: 2px;
  }
}

// 选中状态的应用菜单项样式
.app-menu-item-selected {
  background-color: #f6ffed !important;
  border-right: 3px solid #5ab067 !important;

  .app-name {
    color: #5ab067 !important;
    font-weight: 600 !important;
  }

  .app-description {
    color: #52c41a !important;
  }
}

// 应用菜单项悬停效果
.ant-menu-item:hover {
  background-color: #f0f9ff !important;

  &.app-menu-item-selected {
    background-color: #f6ffed !important;
  }
}

.empty-apps {
  padding: 24px 16px;
  text-align: center;
  background: #FAFAFA;
  border-radius: 6px;
  margin: 8px 16px;

  .empty-icon {
    font-size: 32px;
    color: #CCCCCC;
    margin-bottom: 8px;
  }

  .empty-text {
    font-size: 14px;
    color: #666666;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .empty-hint {
    font-size: 12px;
    color: #999999;
  }
}

.user-info {
  .user-name {
    font-weight: 500;
    color: #333333;
  }

  .user-subtitle {
    font-size: 12px;
    color: #666666;
    margin-top: 2px;
  }
}

.main-content {
  height: calc(100vh - 64px);
  overflow: hidden;
  background: #FFFFFF;
}

.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content-area {
  height: 100%;
  overflow-y: auto;
  background: #FFFFFF;
  padding: 0;
}

/* 自定义滚动条样式 */
.main-content-area::-webkit-scrollbar {
  width: 8px;
}

.main-content-area::-webkit-scrollbar-track {
  background: #F5F5F5;
  border-radius: 4px;
}

.main-content-area::-webkit-scrollbar-thumb {
  background: #CCCCCC;
  border-radius: 4px;
}

.main-content-area::-webkit-scrollbar-thumb:hover {
  background: #BBBBBB;
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

/* 应用设置二级菜单样式 */
.settings-submenu {
  .ant-menu-submenu-title {
    color: #333333;
    border-bottom: 2px solid transparent;
    margin: 0 8px;
    padding: 0 16px;
    white-space: nowrap;

    &:hover {
      color: #5ab067;
      border-bottom-color: #5ab067;
    }
  }

  &.ant-menu-submenu-open .ant-menu-submenu-title {
    color: #5ab067;
    border-bottom-color: #5ab067;
  }
}

.settings-submenu .ant-menu-sub {
  background: #FFFFFF;
  border: 1px solid #F0F0F0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;

  .ant-menu-item {
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    margin: 0;
    border-radius: 0;

    &:hover {
      background-color: #F5F5F5;
      color: #5ab067;
    }

    .anticon {
      margin-right: 8px;
      font-size: 14px;
    }
  }
}

/* 二级菜单箭头样式 */
.submenu-arrow {
  margin-left: 4px;
  font-size: 12px;
  color: #666666;
}
</style> 