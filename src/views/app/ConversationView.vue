<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">对话管理</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showDialog = true"
          >
            创建对话
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
              label="搜索对话"
              single-line
              hide-details
              variant="outlined"
              density="compact"
            />
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="conversations"
            :search="search"
            :loading="loading"
            class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                color="info"
                variant="text"
                @click="viewConversation(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="deleteConversation(item)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- 查看对话详情对话框 -->
    <v-dialog v-model="showDialog" max-width="800px">
      <v-card>
        <v-card-title>
          对话详情
        </v-card-title>
        
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>对话标题</v-list-item-title>
              <v-list-item-subtitle>{{ selectedConversation?.title }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <v-list-item-title>智能体</v-list-item-title>
              <v-list-item-subtitle>{{ selectedConversation?.agentName }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <v-list-item-title>创建时间</v-list-item-title>
              <v-list-item-subtitle>{{ selectedConversation?.createdAt }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          
          <v-divider class="my-4"></v-divider>
          
          <h3 class="text-h6 mb-3">消息记录</h3>
          <v-timeline>
            <v-timeline-item
              v-for="message in selectedConversation?.messages"
              :key="message.id"
              :dot-color="message.role === 'user' ? 'primary' : 'success'"
              size="small"
            >
              <v-card>
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-avatar size="24" class="mr-2">
                      <v-icon v-if="message.role === 'user'">mdi-account</v-icon>
                      <v-icon v-else>mdi-robot</v-icon>
                    </v-avatar>
                    <span class="text-caption">{{ message.role === 'user' ? '用户' : '智能体' }}</span>
                    <v-spacer></v-spacer>
                    <span class="text-caption">{{ message.createdAt }}</span>
                  </div>
                  <p class="mb-0">{{ message.content }}</p>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="showDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 状态
const conversations = ref([])
const loading = ref(false)
const search = ref('')
const showDialog = ref(false)
const selectedConversation = ref<any>(null)

// 表格头部
const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: '标题', key: 'title', sortable: true },
  { title: '智能体', key: 'agentName', sortable: true },
  { title: '消息数', key: 'messageCount', sortable: true },
  { title: '创建时间', key: 'createdAt', sortable: true },
  { title: '操作', key: 'actions', sortable: false }
]

// 获取对话列表
const fetchConversations = async () => {
  try {
    loading.value = true
    // 这里调用API获取对话列表
    conversations.value = []
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
const deleteConversation = async (conversation: any) => {
  if (confirm(`确定要删除对话 "${conversation.title}" 吗？`)) {
    try {
      // 这里调用API删除对话
      await fetchConversations()
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }
}

onMounted(() => {
  fetchConversations()
})
</script> 