<template>
  <div class="app-settings">
    <div class="page-header">
      <a-typography-title :level="2" class="page-title">
        应用设置
      </a-typography-title>
    </div>

    <div class="settings-content">
      <a-row :gutter="24">
        <a-col :span="16">
          <a-card title="基本信息" class="settings-card">
            <a-form
              ref="formRef"
              :model="form"
              :rules="rules"
              layout="vertical"
              @finish="saveSettings"
            >
              <a-form-item name="name" label="应用名称">
                <a-input
                  v-model:value="form.name"
                  placeholder="请输入应用名称"
                  size="large"
                />
              </a-form-item>
              
              <a-form-item name="description" label="应用描述">
                <a-textarea
                  v-model:value="form.description"
                  placeholder="请输入应用描述"
                  :rows="4"
                  size="large"
                />
              </a-form-item>
              
              <a-form-item>
                <a-button
                  type="primary"
                  :loading="saving"
                  html-type="submit"
                  size="large"
                >
                  保存设置
                </a-button>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card title="存储配置" class="settings-card">
            <a-form layout="vertical">
              <a-form-item label="存储类型">
                <a-select
                  v-model:value="storageConfig.type"
                  placeholder="请选择存储类型"
                  size="large"
                >
                  <a-select-option value="file_system">文件系统</a-select-option>
                  <a-select-option value="s3">S3存储</a-select-option>
                  <a-select-option value="minio">MinIO</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item v-if="storageConfig.type === 'file_system'" label="根路径">
                <a-input
                  v-model:value="storageConfig.rootPath"
                  placeholder="请输入根路径"
                  size="large"
                />
              </a-form-item>
              
              <a-form-item v-if="storageConfig.type === 's3'" label="S3 Endpoint">
                <a-input
                  v-model:value="storageConfig.endpoint"
                  placeholder="请输入S3 Endpoint"
                  size="large"
                />
              </a-form-item>
              
              <a-form-item v-if="storageConfig.type === 's3'" label="Bucket名称">
                <a-input
                  v-model:value="storageConfig.bucketName"
                  placeholder="请输入Bucket名称"
                  size="large"
                />
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="24" style="margin-top: 24px;">
        <a-col :span="12">
          <a-card title="网络搜索配置" class="settings-card">
            <a-form layout="vertical">
              <a-form-item label="搜索类型">
                <a-select
                  v-model:value="netSearchConfig.type"
                  placeholder="请选择搜索类型"
                  size="large"
                >
                  <a-select-option value="bing">Bing搜索</a-select-option>
                  <a-select-option value="google">Google搜索</a-select-option>
                  <a-select-option value="custom">自定义API</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="API URL">
                <a-input
                  v-model:value="netSearchConfig.apiUrl"
                  placeholder="请输入API URL"
                  size="large"
                />
              </a-form-item>
              
              <a-form-item label="API密钥">
                <a-input-password
                  v-model:value="netSearchConfig.apiKey"
                  placeholder="请输入API密钥"
                  size="large"
                />
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>

        <a-col :span="12">
          <a-card title="MCP服务器配置" class="settings-card">
            <a-form layout="vertical">
              <a-form-item label="服务器地址">
                <a-input
                  v-model:value="mcpConfig.serverUrl"
                  placeholder="请输入服务器地址"
                  size="large"
                />
              </a-form-item>
              
              <a-form-item label="端口">
                <a-input-number
                  v-model:value="mcpConfig.port"
                  placeholder="请输入端口号"
                  size="large"
                  style="width: 100%"
                  :min="1"
                  :max="65535"
                />
              </a-form-item>
              
              <a-form-item label="认证令牌">
                <a-input-password
                  v-model:value="mcpConfig.authToken"
                  placeholder="请输入认证令牌"
                  size="large"
                />
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'

// 状态
const saving = ref(false)

// 表单数据
const form = reactive({
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

// 存储配置
const storageConfig = reactive({
  type: 'file_system',
  rootPath: '',
  endpoint: '',
  bucketName: ''
})

// 网络搜索配置
const netSearchConfig = reactive({
  type: 'bing',
  apiUrl: '',
  apiKey: ''
})

// MCP服务器配置
const mcpConfig = reactive({
  serverUrl: '',
  port: 3000,
  authToken: ''
})

// 表单引用
const formRef = ref()

// 保存设置
const saveSettings = async (values: any) => {
  try {
    saving.value = true
    
    // 这里调用API保存设置
    console.log('保存设置:', {
      ...values,
      storageConfig,
      netSearchConfig,
      mcpConfig
    })
    
    message.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    message.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 获取当前设置
const fetchSettings = async () => {
  try {
    // 这里调用API获取当前设置
    // const response = await settingsService.getSettings()
    
    // 模拟数据
    form.name = 'Lemon Tree Admin'
    form.description = '智能管理平台'
    storageConfig.type = 'file_system'
    storageConfig.rootPath = '/data/storage'
    netSearchConfig.type = 'bing'
    netSearchConfig.apiUrl = 'https://api.bing.com/search'
    mcpConfig.serverUrl = 'localhost'
    mcpConfig.port = 3000
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

// 初始化
onMounted(() => {
  fetchSettings()
})
</script>

<style scoped lang="scss">
.app-settings {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  margin-bottom: 0 !important;
  color: #333 !important;
}

.settings-content {
  .settings-card {
    height: 100%;
    
    .ant-card-head {
      border-bottom: 1px solid #f0f0f0;
    }
    
    .ant-card-body {
      padding: 24px;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-settings {
    padding: 16px;
  }
  
  .settings-content {
    .ant-col {
      margin-bottom: 16px;
    }
  }
}
</style> 