<template>
  <div class="login-container">
    <div class="login-content">
      <a-card class="login-card" :bordered="false">
        <!-- Logo和标题区域 -->
        <div class="login-header">
          <a-typography-title :level="1" class="login-title">
            <template #icon>
              <BranchesOutlined class="login-icon" />
            </template>
            Lemon Tree
          </a-typography-title>
          <a-typography-text class="login-subtitle">
            智能管理平台
          </a-typography-text>
        </div>

        <!-- 登录表单 -->
        <a-form
          :model="form"
          :rules="rules"
          @finish="handleLogin"
          layout="vertical"
          class="login-form"
        >
          <a-form-item name="number" label="账号">
            <a-input
              v-model:value="form.number"
              size="large"
              placeholder="请输入账号"
              :prefix="h(UserOutlined)"
            />
          </a-form-item>

          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="form.password"
              size="large"
              placeholder="请输入密码"
              :prefix="h(LockOutlined)"
            />
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="userStore.isLoading"
              :disabled="userStore.isLoading"
              block
              class="login-button"
            >
              {{ userStore.isLoading ? '登录中...' : '登录' }}
            </a-button>
          </a-form-item>
        </a-form>

        <!-- 错误提示 -->
        <a-alert
          v-if="error"
          type="error"
          :message="error"
          show-icon
          class="login-error"
        />
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'
import { 
  UserOutlined, 
  LockOutlined, 
  BranchesOutlined 
} from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const form = reactive({
  number: '',
  password: ''
})

// 表单验证规则
const rules = {
  number: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 错误信息
const error = ref('')

// 处理登录
const handleLogin = async (values: any) => {
  try {
    error.value = ''

    // 执行登录
    await userStore.login(values.number, values.password)

    // 登录成功，跳转到首页
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.error || '登录失败，请检查账号密码'
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-content {
  width: 100%;
  max-width: 400px;
}

.login-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  color: #5ab067 !important;
  margin-bottom: 8px !important;
  font-weight: 300 !important;
}

.login-icon {
  font-size: 48px;
  color: #5ab067;
  margin-right: 12px;
}

.login-subtitle {
  color: #666;
  font-size: 16px;
}

.login-form {
  margin-bottom: 16px;
}

.login-button {
  height: 48px;
  font-size: 16px;
  background: #5ab067;
  border-color: #5ab067;
}

.login-button:hover {
  background: #4a9a57;
  border-color: #4a9a57;
}

.login-error {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .login-content {
    max-width: 100%;
  }
  
  .login-card {
    margin: 0;
    border-radius: 12px;
  }
}
</style> 