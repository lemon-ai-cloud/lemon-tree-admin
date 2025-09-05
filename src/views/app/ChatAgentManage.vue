<template>
  <div class="chat-agent-manage">
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
          {{ $v_translate('add_agent') }}
        </a-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-card>
        <a-table
            :columns="columns"
            :data-source="chatAgents"
            :loading="loading"
            :pagination="pagination"
            row-key="id"
            @change="handleTableChange"
        >
          <!-- 操作列 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">
                  <template #icon>
                    <EditOutlined/>
                  </template>
                  {{ $v_translate('edit') }}
                </a-button>
                <a-popconfirm
                    :title="$v_translate('confirm_delete_agent')"
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
        width="900px"
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
        <a-tabs v-model:activeKey="activeTab" type="card">
          <!-- 基础信息选项卡 -->
          <a-tab-pane key="basic" :tab="$v_translate('basic_info')">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="name" :label="$v_translate('agent_name')">
                  <a-input
                      v-model:value="formData.name"
                      :placeholder="$v_translate('enter_agent_name')"
                      size="large"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item name="avatar_url" :label="$v_translate('agent_avatar')">
                  <div class="avatar-upload">
                    <a-upload
                        v-model:file-list="avatarFileList"
                        :before-upload="beforeAvatarUpload"
                        :show-upload-list="false"
                        accept="image/*"
                    >
                      <div class="upload-area">
                        <div v-if="!formData.avatar_url" class="upload-placeholder">
                          <PlusOutlined/>
                          <div>{{ $v_translate('click_upload_avatar') }}</div>
                        </div>
                        <img
                            v-else
                            :src="getAvatarUrl(formData.avatar_url)"
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
              </a-col>
            </a-row>

            <a-form-item name="description" :label="$v_translate('agent_description')">
              <a-textarea
                  v-model:value="formData.description"
                  :placeholder="$v_translate('enter_agent_description')"
                  :rows="3"
                  size="large"
              />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="model_temperature" :label="$v_translate('model_temperature')">
                  <a-input-number
                      v-model:value="formData.model_temperature"
                      :min="0"
                      :max="2"
                      :step="0.1"
                      size="large"
                      style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item name="model_top_p" :label="$v_translate('model_top_p')">
                  <a-input-number
                      v-model:value="formData.model_top_p"
                      :min="0"
                      :max="1"
                      :step="0.1"
                      size="large"
                      style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="enable_context_length_limit" :label="$v_translate('enable_context_length_limit')">
                  <a-switch v-model:checked="formData.enable_context_length_limit"/>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item name="context_length_limit" :label="$v_translate('context_length_limit')" v-if="formData.enable_context_length_limit">
                  <a-input-number
                      v-model:value="formData.context_length_limit"
                      :min="1"
                      size="large"
                      style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="enable_max_output_token_count_limit" :label="$v_translate('enable_max_output_token_count_limit')">
                  <a-switch v-model:checked="formData.enable_max_output_token_count_limit"/>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item name="max_output_token_count_limit" :label="$v_translate('max_output_token_count_limit')" v-if="formData.enable_max_output_token_count_limit">
                  <a-input-number
                      v-model:value="formData.max_output_token_count_limit"
                      :min="1"
                      size="large"
                      style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item name="default_streamable" :label="$v_translate('default_streamable')">
              <a-switch v-model:checked="formData.default_streamable"/>
            </a-form-item>
          </a-tab-pane>

          <!-- 聊天选项卡 -->
          <a-tab-pane key="chat" :tab="$v_translate('chat')">
            <a-form-item name="chat_model_id" :label="$v_translate('chat_model')">
              <a-cascader
                  v-model:value="chatModelCascaderValue"
                  :options="modelOptions"
                  :field-names="{ label: 'name', value: 'id', children: 'models' }"
                  :placeholder="$v_translate('select_chat_model')"
                  size="large"
                  show-search
                  :filter-option="filterModelOption"
                  style="width: 100%"
                  @change="handleChatModelChange"
              >
                <template #displayRender="{ labels, selectedOptions }">
                  <span v-if="selectedOptions && selectedOptions.length > 1">
                    {{ selectedOptions[0].name }} / {{ selectedOptions[1].name }}
                  </span>
                  <span v-else-if="selectedOptions && selectedOptions.length === 1">
                    {{ selectedOptions[0].name }}
                  </span>
                </template>
              </a-cascader>
            </a-form-item>

            <a-form-item name="system_prompt" :label="$v_translate('system_prompt')">
              <a-textarea
                  v-model:value="formData.system_prompt"
                  :placeholder="$v_translate('enter_system_prompt')"
                  :rows="6"
                  size="large"
              />
            </a-form-item>
          </a-tab-pane>

          <!-- 会话命名选项卡 -->
          <a-tab-pane key="naming" :tab="$v_translate('conversation_naming')">
            <a-form-item name="conversation_naming_model_id" :label="$v_translate('conversation_naming_model')">
              <a-cascader
                  v-model:value="conversationNamingModelCascaderValue"
                  :options="modelOptions"
                  :field-names="{ label: 'name', value: 'id', children: 'models' }"
                  :placeholder="$v_translate('select_conversation_naming_model')"
                  size="large"
                  show-search
                  :filter-option="filterModelOption"
                  style="width: 100%"
                  @change="handleConversationNamingModelChange"
              >
                <template #displayRender="{ labels, selectedOptions }">
                  <span v-if="selectedOptions && selectedOptions.length > 1">
                    {{ selectedOptions[0].name }} / {{ selectedOptions[1].name }}
                  </span>
                  <span v-else-if="selectedOptions && selectedOptions.length === 1">
                    {{ selectedOptions[0].name }}
                  </span>
                </template>
              </a-cascader>
            </a-form-item>

            <a-form-item name="conversation_naming_prompt" :label="$v_translate('conversation_naming_prompt')">
              <a-textarea
                  v-model:value="formData.conversation_naming_prompt"
                  :placeholder="$v_translate('enter_conversation_naming_prompt')"
                  :rows="4"
                  size="large"
              />
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed, watch} from 'vue'
import {message} from 'ant-design-vue'
import i18n from '@/i18n.ts'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type {ChatAgentDto, SaveChatAgentRequest} from '@/dto/chatAgent'
import type {LlmProvider} from '@/dto/llmProvider'
import type {ApplicationLlmDto} from '@/dto/applicationLlm'
import chatAgentService from '@/services/chatAgentService'
import llmProviderService from '@/services/llmProviderService'
import applicationLlmService from '@/services/applicationLlmService'
import {useApplicationStore} from '@/stores/applicationStore'
import ResourceUtils from '@/utils/resource-utils'

