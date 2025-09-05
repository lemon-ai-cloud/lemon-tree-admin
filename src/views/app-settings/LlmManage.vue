<template>
  <div class="llm-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $v_translate('page_title') }}</h1>
        <p class="page-description">{{ $v_translate('page_description') }}</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="showCreateModal">
          <template #icon>
            <PlusOutlined/>
          </template>
          {{ $v_translate('add_provider') }}
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <a-card>
        <a-form layout="inline" :model="searchForm" @finish="handleSearch">
          <a-form-item name="name" :label="$v_translate('provider_name')">
            <a-input
                v-model:value="searchForm.name"
                :placeholder="$v_translate('enter_provider_name')"
                allow-clear
            />
          </a-form-item>
          <a-form-item name="type" :label="$v_translate('provider_type')">
            <a-select
                v-model:value="searchForm.type"
                :placeholder="$v_translate('select_provider_type')"
                allow-clear
                style="width: 200px"
            >
              <a-select-option value="openai_chat_completions_api">OpenAI Chat Completions Api</a-select-option>
              <a-select-option value="openai_responses_api">OpenAI Responses Api</a-select-option>
              <a-select-option value="ollama_api">Ollama Api</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">
              <template #icon>
                <SearchOutlined/>
              </template>
              {{ $v_translate('search') }}
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              <template #icon>
                <ReloadOutlined/>
              </template>
              {{ $v_translate('reset') }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-card>
        <a-table
            :columns="columns"
            :data-source="llmProviders"
            :loading="loading"
            :pagination="pagination"
            row-key="id"
            @change="handleTableChange"
        >
          <!-- 提供商图标 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'icon'">
              <div class="provider-icon">
                <img
                    v-if="record.icon_url && !record.icon_url.startsWith('data:')"
                    :src="getIconUrl(record.icon_url)"
                    :alt="record.name"
                    class="icon-image"
                />
                <div v-else class="icon-placeholder">
                  <ApiOutlined/>
                </div>
              </div>
            </template>

            <!-- 提供商类型 -->
            <template v-else-if="column.key === 'type'">
              <a-tag :color="getTypeColor(record.type)">
                {{ getTypeLabel(record.type) }}
              </a-tag>
            </template>

            <!-- 操作列 -->
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">
                  <template #icon>
                    <EditOutlined/>
                  </template>
                  {{ $v_translate('edit') }}
                </a-button>
                <a-button type="link" size="small" @click="handleManageModels(record)">
                  <template #icon>
                    <ApiOutlined/>
                  </template>
                  {{ $v_translate('model_management_action') }}
                </a-button>
                <a-popconfirm
                    :title="$v_translate('confirm_delete_provider')"
                    @confirm="handleDelete(record.id)"
                >
                  <a-button type="link" size="small" danger>
                    <template #icon>
                      <DeleteOutlined/>
                    </template>
                    {{ $v_translate('delete') }}
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新增/编辑对话框 -->
    <a-modal
        v-model:open="modalVisible"
        :title="modalTitle"
        width="600px"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        :confirm-loading="submitting"
    >
      <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="name" :label="$v_translate('provider_name')">
              <a-input
                  v-model:value="formData.name"
                  :placeholder="$v_translate('enter_provider_name')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="type" :label="$v_translate('provider_type')">
              <a-select
                  v-model:value="formData.type"
                  :placeholder="$v_translate('select_provider_type')"
              >
                <a-select-option value="openai_chat_completions_api">OpenAI Chat Completions Api</a-select-option>
                <a-select-option value="openai_responses_api">OpenAI Responses Api</a-select-option>
                <a-select-option value="ollama_api">Ollama Api</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="description" :label="$v_translate('provider_description')">
          <a-textarea
              v-model:value="formData.description"
              :placeholder="$v_translate('enter_provider_description')"
              :rows="3"
          />
        </a-form-item>

        <a-form-item name="api_url" :label="$v_translate('api_url')">
          <a-input
              v-model:value="formData.api_url"
              :placeholder="$v_translate('enter_api_url')"
          />
        </a-form-item>

        <a-form-item name="api_key" :label="$v_translate('api_key')">
          <a-input-password
              v-model:value="formData.api_key"
              :placeholder="$v_translate('enter_api_key')"
          />
        </a-form-item>

        <a-form-item name="icon_url" :label="$v_translate('provider_icon')">
          <div class="icon-upload">
            <a-upload
                v-model:file-list="fileList"
                :before-upload="beforeUpload"
                :show-upload-list="false"
                accept="image/*"
            >
              <div class="upload-area">
                <div v-if="!formData.icon_url" class="upload-placeholder">
                  <PlusOutlined/>
                  <div>{{ $v_translate('click_upload_icon') }}</div>
                </div>
                <img
                    v-else
                    :src="getIconUrl(formData.icon_url)"
                    :alt="formData.name"
                    class="upload-preview"
                />
              </div>
            </a-upload>
            <div class="upload-tips">
              {{ $v_translate('upload_tips') }}
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 模型管理对话框 -->
    <a-modal
        v-model:open="modelModalVisible"
        :title="$v_translate('model_management')"
        width="880px"
        :style="{ top: '20%' }"
        :body-style="{ 
          maxHeight: '60vh', 
          overflow: 'auto',
        }"
        @cancel="handleModelModalCancel"
        :footer="null"
    >
      <ApplicationLlmList 
          v-if="modelModalVisible && selectedProvider"
          :provider-id="selectedProvider.id"
          :application-id="selectedProvider.application_id"
      />
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed, watch, h} from 'vue'
import {message} from 'ant-design-vue'
import i18n from '@/i18n.ts'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined
} from '@ant-design/icons-vue'
import type {LlmProvider, SaveLlmProviderRequest, QueryLlmProviderRequest} from '@/dto/llmProvider'
import llmProviderService from '@/services/llmProviderService'
import {useApplicationStore} from '@/stores/applicationStore'
import ResourceUtils from '@/utils/resource-utils'
import ApplicationLlmList from './ApplicationLlmList.vue'

