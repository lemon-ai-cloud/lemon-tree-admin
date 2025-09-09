<template>
  <div class="chat-agent-mcp-server-tool-manage">
    <div class="tool-manage-header">
      <p class="description">{{ $v_translate('tool_management_description') }}</p>
    </div>

    <div class="tool-list">
      <a-spin :spinning="loading">
        <div v-if="toolGroups.length === 0 && !loading" class="empty-state">
          <a-empty :description="$v_translate('no_tools_available')" />
        </div>
        <div v-else class="tool-groups">
          <div
            v-for="group in toolGroups"
            :key="group.server.id"
            class="tool-group"
          >
            <div class="group-header">
              <h4 class="group-title">{{ group.server.name }}</h4>
              <p class="group-description">{{ group.server.description }}</p>
            </div>
            <div class="group-tools">
              <div
                v-for="tool in group.tools"
                :key="tool.id"
                class="tool-item"
              >
                <div class="tool-info">
                  <div class="tool-title">{{ tool.title || tool.name }}</div>
                  <div class="tool-description">{{ tool.description }}</div>
                </div>
                <div class="tool-actions">
                  <a-switch
                    v-model:checked="tool.enabled"
                    @change="handleToolToggle(tool)"
                    :loading="tool.updating"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>

    <div class="tool-manage-footer">
      <a-space>
        <a-button @click="handleCancel">
          {{ $v_translate('cancel') }}
        </a-button>
        <a-button
          type="primary"
          @click="handleSave"
          :loading="saving"
          :disabled="!hasChanges"
        >
          {{ $v_translate('save') }}
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import i18n from '@/i18n.ts'
import type { ChatAgentAvailableMcpServerTool, McpServerToolGroup } from '@/dto/chatAgentMcpServerTool'
import chatAgentMcpServerToolService from '@/services/chatAgentMcpServerToolService'

const v_scope = 'views.app.chat_agent_mcp_server_tool_manage.'
defineExpose({
  v_scope
})

// Props
interface Props {
  chatAgentId: string
  chatAgentName: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const toolGroups = ref<McpServerToolGroup[]>([])
const originalToolGroups = ref<McpServerToolGroup[]>([])

// 计算属性
const hasChanges = computed(() => {
  if (toolGroups.value.length !== originalToolGroups.value.length) {
    return true
  }
  
  return toolGroups.value.some((group, groupIndex) => {
    const originalGroup = originalToolGroups.value[groupIndex]
    if (!originalGroup || group.tools.length !== originalGroup.tools.length) {
      return true
    }
    
    return group.tools.some((tool, toolIndex) => {
      const originalTool = originalGroup.tools[toolIndex]
      return !originalTool || tool.enabled !== originalTool.enabled
    })
  })
})

// 生命周期
onMounted(() => {
  loadTools()
})

// 加载工具列表
const loadTools = async () => {
  loading.value = true
  try {
    const response = await chatAgentMcpServerToolService.getChatAgentAvailableMcpServerTools(
      props.chatAgentId
    )
    
    if (response.success) {
      toolGroups.value = response.data.map(group => ({
        ...group,
        tools: group.tools.map(tool => ({
          ...tool,
          updating: false
        }))
      }))
      // 深拷贝保存原始状态
      originalToolGroups.value = JSON.parse(JSON.stringify(toolGroups.value))
    } else {
      message.error(response.message || i18n.global.t(v_scope + 'load_tools_failed'))
    }
  } catch (error) {
    console.error('加载工具列表失败:', error)
    message.error(i18n.global.t(v_scope + 'load_tools_failed'))
  } finally {
    loading.value = false
  }
}

// 处理工具开关切换
const handleToolToggle = (tool: ChatAgentAvailableMcpServerTool) => {
  // 这里只是更新本地状态，实际保存需要点击保存按钮
  console.log(`工具 ${tool.name} 状态切换为: ${tool.enabled}`)
}

// 保存设置
const handleSave = async () => {
  saving.value = true
  try {
    const toolSettings: any[] = []
    
    // 收集所有工具设置
    toolGroups.value.forEach(group => {
      group.tools.forEach(tool => {
        toolSettings.push({
          id: '', // 新建时为空
          application_mcp_server_tool_id: tool.id,
          enabled: tool.enabled
        })
      })
    })

    const request = {
      tool_settings: toolSettings
    }

    const response = await chatAgentMcpServerToolService.saveChatAgentMcpServerToolSettings(
      props.chatAgentId,
      request
    )
    
    if (response.success) {
      message.success(i18n.global.t(v_scope + 'save_success'))
      // 更新原始状态
      originalToolGroups.value = JSON.parse(JSON.stringify(toolGroups.value))
      emit('close')
    } else {
      message.error(response.message || i18n.global.t(v_scope + 'save_failed'))
    }
  } catch (error) {
    console.error('保存工具设置失败:', error)
    message.error(i18n.global.t(v_scope + 'save_failed'))
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  if (hasChanges.value) {
    // 如果有未保存的更改，恢复原始状态
    toolGroups.value = JSON.parse(JSON.stringify(originalToolGroups.value))
  }
  emit('close')
}
</script>

<style scoped lang="scss">
.chat-agent-mcp-server-tool-manage {
  margin-top: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .tool-manage-header {
    margin-bottom: 21px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 16px;

    .description {
      margin: 0;
      color: #8c8c8c;
      font-size: 14px;
    }
  }

  .tool-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 24px;

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .tool-groups {
      .tool-group {
        margin-bottom: 24px;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        overflow: hidden;

        .group-header {
          background: #fafafa;
          padding: 16px 20px;
          border-bottom: 1px solid #e8e8e8;

          .group-title {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #262626;
          }

          .group-description {
            margin: 0;
            font-size: 14px;
            color: #8c8c8c;
            line-height: 1.4;
          }
        }

        .group-tools {
          .tool-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #f0f0f0;
            transition: all 0.3s ease;

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background-color: #fafafa;
            }

            .tool-info {
              flex: 1;
              margin-right: 16px;

              .tool-title {
                font-size: 15px;
                font-weight: 500;
                color: #262626;
                margin-bottom: 4px;
              }

              .tool-description {
                font-size: 13px;
                color: #8c8c8c;
                line-height: 1.4;
              }
            }

            .tool-actions {
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }

  .tool-manage-footer {
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
