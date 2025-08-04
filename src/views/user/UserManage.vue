<template>
  <div class="user-management lemon-theme">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <v-icon size="32" color="primary" class="mr-3">mdi-account-group</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">用户管理</h1>
            <p class="text-body-2 text-medium-emphasis">管理系统用户账号和权限</p>
          </div>
        </div>
        <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="showDrawer = true"
            class="create-btn"
        >
          创建用户
        </v-btn>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <v-card class="user-card" elevation="2">
        <!-- 搜索栏 -->
        <div class="search-section">
          <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="搜索用户姓名、账号或邮箱"
              variant="outlined"
              density="comfortable"
              hide-details
              class="search-field"
              clearable
          />
        </div>

        <!-- 用户列表 -->
        <div class="table-section">
          <v-data-table
              :headers="headers"
              :items="users"
              :search="search"
              :loading="loading"
              class="user-table"
              hover
              item-value="id"
          >
            <!-- 创建时间列 -->
            <template v-slot:item.created_at="{ item }">
              <span class="text-body-2 text-medium-emphasis">
                {{ formatDate(item.created_at) }}
              </span>
            </template>

            <!-- 操作列 -->
            <template v-slot:item.actions="{ item }">
              <div class="action-buttons">
                <v-btn
                    icon="mdi-pencil"
                    size="small"
                    color="primary"
                    variant="text"
                    @click="editUser(item)"
                    class="action-btn"
                />
                <v-btn
                    icon="mdi-delete"
                    size="small"
                    color="error"
                    variant="text"
                    @click="deleteUser(item)"
                    class="action-btn"
                />
              </div>
            </template>

            <!-- 空状态 -->
            <template v-slot:no-data>
              <div class="empty-state">
                <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-account-group-outline</v-icon>
                <h3 class="text-h6 mb-2">暂无用户数据</h3>
                <p class="text-body-2 text-medium-emphasis mb-4">点击"创建用户"按钮添加第一个用户</p>
                <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="showDrawer = true"
                >
                  创建用户
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card>
    </div>

    <!-- 创建/编辑用户抽屉 -->
    <v-navigation-drawer
        v-model="showDrawer"
        location="right"
        temporary
        width="500"
        class="user-drawer"
    >
      <div class="drawer-header">
        <div class="d-flex align-center">
          <v-icon size="24" color="primary" class="mr-3">
            {{ editingUser ? 'mdi-pencil' : 'mdi-plus' }}
          </v-icon>
          <span class="text-h5 font-weight-bold">
            {{ editingUser ? '编辑用户' : '创建用户' }}
          </span>
        </div>
        <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeDrawer"
        />
      </div>

      <div class="drawer-content">
        <v-form ref="formRef" @submit.prevent="saveUser">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="form.name" label="用户姓名"
                  :rules="[rules.required]" variant="outlined"
                  density="comfortable" prepend-inner-icon="mdi-account"
                  required/>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                  v-model="form.number" label="用户账号"
                  :rules="[rules.required]" variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-account-key"
                  required/>
            </v-col>

            <v-col cols="12">
              <v-text-field
                  v-model="form.email" label="用户邮箱" :rules="[rules.required, rules.email]" variant="outlined"
                  density="comfortable" prepend-inner-icon="mdi-email" required/>
            </v-col>

            <v-col cols="12">
              <v-text-field
                  v-model="form.password"
                  label="密码(留空则不修改密码)"
                  :rules="editingUser ? [] : [rules.required]"
                  variant="outlined"
                  density="comfortable"
                  type="password"
                  prepend-inner-icon="mdi-lock"
                  :required="!editingUser"
                  :placeholder="editingUser ? '留空则不修改密码' : '请输入密码'"
              />
            </v-col>
          </v-row>
        </v-form>
      </div>

      <div class="drawer-actions">
        <div class="d-flex">
          <v-btn
              variant="outlined"
              color="grey"
              @click="closeDrawer"
              :disabled="saving"
              class="flex-1"
          >
            取消
          </v-btn>
          <v-btn
              color="primary"
              :loading="saving"
              @click="saveUser"
              class="flex-1 ml-6"
          >
            {{ editingUser ? '更新' : '创建' }}
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400px" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          确认删除
        </v-card-title>

        <v-card-text>
          <p class="text-body-1">
            确定要删除用户 <strong>"{{ deletingUser?.name }}"</strong> 吗？
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            此操作无法撤销，删除后该用户将无法登录系统。
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer/>
          <v-btn
              variant="outlined"
              color="grey"
              @click="showDeleteDialog = false"
          >
            取消
          </v-btn>
          <v-btn
              color="error"
              @click="confirmDeleteUser"
              class="ml-3"
          >
            确认删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue'
