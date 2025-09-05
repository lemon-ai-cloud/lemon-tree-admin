<template>
  <div class="mcp-server-config-manage">
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
          {{ $v_translate('add_mcp_config') }}
        </a-button>
      </div>
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
                  {{ $v_translate('edit') }}
                </a-button>
                <a-button type="link" size="small" @click="handleViewTools(record)">
                  <template #icon>
                    <ToolOutlined/>
                  </template>
                  {{ $v_translate('view_tools') }}
                </a-button>
                <a-popconfirm
                    :title="$v_translate('confirm_delete_mcp_config')"
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
            <a-form-item name="name" :label="$v_translate('config_name')">
              <a-input
                  v-model:value="formData.name"
                  :placeholder="$v_translate('enter_config_name')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="version" :label="$v_translate('version')">
              <a-input
                  v-model:value="formData.version"
                  :placeholder="$v_translate('enter_version')"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="description" :label="$v_translate('description')">
          <a-textarea
              v-model:value="formData.description"
              :placeholder="$v_translate('enter_config_description')"
              :rows="3"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="mcp_server_connect_type" :label="$v_translate('connect_type')">
              <a-select
                  v-model:value="formData.mcp_server_connect_type"
                  :placeholder="$v_translate('select_connect_type')"
                  @change="handleConnectTypeChange"
              >
                <a-select-option value="sse">SSE</a-select-option>
                <a-select-option value="stdio">STDIO</a-select-option>
                <a-select-option value="streamable-http">Streamable HTTP</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="mcp_server_timeout" :label="$v_translate('timeout_seconds')">
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
        <template
            v-if="formData.mcp_server_connect_type === 'sse' || formData.mcp_server_connect_type === 'streamable-http'">
          <a-form-item name="mcp_server_url" :label="$v_translate('server_url')">
            <a-input
                v-model:value="formData.mcp_server_url"
                :placeholder="$v_translate('enter_server_url')"
            />
          </a-form-item>
          <a-form-item name="mcp_server_header" :label="$v_translate('request_headers')">
            <a-textarea
                v-model:value="formData.mcp_server_header"
                :placeholder="$v_translate('enter_request_headers')"
                :rows="3"
            />
          </a-form-item>
        </template>

        <!-- STDIO 配置 -->
        <template v-if="formData.mcp_server_connect_type === 'stdio'">
          <a-form-item name="mcp_server_command" :label="$v_translate('execute_command')">
            <a-input
                v-model:value="formData.mcp_server_command"
                :placeholder="$v_translate('enter_execute_command')"
            />
          </a-form-item>
          <a-form-item name="mcp_server_args" :label="$v_translate('command_args')">
            <a-input
                v-model:value="formData.mcp_server_args"
                :placeholder="$v_translate('enter_command_args')"
            />
          </a-form-item>
          <a-form-item name="mcp_server_env" :label="$v_translate('env_variables')">
            <a-textarea
                v-model:value="formData.mcp_server_env"
                :placeholder="$v_translate('enter_env_variables')"
                :rows="3"
            />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>

    <!-- 查看工具对话框 -->
    <a-modal
        v-model:open="toolsModalVisible"
        :title="$v_translate('mcp_server_tools_title')"
        width="900px"
        @cancel="handleToolsModalCancel">
      <template #footer>
        <div style="text-align: right;">
          <a-button @click="handleToolsModalCancel">{{ $v_translate('close') }}</a-button>
          <a-button
              type="primary"
              @click="handleSyncToolsFromModal"
              :loading="syncingConfigId === currentViewingConfigId"
              style="margin-left: 8px;"
          >
            <template #icon>
              <ReloadOutlined/>
            </template>
            {{ $v_translate('sync_tools_from_mcp_server') }}
          </a-button>
        </div>
      </template>
      <div v-if="toolsLoading" class="tools-loading">
        <a-spin size="large"/>
        <div style="margin-top: 16px;">{{ $v_translate('getting_tools_list') }}</div>
      </div>
      <div v-else-if="tools.length === 0" class="no-tools">
        {{ $v_translate('no_available_tools') }}
      </div>
      <div v-else class="tools-list">
        <div v-for="tool in tools" :key="tool.id" class="tool-item">
          <div class="tool-header">
            <h4 class="tool-name">{{ tool.name }}</h4>
            <a-tag color="blue" size="small">{{ $v_translate('tool') }}</a-tag>
          </div>
          <div class="tool-title" v-if="tool.title && tool.title !== tool.name">
            <strong>{{ $v_translate('title') }}</strong>{{ tool.title }}
          </div>
          <div class="tool-description">{{ tool.description }}</div>
          <div class="tool-meta">
            <div class="meta-item">
              <strong>{{ $v_translate('tool_id') }}</strong>{{ tool.id }}
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed, watch} from 'vue'
import {message} from 'ant-design-vue'
import i18n from '@/i18n.ts'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ToolOutlined
} from '@ant-design/icons-vue'
import type {
  ApplicationMcpServerConfigDto,
  SaveApplicationMcpServerConfigRequest,
  ApplicationMcpServerToolDto
} from '@/dto/applicationMcpServerConfig'
import applicationMcpServerConfigService from '@/services/applicationMcpServerConfigService'
import {useApplicationStore} from '@/stores/applicationStore'

