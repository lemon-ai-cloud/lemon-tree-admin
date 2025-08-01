<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">智能体管理</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showDialog = true"
          >
            创建智能体
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="搜索智能体"
              single-line
              hide-details
              variant="outlined"
              density="compact"
            />
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="agents"
            :search="search"
            :loading="loading"
            class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="primary"
                variant="text"
                @click="editAgent(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="deleteAgent(item)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- 创建/编辑智能体对话框 -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingAgent ? '编辑智能体' : '创建智能体' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="form.name"
              label="智能体名称"
              :rules="[rules.required]"
              variant="outlined"
              required
            />
            
            <v-textarea
              v-model="form.description"
              label="智能体描述"
              :rules="[rules.required]"
              variant="outlined"
              required
            />
            
            <v-text-field
              v-model="form.avatarUrl"
              label="头像URL"
              variant="outlined"
            />
            
            <v-textarea
              v-model="form.systemPrompt"
              label="系统提示词"
              :rules="[rules.required]"
              variant="outlined"
              required
              rows="4"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="showDialog = false">取消</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveAgent"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// 状态
const agents = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showDialog = ref(false)
const editingAgent = ref(null)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  description: '',
  avatarUrl: '',
  systemPrompt: ''
})

// 表单验证规则
const rules = {
  required: (value: string) => !!value || '此字段为必填项'
}

// 表格头部
const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: '名称', key: 'name', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '创建时间', key: 'created_at', sortable: true },
  { title: '操作', key: 'actions', sortable: false }
]

// 表单引用
const formRef = ref()

// 获取智能体列表
const fetchAgents = async () => {
  try {
    loading.value = true
    // 这里调用API获取智能体列表
    agents.value = []
  } catch (error) {
    console.error('获取智能体列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 编辑智能体
const editAgent = (agent: any) => {
  editingAgent.value = agent
  form.id = agent.id
  form.name = agent.name
  form.description = agent.description
  form.avatarUrl = agent.avatarUrl || ''
  form.systemPrompt = agent.systemPrompt || ''
  showDialog.value = true
}

// 删除智能体
const deleteAgent = async (agent: any) => {
  if (confirm(`确定要删除智能体 "${agent.name}" 吗？`)) {
    try {
      // 这里调用API删除智能体
      await fetchAgents()
    } catch (error) {
      console.error('删除智能体失败:', error)
    }
  }
}

// 保存智能体
const saveAgent = async () => {
  try {
    const { valid } = await formRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    // 这里调用API保存智能体
    console.log('保存智能体:', form)
    
    // 重置表单
    form.id = ''
    form.name = ''
    form.description = ''
    form.avatarUrl = ''
    form.systemPrompt = ''
    editingAgent.value = null
    showDialog.value = false
    
    // 刷新列表
    await fetchAgents()
  } catch (error) {
    console.error('保存智能体失败:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchAgents()
})
</script> 