<template>
  <div class="llm-provider-define-manage">
    <PageHeader
      title="大模型提供商定义管理"
      subtitle="管理大语言模型提供商的基本信息和配置"
      icon="ApiOutlined"
    >
      <template #actions>
        <a-button type="primary" @click="showCreateDialog">
          <template #icon>
            <PlusOutlined />
          </template>
          创建提供商定义
        </a-button>
      </template>
    </PageHeader>

    <!-- 搜索区域 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-form-item label="提供商名称" name="name">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入提供商名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="提供商类型" name="type">
          <a-input
            v-model:value="searchForm.type"
            placeholder="请输入提供商类型"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">
            <template #icon>
              <SearchOutlined />
            </template>
            搜索
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">
            <template #icon>
              <ReloadOutlined />
            </template>
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="llmProviderDefines"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon_url'">
            <div class="icon-cell">
              <img
                v-if="record.icon_url"
                :src="getIconUrl(record.icon_url)"
                :alt="record.name"
                class="provider-icon"
                @error="handleImageError"
              />
              <a-avatar v-else icon="ApiOutlined" />
            </div>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editLlmProviderDefine(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个提供商定义吗？"
                @confirm="deleteLlmProviderDefine(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑对话框 -->
    <a-modal
      v-model:open="dialogVisible"
      :title="editingLlmProviderDefine ? '编辑提供商定义' : '创建提供商定义'"
      :confirm-loading="saving"
      @ok="saveLlmProviderDefine"
      @cancel="closeDialog"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        @finish="saveLlmProviderDefine"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="提供商名称" name="name">
              <a-input v-model:value="form.name" placeholder="请输入提供商名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="提供商类型" name="type">
              <a-select v-model:value="form.type" placeholder="请选择提供商类型">
                <a-select-option value="openai">OpenAI</a-select-option>
                <a-select-option value="anthropic">Anthropic</a-select-option>
                <a-select-option value="google">Google</a-select-option>
                <a-select-option value="azure">Azure</a-select-option>
                <a-select-option value="custom">自定义</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="提供商描述" name="description">
          <a-textarea
            v-model:value="form.description"
            placeholder="请输入提供商描述"
            :rows="3"
          />
        </a-form-item>
                 <a-form-item label="提供商图标" name="icon_url">
           <div class="icon-upload-container">
             <div class="icon-preview">
               <img
                 v-if="form.icon_url"
                 :src="getIconUrl(form.icon_url)"
                 :alt="form.name"
                 class="preview-icon"
                 @error="handleImageError"
               />
               <a-avatar v-else icon="ApiOutlined" :size="64" />
             </div>
             <div class="icon-upload-actions">
               <a-upload
                 :show-upload-list="false"
                 :before-upload="beforeUpload"
                 accept="image/*"
               >
                 <a-button>
                   <template #icon>
                     <UploadOutlined />
                   </template>
                   选择图片
                 </a-button>
               </a-upload>
               <a-button v-if="form.icon_url" @click="clearIcon" style="margin-left: 8px">
                 清除
               </a-button>
             </div>
           </div>
         </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  ApiOutlined
} from '@ant-design/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import llmProviderDefineService from '@/services/llmProviderDefineService'
import ResourceUtils from '@/utils/resource-utils'
import type { LlmProviderDefine, SaveLlmProviderDefineRequest, QueryLlmProviderDefineRequest } from '@/dto/llmProviderDefine'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingLlmProviderDefine = ref<LlmProviderDefine | null>(null)
const llmProviderDefines = ref<LlmProviderDefine[]>([])

// 搜索表单
const searchForm = reactive<QueryLlmProviderDefineRequest>({
  name: '',
  type: ''
})