const v_scope = 'views.app_settings.llm_manage.'
defineExpose({
  v_scope
})

// 应用状态管理
const applicationStore = useApplicationStore()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const fileList = ref<any[]>([])

// 模型管理相关状态
const modelModalVisible = ref(false)
const selectedProvider = ref<LlmProvider | null>(null)



// 表单数据
const formData = reactive<SaveLlmProviderRequest>({
  id: undefined,
  name: '',
  description: '',
  type: '',
  icon_url: '',
  application_id: '',
  api_url: '',
  api_key: ''
})

// 搜索表单
const searchForm = reactive<QueryLlmProviderRequest>({
  name: '',
  type: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => i18n.global.t(v_scope + 'total_records', { total })
})

// 表格列定义
const columns = computed(() => [
  {
    title: i18n.global.t(v_scope + 'icon'),
    key: 'icon',
    width: 80,
    align: 'center'
  },
  {
    title: i18n.global.t(v_scope + 'provider_name'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: i18n.global.t(v_scope + 'type'),
    key: 'type',
    width: 220,
    align: 'center'
  },
  {
    title: i18n.global.t(v_scope + 'description'),
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: i18n.global.t(v_scope + 'api_url'),
    dataIndex: 'api_url',
    key: 'api_url',
    ellipsis: true,
    width: 200
  },
  {
    title: i18n.global.t(v_scope + 'action'),
    key: 'action',
    width: 300,
    align: 'center',
    fixed: 'right'
  }
])

// 计算属性
const modalTitle = computed(() => isEdit.value ? i18n.global.t(v_scope + 'edit_provider') : i18n.global.t(v_scope + 'add_provider'))
const llmProviders = ref<LlmProvider[]>([])





// 表单验证规则
const formRules = {
  name: [{required: true, message: i18n.global.t(v_scope + 'enter_provider_name_required'), trigger: 'blur'}],
  type: [{required: true, message: i18n.global.t(v_scope + 'select_provider_type_required'), trigger: 'change'}],
  description: [{required: true, message: i18n.global.t(v_scope + 'enter_provider_description_required'), trigger: 'blur'}],
  api_url: [{required: true, message: i18n.global.t(v_scope + 'enter_api_url_required'), trigger: 'blur'}],
  api_key: [{required: true, message: i18n.global.t(v_scope + 'enter_api_key_required'), trigger: 'blur'}],
  icon_url: [{required: true, message: i18n.global.t(v_scope + 'upload_provider_icon_required'), trigger: 'change'}]
}

// 表单引用
const formRef = ref()

// 生命周期
onMounted(() => {
  // 初始化表单数据
  if (applicationStore.selectedApplication?.id) {
    formData.application_id = applicationStore.selectedApplication.id
  }
  loadData()
})

// 监听应用选择变化
watch(
    () => applicationStore.selectedApplication?.id,
    (newAppId) => {
      if (newAppId) {
        formData.application_id = newAppId
        // 重新加载数据
        loadData()
      }
    }
)

// 加载数据
const loadData = async () => {
  if (!applicationStore.selectedApplication?.id) {
    message.warning(i18n.global.t(v_scope + 'please_select_application'))
    return
  }

  loading.value = true
  try {
    const response = await llmProviderService.getLlmProvidersByApplicationID(
        applicationStore.selectedApplication.id
    )
    llmProviders.value = response.llm_providers
    pagination.total = response.llm_providers.length
  } catch (error) {
    console.error('加载数据失败:', error)
    message.error(i18n.global.t(v_scope + 'load_data_failed'))
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: ''
  })
  pagination.current = 1
  loadData()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 显示新增对话框
const showCreateModal = () => {
  if (!applicationStore.selectedApplication?.id) {
    message.warning(i18n.global.t(v_scope + 'please_select_application'))
    return
  }

  console.log('showCreateModal - 当前选中的应用ID:', applicationStore.selectedApplication.id)
  
  isEdit.value = false
  resetForm()
  
  // 确保 application_id 被正确设置
  formData.application_id = applicationStore.selectedApplication.id
  console.log('showCreateModal - 设置后的 application_id:', formData.application_id)
  
  modalVisible.value = true
}

// 显示编辑对话框
const handleEdit = (record: LlmProvider) => {
  console.log('handleEdit - 编辑记录:', record)
  console.log('handleEdit - 记录ID:', record.id)
  
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    description: record.description,
    type: record.type,
    icon_url: record.icon_url,
    application_id: record.application_id,
    api_url: record.api_url,
    api_key: record.api_key
  })
  
  console.log('handleEdit - 设置后的 formData.id:', formData.id)
  console.log('handleEdit - 设置后的 formData.application_id:', formData.application_id)
  
  modalVisible.value = true
}



