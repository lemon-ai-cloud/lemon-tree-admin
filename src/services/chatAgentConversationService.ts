import apiClient from './api'
import type { 
  GetConversationListRequest,
  GetConversationListResponse,
  GetChatMessageListRequest,
  GetChatMessageListResponse,
  ChatUserSendMessageRequest,
  DeleteConversationResponse,
  RenameConversationResponse,
  UploadAttachmentResponse
} from '@/dto/chatAgentConversation'

class ChatAgentConversationService {
  /**
   * 获取会话列表
   */
  async getConversationList(request: GetConversationListRequest): Promise<GetConversationListResponse> {
    const response = await apiClient.get('/chat-agent-conversations/conversation-list', {
      params: request
    })
    return response.data
  }

  /**
   * 获取聊天消息列表
   */
  async getChatMessageList(request: GetChatMessageListRequest): Promise<GetChatMessageListResponse> {
    const response = await apiClient.get('/chat-agent-conversations/message-list', {
      params: request
    })
    return response.data
  }

  /**
   * 发送消息（非流式）
   */
  async sendMessage(request: ChatUserSendMessageRequest): Promise<ReadableStream<Uint8Array> | null> {
    const response = await apiClient.post('/chat-agent-conversations/send-message', request, {
      responseType: 'stream'
    })
    return response.data
  }

  /**
   * 发送消息（流式）
   */
  async sendMessageStreamable(request: ChatUserSendMessageRequest): Promise<ReadableStream<Uint8Array> | null> {
    const response = await apiClient.post('/chat-agent-conversations/send-message-streamable', request, {
      responseType: 'stream'
    })
    return response.data
  }

  /**
   * 发送预制答案（非流式）
   */
  async sendMessagePredefined(request: ChatUserSendMessageRequest): Promise<ReadableStream<Uint8Array> | null> {
    const response = await apiClient.post('/chat-agent-conversations/send-message-predefined', request, {
      responseType: 'stream'
    })
    return response.data
  }

  /**
   * 发送预制答案（流式）
   */
  async sendMessagePredefinedStreamable(request: ChatUserSendMessageRequest): Promise<ReadableStream<Uint8Array> | null> {
    const response = await apiClient.post('/chat-agent-conversations/send-message-predefined-streamable', request, {
      responseType: 'stream'
    })
    return response.data
  }

  /**
   * 上传附件
   */
  async uploadAttachment(file: File): Promise<UploadAttachmentResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/chat-agent-conversations/upload-attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * 删除会话
   */
  async deleteConversation(conversationId: string, serviceUserId: string): Promise<DeleteConversationResponse> {
    const response = await apiClient.delete('/chat-agent-conversations/conversation', {
      params: {
        conversation_id: conversationId,
        service_user_id: serviceUserId
      }
    })
    return response.data
  }

  /**
   * 重命名会话
   */
  async renameConversationTitle(conversationId: string, newTitle: string, serviceUserId: string): Promise<RenameConversationResponse> {
    const response = await apiClient.put('/chat-agent-conversations/conversation-title', null, {
      params: {
        conversation_id: conversationId,
        new_title: newTitle,
        service_user_id: serviceUserId
      }
    })
    return response.data
  }
}

export default new ChatAgentConversationService()
