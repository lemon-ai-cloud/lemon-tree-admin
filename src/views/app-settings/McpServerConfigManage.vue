<template>
  <div class="mcp-server-config-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">MCP 工具管理</h1>
        <p class="page-description">管理应用下的所有 MCP 服务器配置</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="showCreateModal">
          <template #icon>
            <PlusOutlined/>
          </template>
          新增 MCP 配置
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <a-card>
        <a-form layout="inline" :model="searchForm" @finish="handleSearch">
          <a-form-item name="name" label="配置名称">
            <a-input
                v-model:value="searchForm.name"
                placeholder="请输入配置名称"
                allow-clear
            />
          </a-form-item>
          <a-form-item name="connect_type" label="连接方式">
            <a-select
                v-model:value="searchForm.connect_type"
                placeholder="请选择连接方式"
                allow-clear
                style="width: 200px"
            >
              <a-select-option value="sse">SSE</a-select-option>
              <a-select-option value="stdio">STDIO</a-select-option>
              <a-select-option value="streamable-http">Streamable HTTP</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">
              <template #icon>
                <SearchOutlined/>
              </template>
              搜索
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              <template #icon>
                <ReloadOutlined/>
              </template>
              重置
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
            :data-source="mcpConfigs"
            :loading="loading"
            :pagination="pagination"
            row-key="id"
            @change="handleTableChange"
        >
          <!-- 连接方式 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'connect_type'">
              <a-tag :color="getConnectTypeColor(record.mcp_server_connect_type)">
                {{ getConnectTypeLabel(record.mcp_server_connect_type) }}
              </a-tag>
            </template>

            <!-- 操作列 -->
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">
                  <template #icon>
                    <EditOutlined/>
                  </template>
                  编辑
                </a-button>
                <a-button type="link" size="small" @click="handleViewTools(record)">
                  <template #icon>
                    <ToolOutlined/>
                  </template>
                  查看工具
                </a-button>
                <a-popconfirm
                    title="确定要删除这个MCP配置吗？"
                    @confirm="handleDelete(record.id)"
                >
                  <a-button type="link" size="small" danger>
                    <template #icon>
                      <DeleteOutlined/>
                    </template>
                    删除
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
        width="800px"
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
            <a-form-item name="name" label="配置名称">
              <a-input
                  v-model:value="formData.name"
                  placeholder="请输入配置名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="version" label="版本">
              <a-input
                  v-model:value="formData.version"
                  placeholder="请输入版本号"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="description" label="配置描述">
          <a-textarea
              v-model:value="formData.description"
              placeholder="请输入配置描述"
              :rows="3"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="mcp_server_connect_type" label="连接方式">
              <a-select
                  v-model:value="formData.mcp_server_connect_type"
                  placeholder="请选择连接方式"
                  @change="handleConnectTypeChange"
              >
                <a-select-option value="sse">SSE</a-select-option>
                <a-select-option value="stdio">STDIO</a-select-option>
                <a-select-option value="streamable-http">Streamable HTTP</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="mcp_server_timeout" label="超时时间(秒)">
              <a-input-number size="large"
                  v-model:value="formData.mcp_server_timeout"
                  :min="1"
                  :max="300"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- SSE / Streamable HTTP 配置 -->
        <template v-if="formData.mcp_server_connect_type === 'sse' || formData.mcp_server_connect_type === 'streamable-http'">
          <a-form-item name="mcp_server_url" label="服务器URL">
            <a-input
                v-model:value="formData.mcp_server_url"
                placeholder="请输入服务器URL"
            />
          </a-form-item>
          <a-form-item name="mcp_server_header" label="请求头(JSON格式)">
            <a-textarea
                v-model:value="formData.mcp_server_header"
                placeholder='请输入请求头，JSON格式，如：{"Authorization": "Bearer token"}'
                :rows="3"
            />
          </a-form-item>
        </template>

        <!-- STDIO 配置 -->
        <template v-if="formData.mcp_server_connect_type === 'stdio'">
          <a-form-item name="mcp_server_command" label="执行命令">
            <a-input
                v-model:value="formData.mcp_server_command"
                placeholder="请输入执行命令"
            />
          </a-form-item>
          <a-form-item name="mcp_server_args" label="命令参数">
            <a-input
                v-model:value="formData.mcp_server_args"
                placeholder="请输入命令参数，多个参数用空格分隔"
            />
          </a-form-item>
          <a-form-item name="mcp_server_env" label="环境变量(JSON格式)">
            <a-textarea
                v-model:value="formData.mcp_server_env"
                placeholder='请输入环境变量，JSON格式，如：{"PATH": "/usr/bin", "NODE_ENV": "production"}'
                :rows="3"
            />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>

    <!-- 查看工具对话框 -->
    <a-modal
        v-model:open="toolsModalVisible"
        title="MCP 服务器工具列表"
        width="900px"
        @cancel="handleToolsModalCancel"
        :footer="null">
      <div v-if="toolsLoading" class="tools-loading">
        <a-spin size="large" />
        <div style="margin-top: 16px;">正在获取工具列表...</div>
      </div>
      <div v-else-if="tools.length === 0" class="no-tools">
        该 MCP 服务器暂无可用工具
      </div>
      <div v-else class="tools-list">
        <div v-for="tool in tools" :key="tool.name" class="tool-item">
          <div class="tool-header">
            <h4 class="tool-name">{{ tool.name }}</h4>
            <a-tag color="blue" size="small">工具</a-tag>
          </div>
          <div class="tool-description">{{ tool.description }}</div>
          <div class="tool-parameters" v-if="tool.parameters && Object.keys(tool.parameters).length > 0">
            <h5>参数：</h5>
            <div class="parameter-list">
              <div v-for="(type, name) in tool.parameters" :key="name" class="parameter-item">
                <span class="parameter-name">{{ name }}:</span>
                <span class="parameter-type">{{ type }}</span>
              </div>
            </div>
          </div>
          <div class="tool-schema" v-if="tool.input_schema">
            <h5>输入模式：</h5>
            <pre class="schema-json">{{ JSON.stringify(tool.input_schema, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed, watch} from 'vue'
import {message} from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ToolOutlined
} from '@ant-design/icons-vue'
import type {ApplicationMcpServerConfigDto, SaveApplicationMcpServerConfigRequest, McpTool} from '@/dto/applicationMcpServerConfig'
import applicationMcpServerConfigService from '@/services/applicationMcpServerConfigService'
import {useApplicationStore} from '@/stores/applicationStore'

// 应用状态管理
const applicationStore = useApplicationStore()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const toolsModalVisible = ref(false)
const toolsLoading = ref(false)
const tools = ref<McpTool[]>([])

// 表单数据
const formData = reactive<SaveApplicationMcpServerConfigRequest>({
  id: undefined,
  name: '',
  description: '',
  version: '',
  application_id: '',
  mcp_server_connect_type: '',
  mcp_server_timeout: 30,
  mcp_server_url: '',
  mcp_server_header: '',
  mcp_server_command: '',
  mcp_server_args: '',
  mcp_server_env: ''
})

// 搜索表单
const searchForm = reactive({
  name: '',
  connect_type: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 表格列定义
const columns = [
  {
    title: '配置名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
    width: 100
  },
  {
    title: '连接方式',
    key: 'connect_type',
    width: 160,
    align: 'center'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '超时时间',
    dataIndex: 'mcp_server_timeout',
    key: 'mcp_server_timeout',
    width: 100,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
    align: 'center',
    fixed: 'right'
  }
]

// 计算属性
const modalTitle = computed(() => isEdit.value ? '编辑 MCP 配置' : '新增 MCP 配置')
const mcpConfigs = ref<ApplicationMcpServerConfigDto[]>([])

// 表单验证规则
const formRules = {
  name: [{required: true, message: '请输入配置名称', trigger: 'blur'}],
  description: [{required: true, message: '请输入配置描述', trigger: 'blur'}],
  version: [{required: true, message: '请输入版本号', trigger: 'blur'}],
  mcp_server_connect_type: [{required: true, message: '请选择连接方式', trigger: 'change'}],
  mcp_server_timeout: [{required: true, message: '请输入超时时间', trigger: 'blur'}]
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
    message.warning('请先选择一个应用')
    return
  }

  loading.value = true
  try {
    const response = await applicationMcpServerConfigService.getMcpServerConfigsByApplicationID(
        applicationStore.selectedApplication.id
    )
    mcpConfigs.value = response.application_mcp_server_configs
    pagination.total = response.application_mcp_server_configs.length
  } catch (error) {
    console.error('加载数据失败:', error)
    message.error('加载数据失败')
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
    connect_type: ''
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
    message.warning('请先选择一个应用')
    return
  }

  isEdit.value = false
  resetForm()
  formData.application_id = applicationStore.selectedApplication.id
  modalVisible.value = true
}

// 显示编辑对话框
const handleEdit = (record: ApplicationMcpServerConfigDto) => {
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    description: record.description,
    version: record.version,
    application_id: record.application_id,
    mcp_server_connect_type: record.mcp_server_connect_type,
    mcp_server_timeout: record.mcp_server_timeout,
    mcp_server_url: record.mcp_server_url,
    mcp_server_header: record.mcp_server_header,
    mcp_server_command: record.mcp_server_command,
    mcp_server_args: record.mcp_server_args,
    mcp_server_env: record.mcp_server_env
  })
  modalVisible.value = true
}

