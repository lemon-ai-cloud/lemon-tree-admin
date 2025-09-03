<template>
  <div class="user-management lemon-theme">
    <!-- 页面头部 -->
    <PageHeader
      title="系统用户管理"
      subtitle="管理系统用户账号和权限"
      :icon="TeamOutlined"
    >
      <template #actions>
        <a-button
          type="primary"
          size="large"
          @click="showDrawer = true"
          class="create-btn"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          创建用户
        </a-button>
      </template>
    </PageHeader>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <a-card class="user-card">
        <!-- 搜索栏 -->
        <div class="search-section">
          <a-input
            v-model:value="search"
            placeholder="搜索用户姓名、账号或邮箱"
            size="large"
            class="search-field"
            allow-clear
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>

        <!-- 用户列表 -->
        <div class="table-section">
          <a-table
            :columns="columns"
            :data-source="filteredUsers"
            :loading="loading"
            :pagination="false"
            class="user-table"
            row-key="id"
          >
            <!-- 创建时间列 -->
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'created_at'">
                <span class="text-secondary">
                  {{ formatDate(record.created_at) }}
                </span>
              </template>
              
              <!-- 操作列 -->
              <template v-if="column.key === 'actions'">
                <div class="action-buttons">
                  <a-button
                    type="text"
                    size="small"
                    @click="editUser(record)"
                    class="action-btn"
                  >
                    <template #icon>
                      <EditOutlined />
                    </template>
                  </a-button>
                  <a-button
                    type="text"
                    size="small"
                    danger
                    @click="deleteUser(record)"
                    class="action-btn"
                  >
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </div>
              </template>
            </template>

            <!-- 空状态 -->
            <template #emptyText>
              <div class="empty-state">
                <TeamOutlined class="empty-icon" />
                <a-typography-title :level="4" class="empty-title">
                  暂无用户数据
                </a-typography-title>
                <a-typography-text class="empty-subtitle">
                  点击"创建用户"按钮添加第一个用户
                </a-typography-text>
                <a-button
                  type="primary"
                  @click="showDrawer = true"
                  class="empty-action"
                >
                  <template #icon>
                    <PlusOutlined />
                  </template>
                  创建用户
                </a-button>
              </div>
            </template>
          </a-table>
        </div>
      </a-card>
    </div>

    <!-- 创建/编辑用户抽屉 -->
    <a-drawer
      v-model:open="showDrawer"
      placement="right"
      width="500"
      class="user-drawer"
      :title="editingUser ? '编辑用户' : '创建用户'"
      :footer="false"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        @finish="saveUser"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="name" label="用户姓名">
              <a-input
                v-model:value="form.name"
                placeholder="请输入用户姓名"
                size="large"
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item name="number" label="用户账号">
              <a-input
                v-model:value="form.number"
                placeholder="请输入用户账号"
                size="large"
              >
                <template #prefix>
                  <KeyOutlined />
                </template>
              </a-input>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item name="email" label="用户邮箱">
              <a-input
                v-model:value="form.email"
                placeholder="请输入用户邮箱"
                size="large"
              >
                <template #prefix>
                  <MailOutlined />
                </template>
              </a-input>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item 
              name="password" 
              label="密码"
              :rules="editingUser ? [] : rules.password"
            >
              <a-input-password
                v-model:value="form.password"
                :placeholder="editingUser ? '留空则不修改密码' : '请输入密码'"
                size="large"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>
          </a-col>
        </a-row>

        <div class="drawer-actions">
          <a-space>
            <a-button @click="closeDrawer" :disabled="saving">
              取消
            </a-button>
            <a-button
              type="primary"
              :loading="saving"
              html-type="submit"
            >
              {{ editingUser ? '更新' : '创建' }}
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-drawer>

    <!-- 删除确认对话框 -->
    <a-modal
      v-model:open="showDeleteDialog"
      title="确认删除"
      @ok="confirmDelete"
      :confirm-loading="deleting"
      ok-text="删除"
      cancel-text="取消"
      ok-type="danger"
    >
      <div class="delete-content">
        <ExclamationCircleOutlined class="delete-icon" />
        <p>确定要删除用户 "{{ userToDelete?.name }}" 吗？此操作不可恢复。</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userStore.ts'
