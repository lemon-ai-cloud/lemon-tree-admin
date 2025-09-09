<template>
  <div class="chat-agent-conversation-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $v_translate('page_title') }}</h1>
        <p class="page-description">{{ $v_translate('page_description') }}</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="startNewConversation">
          <template #icon>
            <PlusOutlined/>
          </template>
          {{ $v_translate('new_conversation') }}
        </a-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧会话列表 -->
      <div class="conversation-sidebar">
        <a-card :title="$v_translate('conversation_list')" size="small">
          <div class="conversation-list">
            <div
              v-for="conversation in conversations"
              :key="conversation.id"
              class="conversation-item"
              :class="{ active: selectedConversationId === conversation.id }"
              @click="selectConversation(conversation)"
            >
              <div class="conversation-title">{{ conversation.title }}</div>
              <div class="conversation-time">{{ formatTime(conversation.created_at) }}</div>
              <div class="conversation-actions">
                <a-button
                  type="text"
                  size="small"
                  @click.stop="renameConversation(conversation)"
                >
                  <template #icon>
                    <EditOutlined/>
                  </template>
                </a-button>
                <a-popconfirm
                  :title="$v_translate('confirm_delete_conversation')"
                  @confirm="deleteConversation(conversation.id)"
                >
                  <a-button type="text" size="small" danger>
                    <template #icon>
                      <DeleteOutlined/>
                    </template>
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-area">
        <a-card v-if="selectedConversationId" class="chat-card">
          <template #title>
            <div class="chat-header">
              <span>{{ selectedConversation?.title }}</span>
              <a-button type="text" @click="clearConversation">
                <template #icon>
                  <ClearOutlined/>
                </template>
                {{ $v_translate('clear_conversation') }}
              </a-button>
            </div>
          </template>

          <!-- 消息列表 -->
          <div class="messages-container" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-item"
              :class="message.role"
            >
              <div class="message-avatar">
                <a-avatar>
                  <template #icon>
                    <UserOutlined v-if="message.role === 'user'"/>
                    <RobotOutlined v-else/>
                  </template>
                </a-avatar>
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.created_at) }}</div>
              </div>
            </div>
            
            <!-- 加载中状态 -->
            <div v-if="isLoading" class="message-item assistant">
              <div class="message-avatar">
                <a-avatar>
                  <template #icon>
                    <RobotOutlined/>
                  </template>
                </a-avatar>
              </div>
              <div class="message-content">
                <div class="message-text">
                  <a-spin size="small"/>
                  {{ $v_translate('ai_thinking') }}
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <a-input-group compact>
              <a-textarea
                v-model:value="inputMessage"
                :placeholder="$v_translate('input_placeholder')"
                :rows="3"
                :disabled="isLoading"
                @keydown.enter.ctrl="sendMessage"
                class="message-input"
              />
              <a-button
                type="primary"
                :loading="isLoading"
                :disabled="!inputMessage.trim()"
                @click="sendMessage"
                class="send-button"
              >
                <template #icon>
                  <SendOutlined/>
                </template>
                {{ $v_translate('send') }}
              </a-button>
            </a-input-group>
          </div>
        </a-card>

        <!-- 空状态 -->
        <a-empty v-else :description="$v_translate('no_conversation_selected')" class="empty-state"/>
      </div>
    </div>

    <!-- 重命名会话对话框 -->
    <a-modal
      v-model:open="renameModalVisible"
      :title="$v_translate('rename_conversation')"
      @ok="confirmRename"
      :confirm-loading="renaming"
    >
      <a-input
        v-model:value="newConversationTitle"
        :placeholder="$v_translate('enter_new_title')"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { message } from 'ant-design-vue'
import i18n from '@/i18n.ts'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
  SendOutlined,
  UserOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'
import type {
  ConversationInfoDto,
  ChatMessageInfoDto,
  ChatUserSendMessageRequest
} from '@/dto/chatAgentConversation'
import chatAgentConversationService from '@/services/chatAgentConversationService'
import { useApplicationStore } from '@/stores/applicationStore'

const v_scope = 'views.app.chat_agent_conversation_manage.'
defineExpose({
  v_scope
})

// Props
interface Props {
  chatAgentId: string
  chatAgentName: string
  systemPrompt: string
}

const props = defineProps<Props>()

// 应用状态管理
const applicationStore = useApplicationStore()