// 删除处理
const handleDelete = async (id: string) => {
  try {
    await llmProviderService.deleteLlmProvider(id)
    message.success(i18n.global.t(v_scope + 'delete_success'))
    loadData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error(i18n.global.t(v_scope + 'delete_failed'))
  }
}

// 模型管理处理
const handleManageModels = (record: LlmProvider) => {
  selectedProvider.value = record
  modelModalVisible.value = true
}

// 模型管理对话框取消
const handleModelModalCancel = () => {
  modelModalVisible.value = false
  selectedProvider.value = null
}

// 对话框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
 
    console.log('handleModalOk - 验证前的 application_id:', formData.application_id)
    console.log('handleModalOk - 验证前的 id:', formData.id)
    console.log('handleModalOk - 当前选中的应用ID:', applicationStore.selectedApplication?.id)
    console.log('handleModalOk - 是否为编辑模式:', isEdit.value)
 
    // 确保 application_id 被正确设置
    if (!formData.application_id && applicationStore.selectedApplication?.id) {
      formData.application_id = applicationStore.selectedApplication.id
      console.log('handleModalOk - 自动设置后的 application_id:', formData.application_id)
    }
 
    if (!formData.application_id) {
      message.error(i18n.global.t(v_scope + 'application_id_required'))
      return
    }
 
    console.log('handleModalOk - 最终提交的 application_id:', formData.application_id)
    console.log('handleModalOk - 最终提交的 id:', formData.id)
    submitting.value = true

    if (isEdit.value) {
      await llmProviderService.saveLlmProvider(formData)
      message.success(i18n.global.t(v_scope + 'update_success'))
    } else {
      await llmProviderService.saveLlmProvider(formData)
      message.success(i18n.global.t(v_scope + 'create_success'))
    }

    modalVisible.value = false
    loadData()
  } catch (error) {
    console.error('保存失败:', error)
    message.error(i18n.global.t(v_scope + 'save_failed'))
  } finally {
    submitting.value = false
  }
}