const v_scope = 'views.app.chat_agent_manage.'
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
const activeTab = ref('basic')
const avatarFileList = ref<any[]>([])
const modelOptions = ref<any[]>([])
const chatModelCascaderValue = ref<string[]>([])
const conversationNamingModelCascaderValue = ref<string[]>([])

// 表单数据
const formData = reactive<SaveChatAgentRequest>({
  id: undefined,
  name: '',
  description: '',
  application_id: '',
  avatar_url: '',
  system_prompt: '',
  chat_model_id: '',
  conversation_naming_prompt: '',
  conversation_naming_model_id: '',
  model_temperature: 0.7,
  model_top_p: 1.0,
  enable_context_length_limit: false,
  context_length_limit: 100,
  enable_max_output_token_count_limit: false,
  max_output_token_count_limit: 1000,
  default_streamable: true
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
    title: i18n.global.t(v_scope + 'agent_name'),
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: i18n.global.t(v_scope + 'agent_description'),
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: i18n.global.t(v_scope + 'created_time'),
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180
  },
  {
    title: i18n.global.t(v_scope + 'actions'),
    key: 'action',
    width: 200,
    align: 'center',
    fixed: 'right'
  }
])

// 计算属性
const modalTitle = computed(() => isEdit.value ? i18n.global.t(v_scope + 'edit_agent') : i18n.global.t(v_scope + 'add_agent'))
const chatAgents = ref<ChatAgentDto[]>([])

