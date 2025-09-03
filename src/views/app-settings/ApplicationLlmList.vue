<template>
  <div class="application-llm-list">
    <div class="list-header">
      <h4>模型列表</h4>
      <p>提供商下的所有可用模型 ({{ models.length }} 个)</p>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else-if="models.length === 0" class="no-data">
      暂无模型数据
    </div>

    <div v-else class="model-grid">
      <div
        v-for="model in models"
        :key="model.id"
        class="model-card"
      >
        <div class="model-header">
          <h5>{{ model.name }}</h5>
          <span class="model-alias">{{ model.alias }}</span>
        </div>

        <div class="model-abilities">
          <a-tag v-if="model.ability_vision" color="blue" size="small">视觉</a-tag>
          <a-tag v-if="model.ability_network" color="green" size="small">联网</a-tag>
          <a-tag v-if="model.ability_text_embeddings" color="orange" size="small">嵌入</a-tag>
          <a-tag v-if="model.ability_thinking" color="purple" size="small">思考</a-tag>
          <a-tag v-if="model.ability_call_tools" color="cyan" size="small">工具</a-tag>
          <a-tag v-if="model.ability_reranking" color="red" size="small">重排</a-tag>
        </div>

        <div class="model-footer">
          <a-button
            type="link"
            size="small"
            @click="handleEditModel(model)"
          >
            编辑
          </a-button>
          <a-switch
            :checked="model.enabled"
            size="small"
            @change="(checked) => handleToggleEnabled(model, checked)"
          />
        </div>
      </div>
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
                v-model:value="editFormData.name"
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
              <a-select v-model:value="editFormData.billing_currency">
                <a-select-option value="USD">USD</a-select-option>
                <a-select-option value="CNY">CNY</a-select-option>
                <a-select-option value="EUR">EUR</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="billing_price_input" label="输入价格 (每百万Token)">
              <a-input-number
                v-model:value="editFormData.billing_price_input"
                :min="0"
                :step="0.0001"
                :precision="4"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="billing_price_output" label="输出价格 (每百万Token)">
              <a-input-number
                v-model:value="editFormData.billing_price_output"
                :min="0"
                :step="0.0001"
                :precision="4"
                style="width: 100%"
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
import { message } from 'ant-design-vue'
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
</script>

<style scoped lang="scss">
.application-llm-list {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  margin: 8px 0;

  .list-header {
    margin-bottom: 16px;
    
    h4 {
      margin: 0 0 4px 0;
      color: #262626;
    }
    
    p {
      margin: 0;
      color: #8c8c8c;
      font-size: 12px;
    }
  }

  .loading, .no-data {
    text-align: center;
    color: #8c8c8c;
    padding: 20px;
  }

  .model-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .model-card {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    padding: 16px;
    transition: all 0.3s;

    &:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .model-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h5 {
        margin: 0;
        color: #262626;
        font-size: 14px;
      }

      .model-alias {
        color: #8c8c8c;
        font-size: 12px;
      }
    }

    .model-abilities {
      margin-bottom: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .model-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