// 对话框取消
const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  const currentAppId = applicationStore.selectedApplication?.id || ''
  console.log('resetForm - 当前选中的应用ID:', currentAppId)
  
  // 如果是编辑模式，保留ID；如果是新增模式，清空ID
  const shouldKeepId = isEdit.value && formData.id
  
  Object.assign(formData, {
    id: shouldKeepId ? formData.id : undefined,
    name: '',
    description: '',
    type: '',
    icon_url: '',
    application_id: currentAppId, // 保留当前应用ID
    api_url: '',
    api_key: ''
  })
  
  console.log('resetForm - 重置后的 application_id:', formData.application_id)
  console.log('resetForm - 重置后的 id:', formData.id)
  fileList.value = []
  
  // 先重置表单字段
  formRef.value?.resetFields()
  
  // 重新设置 application_id，因为 resetFields 可能会清空它
  if (currentAppId) {
    formData.application_id = currentAppId
    console.log('resetForm - 重新设置后的 application_id:', formData.application_id)
  }
}

// 文件上传前处理
const beforeUpload = async (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error(i18n.global.t(v_scope + 'only_upload_image'))
    return false
  }

  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error(i18n.global.t(v_scope + 'image_size_limit'))
    return false
  }

  try {
    const response = await llmProviderService.uploadIcon(file)
    formData.icon_url = response.data.file_path
    message.success(i18n.global.t(v_scope + 'icon_upload_success'))
  } catch (error) {
    console.error('图标上传失败:', error)
    message.error(i18n.global.t(v_scope + 'icon_upload_failed'))
  }

  return false // 阻止自动上传
}

// 获取图标URL
const getIconUrl = (iconUrl: string) => {
  if (!iconUrl) return ''
  if (iconUrl.startsWith('data:')) return iconUrl
  if (iconUrl.startsWith('http:') || iconUrl.startsWith('https:')) return iconUrl
  // 使用 ResourceUtils 获取正确的资源URL
  return ResourceUtils.getSystemPublicResourceRealUrl(iconUrl)
}

// 获取类型标签颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    openai_chat_completions_api: 'blue',
    openai_responses_api: 'cyan',
    ollama_api: 'green'
  }
  return colorMap[type] || 'default'
}

// 获取类型标签文本
const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    openai_chat_completions_api: 'OpenAI Chat Completions Api',
    openai_responses_api: 'OpenAI Responses Api',
    ollama_api: 'Ollama Api'
  }
  return labelMap[type] || type
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}


</script>

<style scoped lang="scss">
.llm-manage {
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

  .search-section {
    margin-bottom: 24px;
  }

  .table-section {
    .provider-icon {
      display: flex;
      justify-content: center;
      align-items: center;

      .icon-image {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        object-fit: cover;
      }

      .icon-placeholder {
        width: 32px;
        height: 32px;
        background: #f0f0f0;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #8c8c8c;
      }
    }
  }
}

.icon-upload {
  .upload-area {
    width: 100px;
    height: 100px;
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: #1890ff;
    }

    .upload-placeholder {
      text-align: center;
      color: #8c8c8c;

      .anticon {
        font-size: 24px;
        margin-bottom: 8px;
      }
    }

    .upload-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
  }

  .upload-tips {
    margin-top: 8px;
    color: #8c8c8c;
    font-size: 12px;
  }
}


</style>