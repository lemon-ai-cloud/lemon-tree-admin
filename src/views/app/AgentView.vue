<template>
  <div class="agent-management">
    <div class="page-header">
      <div class="header-content">
        <a-typography-title :level="2" class="page-title">
          智能体管理
        </a-typography-title>
        <a-button
          type="primary"
          @click="showDialog = true"
          class="create-btn"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          创建智能体
        </a-button>
      </div>
    </div>

    <div class="content-area">
      <a-card>
        <template #title>
          <a-input
            v-model:value="search"
            placeholder="搜索智能体"
            size="large"
            allow-clear
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </template>
        
        <a-table
          :columns="columns"
          :data-source="filteredAgents"
          :loading="loading"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'actions'">
              <div class="action-buttons">
                <a-button
                  type="text"
                  size="small"
                  @click="editAgent(record)"
                  class="action-btn"
                >
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  danger
                  @click="deleteAgent(record)"
                  class="action-btn"
                >
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 创建/编辑智能体对话框 -->
    <a-modal
      v-model:open="showDialog"
      :title="editingAgent ? '编辑智能体' : '创建智能体'"
      @ok="saveAgent"
      :confirm-loading="saving"
      :ok-text="editingAgent ? '更新' : '创建'"
      :cancel-text="'取消'"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        @finish="saveAgent"
      >
        <a-form-item name="name" label="智能体名称">
          <a-input
            v-model:value="form.name"
            placeholder="请输入智能体名称"
            size="large"
          />
        </a-form-item>
        
        <a-form-item name="description" label="智能体描述">
          <a-textarea
            v-model:value="form.description"
            placeholder="请输入智能体描述"
            :rows="3"
            size="large"
          />
        </a-form-item>
        
        <a-form-item name="avatarUrl" label="头像URL">
          <a-input
            v-model:value="form.avatarUrl"
            placeholder="请输入头像URL"
            size="large"
          />
        </a-form-item>
        
        <a-form-item name="systemPrompt" label="系统提示词">
          <a-textarea
            v-model:value="form.systemPrompt"
            placeholder="请输入系统提示词"
            :rows="4"
            size="large"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 删除确认对话框 -->
    <a-modal
      v-model:open="showDeleteDialog"
      title="确认删除"
      @ok="confirmDelete"
      :confirm-loading="deleting"
      ok-text="删除"
      cancel-text="取消"
      ok-type="danger"
    >
      <div class="delete-content">
        <ExclamationCircleOutlined class="delete-icon" />
        <p>确定要删除智能体 "{{ agentToDelete?.name }}" 吗？此操作不可恢复。</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

// 状态
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const agents = ref<any[]>([])
const editingAgent = ref<any>(null)
const agentToDelete = ref<any>(null)
const search = ref('')

// 表单数据
const form = reactive({
  name: '',
  description: '',
  avatarUrl: '',
  systemPrompt: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入智能体名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入智能体描述', trigger: 'blur' }
  ],
  systemPrompt: [
    { required: true, message: '请输入系统提示词', trigger: 'blur' }
  ]
}

// 表格列定义
const columns = [
  {
    title: '智能体名称',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '智能体描述',
    dataIndex: 'description',
    key: 'description',
    width: 300
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 过滤后的智能体列表
const filteredAgents = computed(() => {
  if (!search.value) return agents.value
  
  const searchLower = search.value.toLowerCase()
  return agents.value.filter(agent => 
    agent.name.toLowerCase().includes(searchLower) ||
    agent.description.toLowerCase().includes(searchLower)
  )
})

// 获取智能体列表
const fetchAgents = async () => {
  try {
    loading.value = true
    // 这里需要调用实际的API
    // const response = await agentService.getAllAgents()
    // agents.value = response.agents
    
    // 模拟数据
    agents.value = [
      {
        id: '1',
        name: '客服助手',
        description: '专业的客服智能体，能够回答用户问题',
        avatarUrl: '',
        systemPrompt: '你是一个专业的客服助手',
        created_at: '2024-01-01 10:00:00'
      }
    ]
  } catch (error) {
    console.error('获取智能体列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 编辑智能体
const editAgent = (agent: any) => {
  editingAgent.value = agent
  form.name = agent.name
  form.description = agent.description
  form.avatarUrl = agent.avatarUrl || ''
  form.systemPrompt = agent.systemPrompt
  showDialog.value = true
}

// 删除智能体
const deleteAgent = (agent: any) => {
  agentToDelete.value = agent
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!agentToDelete.value) return
  
  try {
    deleting.value = true
    // 这里需要调用实际的删除API
    // await agentService.deleteAgent(agentToDelete.value.id)
    await fetchAgents()
    showDeleteDialog.value = false
    agentToDelete.value = null
  } catch (error) {
    console.error('删除智能体失败:', error)
  } finally {
    deleting.value = false
  }
}

// 保存智能体
const saveAgent = async (values: any) => {
  try {
    saving.value = true
    
    if (editingAgent.value) {
      // 更新智能体
      // await agentService.updateAgent(editingAgent.value.id, values)
    } else {
      // 创建智能体
      // await agentService.createAgent(values)
    }
    
    await fetchAgents()
    closeDialog()
  } catch (error) {
    console.error('保存智能体失败:', error)
  } finally {
    saving.value = false
  }
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  editingAgent.value = null
  form.name = ''
  form.description = ''
  form.avatarUrl = ''
  form.systemPrompt = ''
}

// 初始化
onMounted(() => {
  fetchAgents()
})
</script>

<style scoped lang="scss">
.agent-management {
  padding: 24px;
  background: #FFFFFF;
}

.page-header {
  margin-bottom: 24px;
  background: #F5F5F5;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #F0F0F0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin-bottom: 0 !important;
  color: #333333 !important;
}

.create-btn {
  height: 40px;
  padding: 0 24px;
}

.content-area {
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #F0F0F0;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px;
  min-width: 32px;
  height: 32px;
}

.delete-content {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .delete-icon {
    font-size: 24px;
    color: #ff4d4f;
  }
  
  p {
    margin: 0;
    color: #333333;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .agent-management {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style> 