<template>
  <div class="conversation-management">
    <div class="page-header">
      <div class="header-content">
        <a-typography-title :level="2" class="page-title">
          {{ $v_translate('page_title') }}
        </a-typography-title>
        <a-button
          type="primary"
          @click="showDialog = true"
          class="create-btn"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $v_translate('create_conversation') }}
        </a-button>
      </div>
    </div>

    <div class="content-area">
      <a-card>
        <template #title>
          <a-input
            v-model:value="search"
            :placeholder="$v_translate('search_conversation')"
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
          :data-source="filteredConversations"
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
                  @click="viewConversation(record)"
                  class="action-btn"
                >
                  <template #icon>
                    <EyeOutlined />
                  </template>
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  danger
                  @click="deleteConversation(record)"
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

    <!-- 查看对话详情对话框 -->
    <a-modal
      v-model:open="showDialog"
      :title="$v_translate('conversation_detail')"
      :footer="null"
      width="800px"
    >
      <div v-if="selectedConversation" class="conversation-detail">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item :label="$v_translate('conversation_title')">
            {{ selectedConversation.title }}
          </a-descriptions-item>
          <a-descriptions-item :label="$v_translate('agent')">
            {{ selectedConversation.agentName }}
          </a-descriptions-item>
          <a-descriptions-item :label="$v_translate('created_time')">
            {{ selectedConversation.createdAt }}
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider />
        
        <a-typography-title :level="4" class="messages-title">
          {{ $v_translate('message_records') }}
        </a-typography-title>
        
        <div class="messages-container">
          <a-timeline>
            <a-timeline-item
              v-for="message in selectedConversation.messages"
              :key="message.id"
              :color="message.role === 'user' ? '#1890ff' : '#52c41a'"
            >
              <a-card size="small" class="message-card">
                <div class="message-header">
                  <a-avatar size="small" class="message-avatar">
                    <template #icon>
                      <UserOutlined v-if="message.role === 'user'" />
                      <RobotOutlined v-else />
                    </template>
                  </a-avatar>
                  <span class="message-role">
                    {{ message.role === 'user' ? $v_translate('user') : $v_translate('agent_role') }}
                  </span>
                  <span class="message-time">
                    {{ message.timestamp }}
                  </span>
                </div>
                <div class="message-content">
                  {{ message.content }}
                </div>
              </a-card>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>

    <!-- 删除确认对话框 -->
    <a-modal
      v-model:open="showDeleteDialog"
      :title="$v_translate('confirm_delete')"
      @ok="confirmDelete"
      :confirm-loading="deleting"
      :ok-text="$v_translate('delete')"
      :cancel-text="$v_translate('cancel')"
      ok-type="danger"
    >
      <div class="delete-content">
        <ExclamationCircleOutlined class="delete-icon" />
        <p>{{ $v_translate('delete_conversation_confirm', { title: conversationToDelete?.title }) }}</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  RobotOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import i18n from '@/i18n.ts'

const v_scope = 'views.app.conversation_view.'
defineExpose({
  v_scope
})

// 状态
const loading = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const conversations = ref<any[]>([])
const selectedConversation = ref<any>(null)
const conversationToDelete = ref<any>(null)
const search = ref('')

// 表格列定义
const columns = computed(() => [
  {
    title: i18n.global.t(v_scope + 'conversation_title'),
    dataIndex: 'title',
    key: 'title',
    width: 250
  },
  {
    title: i18n.global.t(v_scope + 'agent'),
    dataIndex: 'agentName',
    key: 'agentName',
    width: 150
  },
  {
    title: i18n.global.t(v_scope + 'message_count'),
    dataIndex: 'messageCount',
    key: 'messageCount',
    width: 100
  },
  {
    title: i18n.global.t(v_scope + 'created_time'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: i18n.global.t(v_scope + 'actions'),
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
])

// 过滤后的对话列表
const filteredConversations = computed(() => {
  if (!search.value) return conversations.value
  
  const searchLower = search.value.toLowerCase()
  return conversations.value.filter(conversation => 
    conversation.title.toLowerCase().includes(searchLower) ||
    conversation.agentName.toLowerCase().includes(searchLower)
  )
})

// 获取对话列表
const fetchConversations = async () => {
  try {
    loading.value = true
    // 这里需要调用实际的API
    // const response = await conversationService.getAllConversations()
    // conversations.value = response.conversations
    
    // 模拟数据
    conversations.value = [
      {
        id: '1',
        title: '客服咨询对话',
        agentName: '客服助手',
        messageCount: 5,
        createdAt: '2024-01-01 10:00:00',
        messages: [
          {
            id: '1',
            role: 'user',
            content: '你好，我想咨询一下产品信息',
            timestamp: '10:00:00'
          },
          {
            id: '2',
            role: 'assistant',
            content: '您好！很高兴为您服务，请问您想了解哪个产品呢？',
            timestamp: '10:00:05'
          }
        ]
      }
    ]
  } catch (error) {
    console.error('获取对话列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查看对话详情
const viewConversation = (conversation: any) => {
  selectedConversation.value = conversation
  showDialog.value = true
}

// 删除对话
const deleteConversation = (conversation: any) => {
  conversationToDelete.value = conversation
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!conversationToDelete.value) return
  
  try {
    deleting.value = true
    // 这里需要调用实际的删除API
    // await conversationService.deleteConversation(conversationToDelete.value.id)
    await fetchConversations()
    showDeleteDialog.value = false
    conversationToDelete.value = null
  } catch (error) {
    console.error('删除对话失败:', error)
  } finally {
    deleting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchConversations()
})
</script>

<style scoped lang="scss">
.conversation-management {
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

.conversation-detail {
  .messages-title {
    margin-bottom: 16px !important;
  }
  
  .messages-container {
    max-height: 400px;
    overflow-y: auto;
  }
}

.message-card {
  margin-bottom: 8px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.message-avatar {
  background: #F0F0F0;
}

.message-role {
  font-weight: 500;
  color: #333333;
}

.message-time {
  font-size: 12px;
  color: #999999;
  margin-left: auto;
}

.message-content {
  color: #333333;
  line-height: 1.5;
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
  .conversation-management {
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