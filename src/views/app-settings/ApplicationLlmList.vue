<template>
  <div class="application-llm-list">
    <div class="list-header">
      <div class="header-content">
        <p>提供商下的所有可用模型 ({{ models.length }} 个)</p>
        <a-button 
          type="primary" 
          size="small" 
          @click="handleRefreshModels"
          :loading="refreshing"
        >
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新模型列表
        </a-button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else-if="models.length === 0" class="no-data">
      暂无模型数据
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
              <a-tag v-if="record.ability_vision" color="blue" size="small">视觉</a-tag>
              <a-tag v-if="record.ability_network" color="green" size="small">联网</a-tag>
              <a-tag v-if="record.ability_text_embeddings" color="orange" size="small">嵌入</a-tag>
              <a-tag v-if="record.ability_thinking" color="purple" size="small">思考</a-tag>
              <a-tag v-if="record.ability_call_tools" color="cyan" size="small">工具</a-tag>
              <a-tag v-if="record.ability_reranking" color="red" size="small">重排</a-tag>
            </div>
          </template>

          <!-- 计费信息列 -->
          <template v-else-if="column.key === 'billing'">
            <div class="billing-info">
              <div class="billing-currency">{{ record.billing_currency }}</div>
              <div class="billing-prices">
                <span class="price-item">输入: {{ record.billing_price_input }}</span>
                <span class="price-item">输出: {{ record.billing_price_output }}</span>
              </div>
            </div>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <div class="model-actions">
              <a-button type="link" size="small" @click="handleEditModel(record)">
                编辑
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
      title="编辑模型"
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
            <a-form-item name="name" label="模型名称">
              <a-input
                v-model:value="editFormData.name" disabled
                placeholder="请输入模型名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="alias" label="模型别名">
              <a-input
                v-model:value="editFormData.alias"
                placeholder="请输入模型别名"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="模型能力">
          <a-space wrap>
            <a-checkbox v-model:checked="editFormData.ability_vision">视觉</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_network">联网</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_text_embeddings">文本嵌入</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_thinking">思考</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_call_tools">调用工具</a-checkbox>
            <a-checkbox v-model:checked="editFormData.ability_reranking">重排</a-checkbox>
          </a-space>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item name="billing_currency" label="计费币种">
              <a-auto-complete
                v-model:value="editFormData.billing_currency"
                placeholder="请输入或选择币种代码"
                :options="currencyOptions"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="billing_price_input" label="输入价格 (每百万Token)">
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
            <a-form-item name="billing_price_output" label="输出价格 (每百万Token)">
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

        <a-form-item name="enabled" label="启用状态">
          <a-switch v-model:checked="editFormData.enabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import type { ApplicationLlmDto, SaveApplicationLlmRequest } from '@/dto/applicationLlm'
import applicationLlmService from '@/services/applicationLlmService'

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
const currencyOptions = [
  { value: 'USD', label: '美元 (USD)' },
  { value: 'CNY', label: '人民币 (CNY)' },
  { value: 'EUR', label: '欧元 (EUR)' },
  { value: 'JPY', label: '日元 (JPY)' },
  { value: 'GBP', label: '英镑 (GBP)' },
  { value: 'KRW', label: '韩元 (KRW)' },
  { value: 'HKD', label: '港币 (HKD)' },
  { value: 'SGD', label: '新加坡元 (SGD)' },
  { value: 'CAD', label: '加拿大元 (CAD)' },
  { value: 'AUD', label: '澳元 (AUD)' }
]

// 表格列定义
const columns = [
  {
    title: '模型名称',
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '模型能力',
    key: 'abilities',
    width: 300
  },
  {
    title: '计费信息',
    key: 'billing',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center'
  }
]

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  alias: [{ required: true, message: '请输入模型别名', trigger: 'blur' }],
  billing_currency: [{ required: true, message: '请选择计费币种', trigger: 'change' }],
  billing_price_input: [{ required: true, message: '请输入输入价格', trigger: 'blur' }],
  billing_price_output: [{ required: true, message: '请输入输出价格', trigger: 'blur' }]
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
    message.error('加载模型列表失败')
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
    message.success('状态更新成功')
    loadModels() // 重新加载数据
  } catch (error) {
    console.error('状态更新失败:', error)
    message.error('状态更新失败')
  }
}

// 编辑对话框确认
const handleEditModalOk = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    await applicationLlmService.saveApplicationLlm(editFormData)
    
    message.success('保存成功')
    editModalVisible.value = false
    loadModels() // 重新加载数据
  } catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败')
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
    title: '确认刷新模型列表',
    content: '此操作将从提供商获取最新的模型列表并更新到数据库。已存在的模型将被保留，新增的模型将被添加。确定要继续吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        refreshing.value = true
        
        // 调用接口刷新模型列表
        await applicationLlmService.fetchAndSaveModels(props.providerId)
        
        message.success('模型列表刷新成功')
        
        // 重新加载模型列表
        await loadModels()
      } catch (error) {
        console.error('刷新模型列表失败:', error)
        message.error('刷新模型列表失败')
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
