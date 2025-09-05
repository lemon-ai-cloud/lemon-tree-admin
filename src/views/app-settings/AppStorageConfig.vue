<template>
  <div class="app-storage-config">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $v_translate('page_title') }}</h1>
        <p class="page-description">{{ $v_translate('page_description') }}</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="handleSave" :loading="saving">
          <template #icon>
            <SaveOutlined/>
          </template>
          {{ $v_translate('save_config') }}
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
          <a-form-item name="type" :label="$v_translate('storage_type')">
            <a-radio-group v-model:value="formData.type" @change="handleStorageTypeChange">
              <a-radio value="file_system">{{ $v_translate('file_system') }}</a-radio>
              <a-radio value="s3">{{ $v_translate('s3_storage') }}</a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- 文件系统配置 -->
          <template v-if="formData.type === 'file_system'">
            <a-form-item name="root_path" :label="$v_translate('root_path')">
              <a-input
                  v-model:value="formData.root_path"
                  :placeholder="$v_translate('enter_root_path')"
                  size="large"
              />
            </a-form-item>
          </template>

          <!-- S3存储配置 -->
          <template v-if="formData.type === 's3'">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="endpoint" :label="$v_translate('endpoint')">
                  <a-input
                      v-model:value="formData.endpoint"
                      :placeholder="$v_translate('enter_endpoint')"
                      size="large"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item name="region" :label="$v_translate('region')">
                  <a-input
                      v-model:value="formData.region"
                      :placeholder="$v_translate('enter_region')"
                      size="large"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item name="bucket_name" :label="$v_translate('bucket_name')">
              <a-input
                  v-model:value="formData.bucket_name"
                  :placeholder="$v_translate('enter_bucket_name')"
                  size="large"
              />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="secret_id" :label="$v_translate('secret_id')">
                  <a-input
                      v-model:value="formData.secret_id"
                      :placeholder="$v_translate('enter_secret_id')"
                      size="large"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item name="secret_key" :label="$v_translate('secret_key')">
                  <a-input-password
                      v-model:value="formData.secret_key"
                      :placeholder="$v_translate('enter_secret_key')"
                      size="large"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item name="key_prefix" :label="$v_translate('key_prefix')">
              <a-input
                  v-model:value="formData.key_prefix"
                  :placeholder="$v_translate('enter_key_prefix')"
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
import i18n from '@/i18n.ts'
import {SaveOutlined} from '@ant-design/icons-vue'
import type {ApplicationStorageConfigDto, SaveApplicationStorageConfigRequest} from '@/dto/applicationStorageConfig'
import applicationStorageConfigService from '@/services/applicationStorageConfigService'
import {useApplicationStore} from '@/stores/applicationStore'

const v_scope = 'views.app_settings.app_storage_config.'
defineExpose({
  v_scope
})

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
    type: [{required: true, message: i18n.global.t(v_scope + 'select_storage_type_required'), trigger: 'change'}]
  }

  if (formData.type === 'file_system') {
    rules.root_path = [{required: true, message: i18n.global.t(v_scope + 'enter_root_path_required'), trigger: 'blur'}]
  } else if (formData.type === 's3') {
    rules.endpoint = [{required: true, message: i18n.global.t(v_scope + 'enter_endpoint_required'), trigger: 'blur'}]
    rules.region = [{required: true, message: i18n.global.t(v_scope + 'enter_region_required'), trigger: 'blur'}]
    rules.bucket_name = [{required: true, message: i18n.global.t(v_scope + 'enter_bucket_name_required'), trigger: 'blur'}]
    rules.secret_id = [{required: true, message: i18n.global.t(v_scope + 'enter_secret_id_required'), trigger: 'blur'}]
    rules.secret_key = [{required: true, message: i18n.global.t(v_scope + 'enter_secret_key_required'), trigger: 'blur'}]
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
    message.warning(i18n.global.t(v_scope + 'please_select_application'))
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
    message.error(i18n.global.t(v_scope + 'load_config_failed'))
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
      message.error(i18n.global.t(v_scope + 'application_id_required'))
      return
    }

    saving.value = true

    await applicationStorageConfigService.saveApplicationStorageConfig(formData)
    message.success(i18n.global.t(v_scope + 'config_save_success'))
    
    // 重新加载配置以获取最新的ID
    await loadConfig()
  } catch (error) {
    console.error('保存配置失败:', error)
    message.error(i18n.global.t(v_scope + 'config_save_failed'))
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
    return i18n.global.t(v_scope + 'file_system_description')
  } else if (formData.type === 's3') {
    return i18n.global.t(v_scope + 's3_storage_description')
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