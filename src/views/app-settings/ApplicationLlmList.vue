<template>
  <div class="application-llm-list">
    <div class="list-header">
      <div class="header-content">
        <p>{{ $v_translate('available_models_count', { count: models.length }) }}</p>
        <a-button 
          type="primary" 
          size="small" 
          @click="handleRefreshModels"
          :loading="refreshing"
        >
          <template #icon>
            <ReloadOutlined />
          </template>
          {{ $v_translate('refresh_model_list') }}
        </a-button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      {{ $v_translate('loading') }}
    </div>

    <div v-else-if="models.length === 0" class="no-data">
      {{ $v_translate('no_model_data') }}
    </div>

    <div v-else class="model-table-container">
      <a-table
        :columns="columns"
        :data-source="models"
        :pagination="false"
        :row-selection="false"
        size="small"
        row-key="id"
      >
        <!-- 模型名称列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="model-name-cell">
              <div class="model-name">{{ record.name }}</div>
              <div class="model-alias">{{ record.alias }}</div>
            </div>
          </template>

          <!-- 模型能力列 -->
          <template v-else-if="column.key === 'abilities'">
            <div class="model-abilities">
              <a-tag v-if="record.ability_vision" color="blue" size="small">{{ $v_translate('vision') }}</a-tag>
              <a-tag v-if="record.ability_network" color="green" size="small">{{ $v_translate('network') }}</a-tag>
              <a-tag v-if="record.ability_text_embeddings" color="orange" size="small">{{ $v_translate('text_embeddings') }}</a-tag>
              <a-tag v-if="record.ability_thinking" color="purple" size="small">{{ $v_translate('thinking') }}</a-tag>
              <a-tag v-if="record.ability_call_tools" color="cyan" size="small">{{ $v_translate('call_tools') }}</a-tag>
              <a-tag v-if="record.ability_reranking" color="red" size="small">{{ $v_translate('reranking') }}</a-tag>
            </div>
          </template>

          <!-- 计费信息列 -->
          <template v-else-if="column.key === 'billing'">
            <div class="billing-info">
              <div class="billing-currency">{{ record.billing_currency }}</div>
              <div class="billing-prices">
                <span class="price-item">{{ $v_translate('input') }}: {{ record.billing_price_input }}</span>
                <span class="price-item">{{ $v_translate('output') }}: {{ record.billing_price_output }}</span>
              </div>
            </div>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <div class="model-actions">
              <a-button type="link" size="small" @click="handleEditModel(record)">
                {{ $v_translate('edit') }}
              </a-button>
              <a-switch
                :checked="record.enabled"
                size="small"
                @change="(checked: boolean) => handleToggleEnabled(record, checked)"
              />
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 编辑模型对话框 -->
    <a-modal
      v-model:open="editModalVisible"
      :title="$v_translate('edit_model')"
      width="600px"
      @ok="handleEditModalOk"
      @cancel="handleEditModalCancel"
      :confirm-loading="submitting"
    >
      <a-form
        ref="formRef"
        :model="editFormData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="name" :label="$v_translate('model_name')">
              <a-input
                v-model:value="editFormData.name" disabled
                :placeholder="$v_translate('enter_model_name')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="alias" :label="$v_translate('model_alias')">
              <a-input
                v-model:value="editFormData.alias"
                :placeholder="$v_translate('enter_model_alias')"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item :label="$v_translate('model_abilities')">
          <a-space wrap>
            <a-checkbox v-model:checked="editFormData.ability_vision">{{ $v_translate('vision') }}</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_network">{{ $v_translate('network') }}</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_text_embeddings">{{ $v_translate('text_embeddings') }}</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_thinking">{{ $v_translate('thinking') }}</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_call_tools">{{ $v_translate('call_tools') }}</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_reranking">{{ $v_translate('reranking') }}</a-checkbox>
          </a-space>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item name="billing_currency" :label="$v_translate('billing_currency')">
              <a-auto-complete
                v-model:value="editFormData.billing_currency"
                :placeholder="$v_translate('enter_or_select_currency')"
                :options="currencyOptions"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="billing_price_input" :label="$v_translate('input_price_per_million_tokens')">
              <a-input-number size="large"
                v-model:value="editFormData.billing_price_input"
                :min="0"
                :step="0.0001"
                :precision="4"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="billing_price_output" :label="$v_translate('output_price_per_million_tokens')">
              <a-input-number
                v-model:value="editFormData.billing_price_output"
                :min="0" size="large"
                :step="0.0001"
                :precision="4"
                style="width: 100%; height: 32px"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="enabled" :label="$v_translate('enabled_status')">
          <a-switch v-model:checked="editFormData.enabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import i18n from '@/i18n.ts'
