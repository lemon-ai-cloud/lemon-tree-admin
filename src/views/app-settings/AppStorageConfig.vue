<template>
  <div class="app-storage-config">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">存储配置</h1>
        <p class="page-description">配置应用的存储方式，支持文件系统和S3存储</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="handleSave" :loading="saving">
          <template #icon>
            <SaveOutlined/>
          </template>
          保存配置
        </a-button>
      </div>
    </div>

    <!-- 配置表单 -->
    <div class="config-form">
      <a-card>
        <a-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            layout="vertical"
        >
          <!-- 存储类型选择 -->
          <a-form-item name="type" label="存储类型">
            <a-radio-group v-model:value="formData.type" @change="handleStorageTypeChange">
              <a-radio value="file_system">文件系统</a-radio>
              <a-radio value="s3">S3存储</a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- 文件系统配置 -->
          <template v-if="formData.type === 'file_system'">
            <a-form-item name="root_path" label="根路径">
              <a-input
                  v-model:value="formData.root_path"
                  placeholder="请输入文件系统根路径，如：/data/storage"
                  size="large"
              />
            </a-form-item>
          </template>

          <!-- S3存储配置 -->
          <template v-if="formData.type === 's3'">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="endpoint" label="Endpoint">
                  <a-input
                      v-model:value="formData.endpoint"
                      placeholder="请输入S3存储桶endpoint"
                      size="large"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item name="region" label="Region">
                  <a-input
                      v-model:value="formData.region"
                      placeholder="请输入S3存储桶区域"
                      size="large"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item name="bucket_name" label="存储桶名称">
              <a-input
                  v-model:value="formData.bucket_name"
                  placeholder="请输入S3存储桶名称"
                  size="large"
              />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="secret_id" label="Secret ID">
                  <a-input
                      v-model:value="formData.secret_id"
                      placeholder="请输入S3存储安全ID"
                      size="large"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item name="secret_key" label="Secret Key">
                  <a-input-password
                      v-model:value="formData.secret_key"
                      placeholder="请输入S3存储密钥"
                      size="large"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item name="key_prefix" label="Key前缀">
              <a-input
                  v-model:value="formData.key_prefix"
                  placeholder="请输入S3存储文件key前缀，用于设置根路径"
                  size="large"
              />
            </a-form-item>
          </template>

          <!-- 配置说明 -->
          <a-alert
              :message="getStorageTypeDescription()"
              type="info"
              show-icon
              style="margin-top: 16px"
          />
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed, watch} from 'vue'
import {message} from 'ant-design-vue'
import {SaveOutlined} from '@ant-design/icons-vue'
import type {ApplicationStorageConfigDto, SaveApplicationStorageConfigRequest} from '@/dto/applicationStorageConfig'
import applicationStorageConfigService from '@/services/applicationStorageConfigService'
import {useApplicationStore} from '@/stores/applicationStore'

// 应用状态管理
const applicationStore = useApplicationStore()

// 响应式数据
const saving = ref(false)
const loading = ref(false)

// 表单数据
const formData = reactive<SaveApplicationStorageConfigRequest>({
  id: undefined,
  type: 'file_system',
  application_id: '',
  root_path: '',
  endpoint: '',
  region: '',
  bucket_name: '',
  secret_id: '',
  secret_key: '',
  key_prefix: ''
})

// 表单验证规则
const formRules = computed(() => {
  const rules: any = {
    type: [{required: true, message: '请选择存储类型', trigger: 'change'}]
  }

  if (formData.type === 'file_system') {
    rules.root_path = [{required: true, message: '请输入文件系统根路径', trigger: 'blur'}]
  } else if (formData.type === 's3') {
    rules.endpoint = [{required: true, message: '请输入S3存储桶endpoint', trigger: 'blur'}]
    rules.region = [{required: true, message: '请输入S3存储桶区域', trigger: 'blur'}]
    rules.bucket_name = [{required: true, message: '请输入S3存储桶名称', trigger: 'blur'}]
    rules.secret_id = [{required: true, message: '请输入S3存储安全ID', trigger: 'blur'}]
    rules.secret_key = [{required: true, message: '请输入S3存储密钥', trigger: 'blur'}]
  }

  return rules
})