// 编辑表单
const form = reactive<SaveLlmProviderDefineRequest>({
  name: '',
  description: '',
  icon_url: '',
  type: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入提供商名称' }],
  description: [{ required: true, message: '请输入提供商描述' }],
  type: [{ required: true, message: '请选择提供商类型' }],
  icon_url: [{ required: true, message: '请上传提供商图标' }]
}

// 表格列定义
const columns = [
  {
    title: '图标',
    key: 'icon_url',
    width: 80,
    align: 'center'
  },
  {
    title: '提供商名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '提供商类型',
    key: 'type',
    width: 120
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    customRender: ({ text }: { text: number }) => {
      return new Date(text).toLocaleString()
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center'
  }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 获取图标URL
const getIconUrl = (iconUrl: string) => {
  if (!iconUrl) return ''
  
  // 如果是 base64 格式或 http 链接，直接返回
  if (iconUrl.startsWith('data:') || iconUrl.startsWith('http')) {
    return iconUrl
  }
  
  // 如果是相对路径，使用 ResourceUtils 拼接完整路径
  return ResourceUtils.getSystemPublicResourceRealUrl(iconUrl)
}

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    openai: 'blue',
    anthropic: 'green',
    google: 'red',
    azure: 'purple',
    custom: 'orange'
  }
  return colorMap[type] || 'default'
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 获取数据
const fetchLlmProviderDefines = async () => {
  try {
    loading.value = true
    const response = await llmProviderDefineService.getAllLlmProviderDefines()
    llmProviderDefines.value = response.llm_provider_defines
    pagination.total = response.llm_provider_defines.length
  } catch (error) {
    console.error('获取提供商定义失败:', error)
    message.error('获取提供商定义失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = async () => {
  try {
    loading.value = true
    const response = await llmProviderDefineService.queryLlmProviderDefines(searchForm)
    llmProviderDefines.value = response.llm_provider_defines
    pagination.total = response.llm_provider_defines.length
  } catch (error) {
    console.error('搜索提供商定义失败:', error)
    message.error('搜索提供商定义失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  searchForm.type = ''
  fetchLlmProviderDefines()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchLlmProviderDefines()
}

// 显示创建对话框
const showCreateDialog = () => {
  editingLlmProviderDefine.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑提供商定义
const editLlmProviderDefine = (record: LlmProviderDefine) => {
  editingLlmProviderDefine.value = record
  form.id = record.id
  form.name = record.name
  form.description = record.description
  form.icon_url = record.icon_url
  form.type = record.type
  dialogVisible.value = true
}

// 保存提供商定义
const saveLlmProviderDefine = async () => {
  try {
    saving.value = true
    await llmProviderDefineService.saveLlmProviderDefine(form)
    message.success(editingLlmProviderDefine.value ? '更新成功' : '创建成功')
    closeDialog()
    fetchLlmProviderDefines()
  } catch (error) {
    console.error('保存提供商定义失败:', error)
    message.error('保存提供商定义失败')
  } finally {
    saving.value = false
  }
}

// 删除提供商定义
const deleteLlmProviderDefine = async (id: string) => {
  try {
    await llmProviderDefineService.deleteLlmProviderDefine(id)
    message.success('删除成功')
    fetchLlmProviderDefines()
  } catch (error) {
    console.error('删除提供商定义失败:', error)
    message.error('删除提供商定义失败')
  }
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.id = undefined
  form.name = ''
  form.description = ''
  form.icon_url = ''
  form.type = ''
}

// 上传前处理
const beforeUpload = async (file: File) => {
  try {
    // 将文件转换为 base64
    const base64 = await fileToBase64(file)
    form.icon_url = base64
    message.success('图片选择成功')
    return false // 阻止默认上传行为
  } catch (error) {
    console.error('图片转换失败:', error)
    message.error('图片转换失败')
    return false
  }
}

// 文件转 base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// 清除图标
const clearIcon = () => {
  form.icon_url = ''
}

// 初始化
onMounted(() => {
  fetchLlmProviderDefines()
})
</script>

<style scoped lang="scss">
.llm-provider-define-manage {
  padding: 24px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.icon-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.provider-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
}

.icon-upload-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
}

.preview-icon {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  object-fit: cover;
}

.icon-upload-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 