import type {SaveUserRequest, SystemUser} from '@/dto/user.ts'
import userService from '@/services/userService'

// 状态
const users = ref<SystemUser[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showDrawer = ref(false)
const editingUser = ref<SystemUser | null>(null)
const showDeleteDialog = ref(false)
const deletingUser = ref<SystemUser | null>(null)

// 表单数据
const form = ref<SaveUserRequest>({
  name: '',
  number: '',
  email: '',
  password: ''
})

// 表单验证规则
const rules = {
  required: (value: string) => !!value || '此字段为必填项',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || '请输入有效的邮箱地址'
  }
}

// 表格头部
const headers = [
  {title: '姓名', key: 'name', sortable: true, width: '20%'},
  {title: '账号', key: 'number', sortable: true, width: '20%'},
  {title: '邮箱', key: 'email', sortable: true, width: '25%'},
  {title: '创建时间', key: 'created_at', sortable: true, width: '15%'},
  {title: '操作', key: 'actions', sortable: false, width: '10%'}
]

// 表单引用
const formRef = ref()

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true
    console.log('开始获取用户列表...')
    const response = await userService.getAllUsers()
    console.log('获取用户列表成功:', response)
    users.value = response.users
  } catch (error) {
    console.error('获取用户列表失败:', error)
    // 添加更详细的错误信息
    if (error.response) {
      console.error('错误响应:', error.response.data)
      console.error('错误状态:', error.response.status)
    }
  } finally {
    loading.value = false
  }
}

// 关闭抽屉
const closeDrawer = () => {
  showDrawer.value = false
  editingUser.value = null
  // 重置表单
  form.value.id = ''
  form.value.name = ''
  form.value.number = ''
  form.value.email = ''
  form.value.password = ''
}

// 编辑用户
const editUser = async (user: SystemUser) => {
  console.log('编辑用户数据:', user)
  editingUser.value = user
  showDrawer.value = true

  // 等待抽屉打开后再设置表单值
  await nextTick()

  form.value.id = user.id
  form.value.name = user.name
  form.value.number = user.number
  form.value.email = user.email
  form.value.password = ''

  console.log('表单数据:', form)
}

// 删除用户
const deleteUser = async (user: SystemUser) => {
  // 检查是否是当前用户
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.id === currentUser.id) {
    alert('不能删除当前登录用户')
    return
  }

  // 检查是否只剩一个用户
  if (users.value.length <= 1) {
    alert('系统中至少需要保留一个用户')
    return
  }

  deletingUser.value = user
  showDeleteDialog.value = true
}

// 确认删除用户
const confirmDeleteUser = async () => {
  if (!deletingUser.value) return

  try {
    // 这里需要添加删除用户的API
    console.log('删除用户:', deletingUser.value.id)
    await fetchUsers()
    showDeleteDialog.value = false
    deletingUser.value = null
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

// 保存用户
const saveUser = async () => {
  try {
    const {valid} = await formRef.value.validate()
    if (!valid) return

    saving.value = true

    const userData: SaveUserRequest = {
      id: form.value.id || undefined,
      name: form.value.name,
      number: form.value.number,
      email: form.value.email,
      password: form.value.password || ''
    }

    await userService.saveUser(userData)

    // 关闭抽屉
    closeDrawer()

    // 刷新列表
    await fetchUsers()
  } catch (error) {
    console.error('保存用户失败:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss' as *;

.user-management {
  height: 100%;
  background-color: $bg-primary;
  overflow-y: auto;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.create-btn {
  box-shadow: $shadow-medium;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: $shadow-heavy;
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.user-card {
  @include card-style;
}

.search-section {
  padding: 1.5rem 2rem;
  background-color: $bg-secondary;
  border-bottom: 1px solid $border-light;
}

.search-field {
  max-width: 400px;
}

.table-section {
  padding: 0;
}

.user-table {
  border-radius: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: $text-secondary;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.user-drawer {
  border-radius: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.drawer-header {
  @include drawer-header;
}

.drawer-content {
  @include drawer-content;
}

.drawer-actions {
  @include drawer-actions;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .content-area {
    padding: 0 1rem;
  }

  .search-section {
    padding: 1rem;
  }

  .search-field {
    max-width: 100%;
  }
}
</style> 