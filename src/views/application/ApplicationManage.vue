<template>
  <div class="application-management lemon-theme">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <v-icon size="32" color="primary" class="mr-3">mdi-apps</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">应用管理</h1>
            <p class="text-body-2 text-medium-emphasis">管理系统应用和配置</p>
          </div>
        </div>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          @click="showDialog = true"
          class="create-btn"
        >
          创建应用
        </v-btn>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <v-card class="application-card" elevation="2">
        <!-- 搜索栏 -->
        <div class="search-section">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="搜索应用名称或描述"
            variant="outlined"
            density="comfortable"
            hide-details
            class="search-field"
            clearable
          />
        </div>
        
        <!-- 应用列表 -->
        <div class="table-section">
          <v-data-table
            :headers="headers"
            :items="applications"
            :search="search"
            :loading="loading"
            class="application-table"
            hover
            item-value="id"
          >
            <!-- 应用状态列 -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="item.status === 'active' ? 'success' : 'warning'"
                size="small"
                variant="flat"
              >
                {{ item.status === 'active' ? '活跃' : '非活跃' }}
              </v-chip>
            </template>
            
            <!-- 创建时间列 -->
            <template v-slot:item.created_at="{ item }">
              <span class="text-body-2 text-medium-emphasis">
                {{ formatDate(item.created_at) }}
              </span>
            </template>
            
            <!-- 操作列 -->
            <template v-slot:item.actions="{ item }">
              <div class="action-buttons">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="primary"
                  variant="text"
                  @click="editApplication(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="deleteApplication(item)"
                  class="action-btn"
                />
              </div>
            </template>
            
            <!-- 空状态 -->
            <template v-slot:no-data>
              <div class="empty-state">
                <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-apps-outline</v-icon>
                <h3 class="text-h6 mb-2">暂无应用数据</h3>
                <p class="text-body-2 text-medium-emphasis mb-4">点击"创建应用"按钮添加第一个应用</p>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="showDialog = true"
                >
                  创建应用
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card>
    </div>

    <!-- 创建/编辑应用对话框 -->
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card class="application-dialog">
        <v-card-title class="dialog-header">
          <div class="d-flex align-center">
            <v-icon size="24" color="primary" class="mr-3">
              {{ editingApplication ? 'mdi-pencil' : 'mdi-plus' }}
            </v-icon>
            <span class="text-h5 font-weight-bold">
              {{ editingApplication ? '编辑应用' : '创建应用' }}
            </span>
          </div>
        </v-card-title>
        
        <v-card-text class="dialog-content">
          <v-form ref="form" @submit.prevent="saveApplication">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.name"
                  label="应用名称"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-apps"
                  required
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="应用描述"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-text"
                  rows="3"
                  required
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.status"
                  label="应用状态"
                  :items="statusOptions"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-toggle-switch"
                  required
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.version"
                  label="版本号"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-tag"
                  placeholder="1.0.0"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey"
            @click="showDialog = false"
            :disabled="saving"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveApplication"
            class="ml-3"
          >
            {{ editingApplication ? '更新' : '创建' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Application } from '@/types/application'
import applicationService from '@/services/applicationService'

// 状态
const applications = ref<Application[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showDialog = ref(false)
const editingApplication = ref<Application | null>(null)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  description: '',
  status: 'active',
  version: ''
})

// 状态选项
const statusOptions = [
  { title: '活跃', value: 'active' },
  { title: '非活跃', value: 'inactive' }
]

// 表单验证规则
const rules = {
  required: (value: string) => !!value || '此字段为必填项'
}

// 表格头部
const headers = [
  { title: '应用名称', key: 'name', sortable: true, width: '25%' },
  { title: '描述', key: 'description', sortable: true, width: '35%' },
  { title: '状态', key: 'status', sortable: true, width: '10%' },
  { title: '版本', key: 'version', sortable: true, width: '10%' },
  { title: '创建时间', key: 'created_at', sortable: true, width: '10%' },
  { title: '操作', key: 'actions', sortable: false, width: '10%' }
]

// 表单引用
const formRef = ref()

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取应用列表
const fetchApplications = async () => {
  try {
    loading.value = true
    console.log('开始获取应用列表...')
    const response = await applicationService.getAllApplications()
    console.log('获取应用列表成功:', response)
    applications.value = response.applications
  } catch (error) {
    console.error('获取应用列表失败:', error)
    if (error.response) {
      console.error('错误响应:', error.response.data)
      console.error('错误状态:', error.response.status)
    }
  } finally {
    loading.value = false
  }
}

// 编辑应用
const editApplication = (application: Application) => {
  editingApplication.value = application
  form.id = application.id
  form.name = application.name
  form.description = application.description
  form.status = application.status || 'active'
  form.version = application.version || ''
  showDialog.value = true
}

// 删除应用
const deleteApplication = async (application: Application) => {
  if (confirm(`确定要删除应用 "${application.name}" 吗？`)) {
    try {
      // 这里需要添加删除应用的API
      console.log('删除应用:', application.id)
      await fetchApplications()
    } catch (error) {
      console.error('删除应用失败:', error)
    }
  }
}

// 保存应用
const saveApplication = async () => {
  try {
    const { valid } = await formRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    const applicationData = {
      id: form.id || undefined,
      name: form.name,
      description: form.description,
      status: form.status,
      version: form.version || undefined
    }
    
    await applicationService.saveApplication(applicationData)
    
    // 重置表单
    form.id = ''
    form.name = ''
    form.description = ''
    form.status = 'active'
    form.version = ''
    editingApplication.value = null
    showDialog.value = false
    
    // 刷新列表
    await fetchApplications()
  } catch (error) {
    console.error('保存应用失败:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
@use '@/styles/theme.scss' as *;

.application-management {
  height: 100%;
  background-color: $bg-primary;
  overflow-y: auto;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.create-btn {
  box-shadow: $shadow-medium;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: $shadow-heavy;
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.application-card {
  @include card-style;
}

.search-section {
  padding: 1.5rem 2rem;
  background-color: $bg-secondary;
  border-bottom: 1px solid $border-light;
}

.search-field {
  max-width: 400px;
}

.table-section {
  padding: 0;
}

.application-table {
  border-radius: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: $text-secondary;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.application-dialog {
  border-radius: $border-radius-large;
}

.dialog-header {
  @include drawer-header;
}

.dialog-content {
  padding: $spacing-xl;
}

.dialog-actions {
  padding: $spacing-lg $spacing-xl;
  background-color: $bg-secondary;
  border-top: 1px solid $border-light;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .content-area {
    padding: 0 1rem;
  }
  
  .search-section {
    padding: 1rem;
  }
  
  .search-field {
    max-width: 100%;
  }
}
</style> 