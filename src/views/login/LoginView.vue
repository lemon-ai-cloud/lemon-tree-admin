<template>
  <div class="login-container">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="login-card" elevation="8">
            <!-- Logo和标题区域 -->
            <div class="text-center pa-8 pb-4">
              <v-icon
                size="64"
                color="primary"
                class="mb-4"
              >
                mdi-leaf
              </v-icon>
              <h1 class="text-h4 font-weight-light text-primary mb-2">
                Lemon Tree
              </h1>
              <p class="text-body-1 text-medium-emphasis">
                智能管理平台
              </p>
            </div>

            <!-- 登录表单 -->
            <v-card-text class="pa-8 pt-0">
              <v-form @submit.prevent="handleLogin" ref="loginForm">
                <v-text-field
                  v-model="form.number"
                  label="账号"
                  name="number"
                  prepend-inner-icon="mdi-account"
                  type="text"
                  :rules="[rules.required]"
                  variant="outlined"
                  size="large"
                  required
                  class="mb-4"
                />

                <v-text-field
                  v-model="form.password"
                  label="密码"
                  name="password"
                  prepend-inner-icon="mdi-lock"
                  type="password"
                  :rules="[rules.required]"
                  variant="outlined"
                  size="large"
                  required
                  class="mb-6"
                />

                <v-btn
                  color="primary"
                  size="large"
                  :loading="userStore.isLoading"
                  :disabled="userStore.isLoading"
                  @click="handleLogin"
                  block
                  class="mb-4"
                  elevation="2"
                >
                  {{ userStore.isLoading ? '登录中...' : '登录' }}
                </v-btn>
              </v-form>
            </v-card-text>

            <!-- 错误提示 -->
            <v-card-text v-if="error" class="pa-8 pt-0">
              <v-alert
                type="error"
                variant="tonal"
                class="mb-0"
                density="compact"
              >
                {{ error }}
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const form = reactive({
  number: '',
  password: ''
})

// 表单验证规则
const rules = {
  required: (value: string) => !!value || '此字段为必填项'
}

// 错误信息
const error = ref('')

// 登录表单引用
const loginForm = ref()

// 处理登录
const handleLogin = async () => {
  try {
    error.value = ''
    
    // 验证表单
    const { valid } = await loginForm.value.validate()
    if (!valid) return
    
    // 执行登录
    await userStore.login(form.number, form.password)
    
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
}

.login-card {
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

/* 响应式设计 */
@media (max-width: 600px) {
  .login-card {
    margin: 16px;
    border-radius: 12px;
  }
}
</style> 