// 查看工具
const handleViewTools = async (record: ApplicationMcpServerConfigDto) => {
  toolsModalVisible.value = true
  toolsLoading.value = true
  tools.value = []

  try {
    const response = await applicationMcpServerConfigService.getMcpServerTools(record.id)
    tools.value = response.tools
  } catch (error) {
    console.error('获取工具列表失败:', error)
    message.error('获取工具列表失败')
  } finally {
    toolsLoading.value = false
  }
}

// 工具对话框取消
const handleToolsModalCancel = () => {
  toolsModalVisible.value = false
  tools.value = []
}

// 删除处理
const handleDelete = async (id: string) => {
  try {
    await applicationMcpServerConfigService.deleteApplicationMcpServerConfig(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 连接方式变化处理
const handleConnectTypeChange = () => {
  // 清空相关字段
  formData.mcp_server_url = ''
  formData.mcp_server_header = ''
  formData.mcp_server_command = ''
  formData.mcp_server_args = ''
  formData.mcp_server_env = ''
}

// 对话框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    if (!formData.application_id) {
      message.error('应用ID不能为空，请重新选择应用')
      return
    }

    submitting.value = true

    if (isEdit.value) {
      await applicationMcpServerConfigService.saveApplicationMcpServerConfig(formData)
      message.success('更新成功')
    } else {
      await applicationMcpServerConfigService.saveApplicationMcpServerConfig(formData)
      message.success('创建成功')
    }

    modalVisible.value = false
    loadData()
  } catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败')
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
    version: '',
    application_id: currentAppId,
    mcp_server_connect_type: '',
    mcp_server_timeout: 30,
    mcp_server_url: '',
    mcp_server_header: '',
    mcp_server_command: '',
    mcp_server_args: '',
    mcp_server_env: ''
  })

  formRef.value?.resetFields()

  if (currentAppId) {
    formData.application_id = currentAppId
  }
}