import { ReloadOutlined } from '@ant-design/icons-vue'
import type { ApplicationLlmDto, SaveApplicationLlmRequest } from '@/dto/applicationLlm'
import applicationLlmService from '@/services/applicationLlmService'

const v_scope = 'views.app_settings.application_llm_list.'
defineExpose({
  v_scope
})

// Props
interface Props {
  providerId: string
  applicationId: string
}

const props = defineProps<Props>()

// 响应式数据
const models = ref<ApplicationLlmDto[]>([])
const loading = ref(false)
const refreshing = ref(false)
const editModalVisible = ref(false)
const submitting = ref(false)
const selectedModel = ref<ApplicationLlmDto | null>(null)

// 编辑表单数据
const editFormData = reactive<SaveApplicationLlmRequest>({
  name: '',
  alias: '',
  application_id: '',
  llm_provider_id: '',
  enabled: true,
  ability_vision: false,
  ability_network: false,
  ability_text_embeddings: false,
  ability_thinking: false,
  ability_call_tools: false,
  ability_reranking: false,
  billing_currency: 'USD',
  billing_price_input: 0,
  billing_price_output: 0
})

// 常用币种选项
const currencyOptions = computed(() => [
  { value: 'USD', label: i18n.global.t(v_scope + 'usd') },
  { value: 'CNY', label: i18n.global.t(v_scope + 'cny') },
  { value: 'EUR', label: i18n.global.t(v_scope + 'eur') },
  { value: 'JPY', label: i18n.global.t(v_scope + 'jpy') },
  { value: 'GBP', label: i18n.global.t(v_scope + 'gbp') },
  { value: 'KRW', label: i18n.global.t(v_scope + 'krw') },
  { value: 'HKD', label: i18n.global.t(v_scope + 'hkd') },
  { value: 'SGD', label: i18n.global.t(v_scope + 'sgd') },
  { value: 'CAD', label: i18n.global.t(v_scope + 'cad') },
  { value: 'AUD', label: i18n.global.t(v_scope + 'aud') }
])

// 表格列定义
const columns = computed(() => [
  {
    title: i18n.global.t(v_scope + 'model_name'),
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: i18n.global.t(v_scope + 'model_abilities'),
    key: 'abilities',
    width: 300
  },
  {
    title: i18n.global.t(v_scope + 'billing_info'),
    key: 'billing',
    width: 150
  },
  {
    title: i18n.global.t(v_scope + 'actions'),
    key: 'action',
    width: 120,
    align: 'center'
  }
])

// 表单验证规则
const formRules = {
  name: [{ required: true, message: i18n.global.t(v_scope + 'enter_model_name_required'), trigger: 'blur' }],
  alias: [{ required: true, message: i18n.global.t(v_scope + 'enter_model_alias_required'), trigger: 'blur' }],
  billing_currency: [{ required: true, message: i18n.global.t(v_scope + 'select_billing_currency_required'), trigger: 'change' }],
  billing_price_input: [{ required: true, message: i18n.global.t(v_scope + 'enter_input_price_required'), trigger: 'blur' }],
  billing_price_output: [{ required: true, message: i18n.global.t(v_scope + 'enter_output_price_required'), trigger: 'blur' }]
}

// 表单引用
const formRef = ref()

// 加载模型列表
const loadModels = async () => {
  if (!props.providerId) return
  
  loading.value = true
  try {
    const response = await applicationLlmService.getModelsByProviderID(props.providerId)
    models.value = response.application_llm
  } catch (error) {
    console.error('加载模型列表失败:', error)
    message.error(i18n.global.t(v_scope + 'load_model_list_failed'))
  } finally {
    loading.value = false
  }
}

// 监听 props 变化，重新加载数据
watch(
  () => [props.providerId, props.applicationId],
  () => {
    if (props.providerId && props.applicationId) {
      loadModels()
    }
  },
  { immediate: true }
)