const v_scope = 'views.app_settings.mcp_server_config_manage.'
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
const toolsModalVisible = ref(false)
const toolsLoading = ref(false)
const tools = ref<ApplicationMcpServerToolDto[]>([])
const syncingConfigId = ref<string | null>(null)
const currentViewingConfigId = ref<string | null>(null)

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
  showTotal: (total: number) => i18n.global.t(v_scope + 'total_records', { total })
})

// 表格列定义
const columns = [
  {
    title: i18n.global.t(v_scope + 'config_name'),
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: i18n.global.t(v_scope + 'version'),
    dataIndex: 'version',
    key: 'version',
    width: 100
  },
  {
    title: i18n.global.t(v_scope + 'connect_type'),
    key: 'connect_type',
    width: 160,
    align: 'center'
  },
  {
    title: i18n.global.t(v_scope + 'description'),
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: i18n.global.t(v_scope + 'timeout_seconds'),
    dataIndex: 'mcp_server_timeout',
    key: 'mcp_server_timeout',
    width: 100,
    align: 'center'
  },
  {
    title: i18n.global.t(v_scope + 'actions'),
    key: 'action',
    width: 280,
    align: 'center',
    fixed: 'right'
  }
]

// 计算属性
const modalTitle = computed(() => isEdit.value ? i18n.global.t(v_scope + 'edit_mcp_config') : i18n.global.t(v_scope + 'add_mcp_config'))
const mcpConfigs = ref<ApplicationMcpServerConfigDto[]>([])

// 表单验证规则
const formRules = {
  name: [{required: true, message: i18n.global.t(v_scope + 'enter_config_name_required'), trigger: 'blur'}],
  description: [{required: true, message: i18n.global.t(v_scope + 'enter_config_description_required'), trigger: 'blur'}],
  version: [{required: true, message: i18n.global.t(v_scope + 'enter_version_required'), trigger: 'blur'}],
  mcp_server_connect_type: [{required: true, message: i18n.global.t(v_scope + 'select_connect_type_required'), trigger: 'change'}],
  mcp_server_timeout: [{required: true, message: i18n.global.t(v_scope + 'enter_timeout_required'), trigger: 'blur'}]
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
    message.warning(i18n.global.t(v_scope + 'please_select_application'))
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
    message.error(i18n.global.t(v_scope + 'load_data_failed'))
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
    message.warning(i18n.global.t(v_scope + 'please_select_application'))
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
  currentViewingConfigId.value = record.id

  try {
    const response = await applicationMcpServerConfigService.getMcpServerTools(record.id)
    tools.value = response.tools
  } catch (error) {
    console.error('获取工具列表失败:', error)
    message.error(i18n.global.t(v_scope + 'get_tools_list_failed'))
  } finally {
    toolsLoading.value = false
  }
}

// 工具对话框取消
const handleToolsModalCancel = () => {
  toolsModalVisible.value = false
  tools.value = []
  currentViewingConfigId.value = null
}

// 从模态框同步工具
const handleSyncToolsFromModal = async () => {
  if (!currentViewingConfigId.value) return

  syncingConfigId.value = currentViewingConfigId.value

  try {
    const response = await applicationMcpServerConfigService.syncMcpServerTools(currentViewingConfigId.value)
    message.success(response.message || i18n.global.t(v_scope + 'sync_tools_success'))
    tools.value = response.tools
  } catch (error) {
    console.error('同步工具失败:', error)
    message.error(i18n.global.t(v_scope + 'sync_tools_failed'))
  } finally {
    syncingConfigId.value = null
  }
}

// 删除处理
const handleDelete = async (id: string) => {
  try {
    await applicationMcpServerConfigService.deleteApplicationMcpServerConfig(id)
    message.success(i18n.global.t(v_scope + 'delete_success'))
    loadData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error(i18n.global.t(v_scope + 'delete_failed'))
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
      message.error(i18n.global.t(v_scope + 'application_id_required'))
      return
    }

    submitting.value = true

    if (isEdit.value) {
      await applicationMcpServerConfigService.saveApplicationMcpServerConfig(formData)
      message.success(i18n.global.t(v_scope + 'update_success'))
    } else {
      await applicationMcpServerConfigService.saveApplicationMcpServerConfig(formData)
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
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;

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

    .tool-title {
      color: #1890ff;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .tool-description {
      color: #595959;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .tool-meta {
      border-top: 1px solid #f0f0f0;
      padding-top: 12px;

      .meta-item {
        margin-bottom: 6px;
        font-size: 12px;
        color: #8c8c8c;

        strong {
          color: #595959;
        }
      }
    }
  }
}
</style>