// 获取连接方式标签颜色
const getConnectTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    sse: 'blue',
    stdio: 'green',
    'streamable-http': 'orange'
  }
  return colorMap[type] || 'default'
}

// 获取连接方式标签文本
const getConnectTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    sse: 'SSE',
    stdio: 'STDIO',
    'streamable-http': 'Streamable HTTP'
  }
  return labelMap[type] || type
}
</script>

<style scoped lang="scss">
.mcp-server-config-manage {
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
    // 表格样式
  }
}

.tools-loading {
  text-align: center;
  padding: 40px;
}

.no-tools {
  text-align: center;
  color: #8c8c8c;
  padding: 40px;
}

.tools-list {
  .tool-item {
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;

    &:last-child {
      margin-bottom: 0;
    }

    .tool-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .tool-name {
        margin: 0;
        color: #262626;
        font-size: 16px;
      }
    }

    .tool-description {
      color: #595959;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .tool-parameters {
      margin-bottom: 16px;

      h5 {
        margin: 0 0 8px 0;
        color: #262626;
        font-size: 14px;
      }

      .parameter-list {
        .parameter-item {
          display: flex;
          margin-bottom: 4px;

          .parameter-name {
            font-weight: 500;
            margin-right: 8px;
            min-width: 80px;
          }

          .parameter-type {
            color: #595959;
          }
        }
      }
    }

    .tool-schema {
      h5 {
        margin: 0 0 8px 0;
        color: #262626;
        font-size: 14px;
      }

      .schema-json {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        font-size: 12px;
        color: #595959;
        overflow-x: auto;
        margin: 0;
      }
    }
  }
}
</style>