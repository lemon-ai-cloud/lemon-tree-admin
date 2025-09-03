<template>
  <div class="application-management lemon-theme">
    <!-- 页面头部 -->
    <PageHeader
      title="应用管理"
      subtitle="管理系统应用和配置"
      :icon="AppstoreOutlined"
    >
      <template #actions>
        <a-button
          type="primary"
          size="large"
          @click="showDialog = true"
          class="create-btn"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          创建应用
        </a-button>
      </template>
    </PageHeader>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <a-card class="application-card">
        <!-- 搜索栏 -->
        <div class="search-section">
          <a-input
            v-model:value="search"
            placeholder="搜索应用名称或描述"
            size="large"
            class="search-field"
            allow-clear
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>
        
        <!-- 应用列表 -->
        <div class="table-section">
          <a-table
            :columns="columns"
            :data-source="filteredApplications"
            :loading="applicationStore.isLoading"
            :pagination="false"
            class="application-table"
            row-key="id"
          >
            <!-- 创建时间列 -->
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'created_at'">
                <span class="text-secondary">
                  {{ formatDate(record.created_at) }}
                </span>
              </template>
              
              <!-- 操作列 -->
              <template v-if="column.key === 'actions'">
                <div class="action-buttons">
                  <a-button
                    type="text"
                    size="small"
                    @click="editApplication(record)"
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
                    @click="deleteApplication(record)"
                    class="action-btn"
                  >
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </div>
              </template>
            </template>
            
            <!-- 空状态 -->
            <template #emptyText>
              <div class="empty-state">
                <AppstoreOutlined class="empty-icon" />
                <a-typography-title :level="4" class="empty-title">
                  暂无应用数据
                </a-typography-title>
                <a-typography-text class="empty-subtitle">
                  点击"创建应用"按钮添加第一个应用
                </a-typography-text>
                <a-button
                  type="primary"
                  @click="showDialog = true"
                  class="empty-action"
                >
                  <template #icon>
                    <PlusOutlined />
                  </template>
                  创建应用
                </a-button>
              </div>
            </template>
          </a-table>
        </div>
      </a-card>
    </div>

    <!-- 创建/编辑应用对话框 -->
    <a-modal
      v-model:open="showDialog"
      :title="editingApplication ? '编辑应用' : '创建应用'"
      @ok="saveApplication"
      :confirm-loading="applicationStore.isSaving"
      :ok-text="editingApplication ? '更新' : '创建'"
      :cancel-text="'取消'"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        @finish="saveApplication"
      >
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item name="name" label="应用名称">
              <a-input
                v-model:value="form.name"
                placeholder="请输入应用名称"
                size="large"
              />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item name="description" label="应用描述">
              <a-textarea
                v-model:value="form.description"
                placeholder="请输入应用描述"
                :rows="4"
                size="large"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 删除确认对话框 -->
    <a-modal
      v-model:open="showDeleteDialog"
      title="确认删除"
      @ok="confirmDelete"
      :confirm-loading="applicationStore.isDeleting"
      ok-text="删除"
      cancel-text="取消"
      ok-type="danger"
    >
      <div class="delete-content">
        <ExclamationCircleOutlined class="delete-icon" />
        <p>确定要删除应用 "{{ applicationToDelete?.name }}" 吗？此操作不可恢复。</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useApplicationStore } from '@/stores/applicationStore.ts'
import type { Application } from '@/dto/application.ts'
import PageHeader from '@/components/PageHeader.vue'
import {
  AppstoreOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

const applicationStore = useApplicationStore()

// 状态
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingApplication = ref<Application | null>(null)
const applicationToDelete = ref<Application | null>(null)
const search = ref('')

// 表单数据
const form = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入应用描述', trigger: 'blur' }
  ]
}

// 表格列定义
const columns = [
  {
    title: '应用名称',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '应用描述',
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

// 过滤后的应用列表
const filteredApplications = computed(() => {
  if (!search.value) return applicationStore.applications
  
  const searchLower = search.value.toLowerCase()
  return applicationStore.applications.filter(app => 
    app.name.toLowerCase().includes(searchLower) ||
    app.description.toLowerCase().includes(searchLower)
  )
})

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取应用列表
const fetchApplications = async () => {
  try {
    await applicationStore.fetchApplications()
  } catch (error) {
    console.error('获取应用列表失败:', error)
  }
}

// 编辑应用
const editApplication = (application: Application) => {
  editingApplication.value = application
  form.name = application.name
  form.description = application.description
  showDialog.value = true
}

// 删除应用
const deleteApplication = (application: Application) => {
  applicationToDelete.value = application
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!applicationToDelete.value) return
  
  try {
    await applicationStore.deleteApplication(applicationToDelete.value.id)
    showDeleteDialog.value = false
    applicationToDelete.value = null
  } catch (error) {
    console.error('删除应用失败:', error)
  }
}

// 保存应用
const saveApplication = async (values: any) => {
  try {
    const appData = {
      name: form.name,
      description: form.description
    }
    
    if (editingApplication.value) {
      // 更新应用
      appData.id = editingApplication.value.id
    }
    
    await applicationStore.saveApplication(appData)
    closeDialog()
  } catch (error) {
    console.error('保存应用失败:', error)
  }
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  editingApplication.value = null
  form.name = ''
  form.description = ''
}

// 初始化
onMounted(() => {
  applicationStore.initializeApplications()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.application-management {
  padding: 24px;
  background: #FFFFFF;
  min-height: 100vh;
}

.create-btn {
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
}

.content-area {
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #F0F0F0;
}

.application-card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.search-section {
  padding: 24px 24px 0;
}

.search-field {
  max-width: 400px;
}

.table-section {
  padding: 0 24px 24px;
}

.application-table {
  .ant-table-thead > tr > th {
    background: #FAFAFA;
    font-weight: 500;
  }
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

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 48px;
  color: #CCCCCC;
  margin-bottom: 16px;
}

.empty-title {
  margin-bottom: 8px !important;
  color: #666666 !important;
}

.empty-subtitle {
  color: #666666;
  margin-bottom: 24px;
  display: block;
}

.empty-action {
  height: 40px;
  padding: 0 24px;
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
  .application-management {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .search-field {
    max-width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style> 