import userService from '@/services/userService.ts'
import type { SystemUser } from '@/dto/user.ts'
import PageHeader from '@/components/PageHeader.vue'
import {
  TeamOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  KeyOutlined,
  MailOutlined,
  LockOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

const userStore = useUserStore()

// 状态
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDrawer = ref(false)
const showDeleteDialog = ref(false)
const users = ref<SystemUser[]>([])
const editingUser = ref<SystemUser | null>(null)
const userToDelete = ref<SystemUser | null>(null)
const search = ref('')

// 表单数据
const form = reactive({
  name: '',
  number: '',
  email: '',
  password: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入用户姓名', trigger: 'blur' }
  ],
  number: [
    { required: true, message: '请输入用户账号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入用户邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 表格列定义
const columns = [
  {
    title: '用户姓名',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '用户账号',
    dataIndex: 'number',
    key: 'number',
    width: 150
  },
  {
    title: '用户邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 200
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!search.value) return users.value
  
  const searchLower = search.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(searchLower) ||
    user.number.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower)
  )
})

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await userService.getAllUsers()
    users.value = response.users
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 编辑用户
const editUser = (user: SystemUser) => {
  editingUser.value = user
  form.name = user.name
  form.number = user.number
  form.email = user.email
  form.password = ''
  showDrawer.value = true
}

// 删除用户
const deleteUser = (user: SystemUser) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!userToDelete.value) return
  
  try {
    deleting.value = true
    await userService.deleteUser(userToDelete.value.id)
    await fetchUsers()
    showDeleteDialog.value = false
    userToDelete.value = null
    message.success('用户删除成功')
  } catch (error) {
    console.error('删除用户失败:', error)
    message.error('删除用户失败')
  } finally {
    deleting.value = false
  }
}

// 保存用户
const saveUser = async (values: any) => {
  try {
    saving.value = true
    
    if (editingUser.value) {
      // 更新用户
      await userService.saveUser({
        id: editingUser.value.id,
        ...values,
        password: values.password || undefined
      })
      message.success('用户更新成功')
    } else {
      // 创建用户
      await userService.saveUser(values)
      message.success('用户创建成功')
    }
    
    await fetchUsers()
    closeDrawer()
  } catch (error) {
    console.error('保存用户失败:', error)
    message.error('保存用户失败')
  } finally {
    saving.value = false
  }
}

// 关闭抽屉
const closeDrawer = () => {
  showDrawer.value = false
  editingUser.value = null
  form.name = ''
  form.number = ''
  form.email = ''
  form.password = ''
}

// 初始化
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.user-management {
  padding: 24px;
  background: #FFFFFF;
  min-height: 100vh;
}

.create-btn {
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
}

.content-area {
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #F0F0F0;
}

.user-card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.search-section {
  padding: 24px 24px 0;
}

.search-field {
  max-width: 400px;
}

.table-section {
  padding: 0 24px 24px;
}

.user-table {
  .ant-table-thead > tr > th {
    background: #FAFAFA;
    font-weight: 500;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px;
  min-width: 32px;
  height: 32px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 48px;
  color: #CCCCCC;
  margin-bottom: 16px;
}

.empty-title {
  margin-bottom: 8px !important;
  color: #666666 !important;
}

.empty-subtitle {
  color: #666666;
  margin-bottom: 24px;
  display: block;
}

.empty-action {
  height: 40px;
  padding: 0 24px;
}

.user-drawer {
  .ant-drawer-header {
    border-bottom: 1px solid #F0F0F0;
  }
  
  .ant-drawer-body {
    padding: 24px;
  }
}

.drawer-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #F0F0F0;
  text-align: right;
}

.delete-content {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .delete-icon {
    font-size: 24px;
    color: #ff4d4f;
  }
  
  p {
    margin: 0;
    color: #333333;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .search-field {
    max-width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style> 