// 编辑模型
const handleEditModel = (model: ApplicationLlmDto) => {
  selectedModel.value = model
  editFormData.id = model.id
  editFormData.name = model.name
  editFormData.alias = model.alias
  editFormData.application_id = model.application_id
  editFormData.llm_provider_id = model.llm_provider_id
  editFormData.enabled = model.enabled
  editFormData.ability_vision = model.ability_vision
  editFormData.ability_network = model.ability_network
  editFormData.ability_text_embeddings = model.ability_text_embeddings
  editFormData.ability_thinking = model.ability_thinking
  editFormData.ability_call_tools = model.ability_call_tools
  editFormData.ability_reranking = model.ability_reranking
  editFormData.billing_currency = model.billing_currency
  editFormData.billing_price_input = model.billing_price_input
  editFormData.billing_price_output = model.billing_price_output
  
  editModalVisible.value = true
}

// 切换启用状态
const handleToggleEnabled = async (model: ApplicationLlmDto, checked: boolean) => {
  try {
    await applicationLlmService.updateEnabledStatus(model.id, checked)
    message.success(i18n.global.t(v_scope + 'status_update_success'))
    loadModels() // 重新加载数据
  } catch (error) {
    console.error('状态更新失败:', error)
    message.error(i18n.global.t(v_scope + 'status_update_failed'))
  }
}

// 编辑对话框确认
const handleEditModalOk = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    await applicationLlmService.saveApplicationLlm(editFormData)
    
    message.success(i18n.global.t(v_scope + 'save_success'))
    editModalVisible.value = false
    loadModels() // 重新加载数据
  } catch (error) {
    console.error('保存失败:', error)
    message.error(i18n.global.t(v_scope + 'save_failed'))
  } finally {
    submitting.value = false
  }
}

// 编辑对话框取消
const handleEditModalCancel = () => {
  editModalVisible.value = false
  selectedModel.value = null
}

// 刷新模型列表
const handleRefreshModels = () => {
  Modal.confirm({
    title: i18n.global.t(v_scope + 'confirm_refresh_model_list'),
    content: i18n.global.t(v_scope + 'refresh_model_list_content'),
    okText: i18n.global.t(v_scope + 'confirm'),
    cancelText: i18n.global.t(v_scope + 'cancel'),
    onOk: async () => {
      try {
        refreshing.value = true
        
        // 调用接口刷新模型列表
        await applicationLlmService.fetchAndSaveModels(props.providerId)
        
        message.success(i18n.global.t(v_scope + 'model_list_refresh_success'))
        
        // 重新加载模型列表
        await loadModels()
      } catch (error) {
        console.error('刷新模型列表失败:', error)
        message.error(i18n.global.t(v_scope + 'model_list_refresh_failed'))
      } finally {
        refreshing.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.application-llm-list {
  border-radius: 6px;
  margin: 4px 0;

  .list-header {
    padding: 10px;
    margin-bottom: 16px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      p {
        margin: 0;
        color: #8c8c8c;
        font-size: 12px;
      }
    }
  }

  .loading, .no-data {
    text-align: center;
    color: #8c8c8c;
    padding: 20px;
  }

  .model-table-container {
    background: white;
    border-radius: 6px;
    overflow: hidden;
    
    :deep(.ant-table) {
      .ant-table-thead > tr > th {
        background: #fafafa;
        border-bottom: 1px solid #f0f0f0;
        font-weight: 500;
      }
      
      .ant-table-tbody > tr > td {
        border-bottom: 1px solid #f0f0f0;
        padding: 12px 16px;
      }
      
      .ant-table-tbody > tr:hover > td {
        background: #f5f5f5;
      }
    }
  }

  .model-name-cell {
    .model-name {
      font-weight: 500;
      color: #262626;
      margin-bottom: 4px;
    }
    
    .model-alias {
      color: #8c8c8c;
      font-size: 12px;
    }
  }

  .model-abilities {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .billing-info {
    .billing-currency {
      font-weight: 500;
      color: #262626;
      margin-bottom: 4px;
    }
    
    .billing-prices {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .price-item {
        color: #8c8c8c;
        font-size: 12px;
      }
    }
  }

  .model-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