// 表单引用
const formRef = ref()

// 生命周期
onMounted(() => {
  // 初始化表单数据
  if (applicationStore.selectedApplication?.id) {
    formData.application_id = applicationStore.selectedApplication.id
  }
  loadConfig()
})

// 监听应用选择变化
watch(
    () => applicationStore.selectedApplication?.id,
    (newAppId) => {
      if (newAppId) {
        formData.application_id = newAppId
        // 重新加载配置
        loadConfig()
      }
    }
)

// 加载配置
const loadConfig = async () => {
  if (!applicationStore.selectedApplication?.id) {
    message.warning('请先选择一个应用')
    return
  }

  loading.value = true
  try {
    const response = await applicationStorageConfigService.getApplicationStorageConfigByApplicationID(
        applicationStore.selectedApplication.id
    )
    
    if (response.application_storage_config) {
      // 如果存在配置，填充表单
      const config = response.application_storage_config
      Object.assign(formData, {
        id: config.id,
        type: config.type,
        application_id: config.application_id,
        root_path: config.root_path,
        endpoint: config.endpoint,
        region: config.region,
        bucket_name: config.bucket_name,
        secret_id: config.secret_id,
        secret_key: config.secret_key,
        key_prefix: config.key_prefix
      })
    } else {
      // 如果不存在配置，重置表单
      resetForm()
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    message.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

// 存储类型变化处理
const handleStorageTypeChange = () => {
  // 清空其他类型的字段
  if (formData.type === 'file_system') {
    formData.endpoint = ''
    formData.region = ''
    formData.bucket_name = ''
    formData.secret_id = ''
    formData.secret_key = ''
    formData.key_prefix = ''
  } else if (formData.type === 's3') {
    formData.root_path = ''
  }
}

// 保存配置
const handleSave = async () => {
  try {
    await formRef.value.validate()

    if (!formData.application_id) {
      message.error('应用ID不能为空，请重新选择应用')
      return
    }

    saving.value = true

    await applicationStorageConfigService.saveApplicationStorageConfig(formData)
    message.success('配置保存成功')
    
    // 重新加载配置以获取最新的ID
    await loadConfig()
  } catch (error) {
    console.error('保存配置失败:', error)
    message.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  const currentAppId = applicationStore.selectedApplication?.id || ''
  
  Object.assign(formData, {
    id: undefined,
    type: 'file_system',
    application_id: currentAppId,
    root_path: '',
    endpoint: '',
    region: '',
    bucket_name: '',
    secret_id: '',
    secret_key: '',
    key_prefix: ''
  })

  formRef.value?.resetFields()

  if (currentAppId) {
    formData.application_id = currentAppId
  }
}

// 获取存储类型描述
const getStorageTypeDescription = () => {
  if (formData.type === 'file_system') {
    return '文件系统存储：将文件存储在服务器的本地文件系统中。适用于单机部署或内网环境。'
  } else if (formData.type === 's3') {
    return 'S3存储：将文件存储在兼容S3协议的云存储服务中。适用于分布式部署或需要高可用性的场景。'
  }
  return ''
}
</script>

<style scoped lang="scss">
.app-storage-config {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-left {
      .page-title {
        font-size: 24px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 8px 0;
      }

      .page-description {
        color: #8c8c8c;
        margin: 0;
      }
    }
  }

  .config-form {
    .ant-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .ant-form-item {
      margin-bottom: 24px;
    }

    .ant-radio-group {
      .ant-radio-wrapper {
        margin-right: 24px;
        font-size: 16px;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-storage-config {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
}
</style>