// 响应式数据
const conversations = ref<ConversationInfoDto[]>([])
const messages = ref<ChatMessageInfoDto[]>([])
const selectedConversationId = ref<string>('')
const inputMessage = ref('')
const isLoading = ref(false)
const renameModalVisible = ref(false)
const newConversationTitle = ref('')
const renaming = ref(false)
const conversationToRename = ref<ConversationInfoDto | null>(null)

// 计算属性
const selectedConversation = computed(() => {
  return conversations.value.find(c => c.id === selectedConversationId.value)
})

// 消息容器引用
const messagesContainer = ref<HTMLElement>()

// 生命周期
onMounted(() => {
  loadConversations()
})

// 监听选中的会话变化
watch(selectedConversationId, (newId) => {
  if (newId) {
    loadMessages(newId)
  } else {
    messages.value = []
  }
})

// 加载会话列表
const loadConversations = async () => {
  if (!applicationStore.selectedApplication?.id) {
    message.warning(i18n.global.t(v_scope + 'please_select_application'))
    return
  }

  try {
    const response = await chatAgentConversationService.getConversationList({
      service_user_id: 'default_user', // 这里可以根据实际需求设置
      size: 50,
      sort: '-created_at'
    })
    conversations.value = response.conversations
  } catch (error) {
    console.error('加载会话列表失败:', error)
    message.error(i18n.global.t(v_scope + 'load_conversations_failed'))
  }
}

// 加载消息列表
const loadMessages = async (conversationId: string) => {
  try {
    const response = await chatAgentConversationService.getChatMessageList({
      conversation_id: conversationId,
      size: 100,
      sort: 'created_at'
    })
    messages.value = response.messages
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('加载消息列表失败:', error)
    message.error(i18n.global.t(v_scope + 'load_messages_failed'))
  }
}

// 选择会话
const selectConversation = (conversation: ConversationInfoDto) => {
  selectedConversationId.value = conversation.id
}

// 开始新会话
const startNewConversation = () => {
  selectedConversationId.value = ''
  messages.value = []
  inputMessage.value = ''
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) {
    return
  }

  const messageText = inputMessage.value.trim()
  inputMessage.value = ''

  // 添加用户消息到界面
  const userMessage: ChatMessageInfoDto = {
    id: Date.now().toString(),
    application_id: applicationStore.selectedApplication?.id || '',
    conversation_id: selectedConversationId.value || '',
    request_id: Date.now().toString(),
    type: 'message',
    role: 'user',
    content: messageText,
    prompt_token_count: 0,
    completion_token_count: 0,
    total_token_count: 0,
    attachment_info_list: []
  }
  messages.value.push(userMessage)

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  isLoading.value = true

  try {
    const request: ChatUserSendMessageRequest = {
      service_user_id: 'default_user',
      system_prompt: props.systemPrompt,
      user_message: messageText,
      used_mcp_tool_list: [],
      used_internal_tool_list: [],
      conversation_id: selectedConversationId.value || undefined,
      attachments: []
    }

    // 发送消息
    const stream = await chatAgentConversationService.sendMessageStreamable(request)
    
    if (stream) {
      // 处理流式响应
      await handleStreamResponse(stream)
    }

    // 如果是新会话，重新加载会话列表
    if (!selectedConversationId.value) {
      await loadConversations()
      // 选择最新的会话
      if (conversations.value.length > 0) {
        selectedConversationId.value = conversations.value[0].id
      }
    }

  } catch (error) {
    console.error('发送消息失败:', error)
    message.error(i18n.global.t(v_scope + 'send_message_failed'))
  } finally {
    isLoading.value = false
  }
}