// 表单验证规则
const formRules = {
  name: [{required: true, message: i18n.global.t(v_scope + 'enter_agent_name_required'), trigger: 'blur'}],
  description: [{required: true, message: i18n.global.t(v_scope + 'enter_agent_description_required'), trigger: 'blur'}],
  system_prompt: [{required: true, message: i18n.global.t(v_scope + 'enter_system_prompt_required'), trigger: 'blur'}],
  chat_model_id: [{required: true, message: i18n.global.t(v_scope + 'enter_chat_model_id_required'), trigger: 'blur'}],
  conversation_naming_model_id: [{required: true, message: i18n.global.t(v_scope + 'enter_conversation_naming_model_id_required'), trigger: 'blur'}]
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
  loadModelOptions()
})

// 监听应用选择变化
watch(
    () => applicationStore.selectedApplication?.id,
    (newAppId) => {
      if (newAppId) {
        formData.application_id = newAppId
        // 重新加载数据
        loadData()
        loadModelOptions()
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
    const response = await chatAgentService.getChatAgentsByApplicationID(
        applicationStore.selectedApplication.id,
        pagination.current,
        pagination.pageSize
    )
    chatAgents.value = response.chat_agents
    pagination.total = response.total
  } catch (error) {
    console.error('加载数据失败:', error)
    message.error(i18n.global.t(v_scope + 'load_data_failed'))
  } finally {
    loading.value = false
  }
}

// 加载模型选项
const loadModelOptions = async () => {
  if (!applicationStore.selectedApplication?.id) {
    return
  }

  try {
    // 获取LLM提供商列表
    const providersResponse = await llmProviderService.getLlmProvidersByApplicationID(
        applicationStore.selectedApplication.id
    )
    
    const options: any[] = []
    
    // 为每个提供商获取其模型列表
    for (const provider of providersResponse.llm_providers) {
      try {
        const modelsResponse = await applicationLlmService.getModelsByProviderID(provider.id)
        const models = modelsResponse.application_llm.map((model: ApplicationLlmDto) => ({
          id: model.id,
          name: `${model.name} (${model.alias})`,
          alias: model.alias
        }))
        
        if (models.length > 0) {
          options.push({
            id: provider.id,
            name: provider.name,
            models: models
          })
        }
      } catch (error) {
        console.warn(`获取提供商 ${provider.name} 的模型列表失败:`, error)
      }
    }
    
    modelOptions.value = options
  } catch (error) {
    console.error('加载模型选项失败:', error)
  }
}

// 模型搜索过滤
const filterModelOption = (inputValue: string, option: any) => {
  const searchText = inputValue.toLowerCase()
  
  // 搜索提供商名称
  if (option.name && option.name.toLowerCase().includes(searchText)) {
    return true
  }
  
  // 搜索模型名称和别名
  if (option.models) {
    return option.models.some((model: any) => 
      model.name.toLowerCase().includes(searchText) ||
      model.alias.toLowerCase().includes(searchText)
    )
  }
  
  return false
}

// 头像上传前处理
const beforeAvatarUpload = async (file: File) => {
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
    const response = await chatAgentService.uploadAvatar(file)
    formData.avatar_url = response.data.file_path
    message.success(i18n.global.t(v_scope + 'avatar_upload_success'))
  } catch (error) {
    console.error('头像上传失败:', error)
    message.error(i18n.global.t(v_scope + 'avatar_upload_failed'))
  }

  return false // 阻止自动上传
}

// 获取头像URL
const getAvatarUrl = (avatarUrl: string) => {
  if (!avatarUrl) return ''
  if (avatarUrl.startsWith('data:')) return avatarUrl
  if (avatarUrl.startsWith('http:') || avatarUrl.startsWith('https:')) return avatarUrl
  // 使用 ResourceUtils 获取正确的资源URL
  return ResourceUtils.getSystemPublicResourceRealUrl(avatarUrl)
}

// 处理聊天模型选择变化
const handleChatModelChange = (value: string[]) => {
  if (value && value.length > 0) {
    // 只取最后一个值（模型ID）
    formData.chat_model_id = value[value.length - 1]
  } else {
    formData.chat_model_id = ''
  }
}

// 处理会话命名模型选择变化
const handleConversationNamingModelChange = (value: string[]) => {
  if (value && value.length > 0) {
    // 只取最后一个值（模型ID）
    formData.conversation_naming_model_id = value[value.length - 1]
  } else {
    formData.conversation_naming_model_id = ''
  }
}

// 根据模型ID反查Cascader值
const findCascaderValueByModelId = (modelId: string) => {
  if (!modelId || !modelOptions.value.length) return []
  
  for (const provider of modelOptions.value) {
    if (provider.models) {
      for (const model of provider.models) {
        if (model.id === modelId) {
          return [provider.id, model.id]
        }
      }
    }
  }
  return []
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

  isEdit.value = false
  resetForm()
  formData.application_id = applicationStore.selectedApplication.id
  modalVisible.value = true
}

// 显示编辑对话框
const handleEdit = (record: ChatAgentDto) => {
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    description: record.description,
    application_id: record.application_id,
    avatar_url: record.avatar_url,
    system_prompt: record.system_prompt,
    chat_model_id: record.chat_model_id,
    conversation_naming_prompt: record.conversation_naming_prompt,
    conversation_naming_model_id: record.conversation_naming_model_id,
    model_temperature: record.model_temperature,
    model_top_p: record.model_top_p,
    enable_context_length_limit: record.enable_context_length_limit,
    context_length_limit: record.context_length_limit,
    enable_max_output_token_count_limit: record.enable_max_output_token_count_limit,
    max_output_token_count_limit: record.max_output_token_count_limit,
    default_streamable: record.default_streamable
  })
  
  // 设置Cascader的值
  chatModelCascaderValue.value = findCascaderValueByModelId(record.chat_model_id)
  conversationNamingModelCascaderValue.value = findCascaderValueByModelId(record.conversation_naming_model_id)
  
  modalVisible.value = true
}

// 删除处理
const handleDelete = async (id: string) => {
  try {
    await chatAgentService.deleteChatAgent(id)
    message.success(i18n.global.t(v_scope + 'delete_success'))
    loadData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error(i18n.global.t(v_scope + 'delete_failed'))
  }
}

// 对话框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    if (!formData.application_id) {
      message.error(i18n.global.t(v_scope + 'application_id_required'))
      return
    }

    submitting.value = true

    if (isEdit.value) {
      await chatAgentService.saveChatAgent(formData)
      message.success(i18n.global.t(v_scope + 'update_success'))
    } else {
      await chatAgentService.saveChatAgent(formData)
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
  const shouldKeepId = isEdit.value && formData.id

  Object.assign(formData, {
    id: shouldKeepId ? formData.id : undefined,
    name: '',
    description: '',
    application_id: currentAppId,
    avatar_url: '',
    system_prompt: '',
    chat_model_id: '',
    conversation_naming_prompt: '',
    conversation_naming_model_id: '',
    model_temperature: 0.7,
    model_top_p: 1.0,
    enable_context_length_limit: false,
    context_length_limit: 100,
    enable_max_output_token_count_limit: false,
    max_output_token_count_limit: 1000,
    default_streamable: true
  })

  // 重置选项卡和文件列表
  activeTab.value = 'basic'
  avatarFileList.value = []
  chatModelCascaderValue.value = []
  conversationNamingModelCascaderValue.value = []

  formRef.value?.resetFields()

  if (currentAppId) {
    formData.application_id = currentAppId
  }
}
</script>

<style scoped lang="scss">
.chat-agent-manage {
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

  .table-section {
    // 表格样式
  }
}

.avatar-upload {
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