// 处理流式响应
const handleStreamResponse = async (stream: ReadableStream<Uint8Array>) => {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let assistantMessage: ChatMessageInfoDto | null = null

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            
            if (data.message_type === 'answer_delta') {
              // 流式内容
              if (!assistantMessage) {
                assistantMessage = {
                  id: Date.now().toString(),
                  application_id: applicationStore.selectedApplication?.id || '',
                  conversation_id: selectedConversationId.value || '',
                  request_id: data.request_id,
                  type: 'message',
                  role: 'assistant',
                  content: '',
                  prompt_token_count: 0,
                  completion_token_count: 0,
                  total_token_count: 0,
                  attachment_info_list: []
                }
                messages.value.push(assistantMessage)
              }
              assistantMessage.content += data.content
              
              // 滚动到底部
              nextTick(() => {
                scrollToBottom()
              })
            } else if (data.message_type === 'answer') {
              // 完整答案
              if (assistantMessage) {
                assistantMessage.content = data.content
              }
            }
          } catch (e) {
            console.warn('解析流式数据失败:', e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 清空会话
const clearConversation = () => {
  selectedConversationId.value = ''
  messages.value = []
  inputMessage.value = ''
}

// 重命名会话
const renameConversation = (conversation: ConversationInfoDto) => {
  conversationToRename.value = conversation
  newConversationTitle.value = conversation.title
  renameModalVisible.value = true
}

// 确认重命名
const confirmRename = async () => {
  if (!conversationToRename.value || !newConversationTitle.value.trim()) {
    return
  }

  renaming.value = true
  try {
    await chatAgentConversationService.renameConversationTitle(
      conversationToRename.value.id,
      newConversationTitle.value.trim(),
      'default_user'
    )
    message.success(i18n.global.t(v_scope + 'rename_success'))
    renameModalVisible.value = false
    await loadConversations()
  } catch (error) {
    console.error('重命名会话失败:', error)
    message.error(i18n.global.t(v_scope + 'rename_failed'))
  } finally {
    renaming.value = false
  }
}

// 删除会话
const deleteConversation = async (conversationId: string) => {
  try {
    await chatAgentConversationService.deleteConversation(conversationId, 'default_user')
    message.success(i18n.global.t(v_scope + 'delete_success'))
    
    // 如果删除的是当前选中的会话，清空选择
    if (selectedConversationId.value === conversationId) {
      selectedConversationId.value = ''
      messages.value = []
    }
    
    await loadConversations()
  } catch (error) {
    console.error('删除会话失败:', error)
    message.error(i18n.global.t(v_scope + 'delete_failed'))
  }
}

// 格式化时间
const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped lang="scss">
.chat-agent-conversation-manage {
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

  .main-content {
    display: flex;
    gap: 24px;
    height: calc(100vh - 200px);

    .conversation-sidebar {
      width: 300px;
      flex-shrink: 0;

      .conversation-list {
        max-height: calc(100vh - 300px);
        overflow-y: auto;

        .conversation-item {
          padding: 12px;
          border: 1px solid #f0f0f0;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;

          &:hover {
            border-color: #1890ff;
            background: #f6ffed;
          }

          &.active {
            border-color: #1890ff;
            background: #e6f7ff;
          }

          .conversation-title {
            font-weight: 500;
            color: #262626;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .conversation-time {
            font-size: 12px;
            color: #8c8c8c;
            margin-bottom: 8px;
          }

          .conversation-actions {
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            transition: opacity 0.3s;

            .ant-btn {
              padding: 2px 4px;
              height: 20px;
              min-width: 20px;
            }
          }

          &:hover .conversation-actions {
            opacity: 1;
          }
        }
      }
    }

    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;

      .chat-card {
        height: 100%;
        display: flex;
        flex-direction: column;

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          max-height: calc(100vh - 400px);

          .message-item {
            display: flex;
            margin-bottom: 16px;
            align-items: flex-start;

            &.user {
              flex-direction: row-reverse;

              .message-content {
                background: #1890ff;
                color: white;
                margin-right: 12px;
                margin-left: 0;
              }
            }

            &.assistant {
              .message-content {
                background: #f6f6f6;
                color: #262626;
                margin-left: 12px;
                margin-right: 0;
              }
            }

            .message-avatar {
              flex-shrink: 0;
            }

            .message-content {
              max-width: 70%;
              padding: 12px 16px;
              border-radius: 12px;
              word-wrap: break-word;

              .message-text {
                line-height: 1.5;
                margin-bottom: 4px;
              }

              .message-time {
                font-size: 12px;
                opacity: 0.7;
              }
            }
          }
        }

        .input-area {
          border-top: 1px solid #f0f0f0;
          padding: 16px;

          .message-input {
            flex: 1;
            margin-right: 8px;
          }

          .send-button {
            height: auto;
            padding: 8px 16px;
          }
        }
      }

      .empty-state {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-agent-conversation-manage {
    padding: 16px;

    .main-content {
      flex-direction: column;
      height: auto;

      .conversation-sidebar {
        width: 100%;
        margin-bottom: 16px;
      }

      .chat-area {
        height: 60vh;
      }
    }
  }
}
</style>
