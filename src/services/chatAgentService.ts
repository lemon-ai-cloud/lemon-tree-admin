import apiClient from './api'
import type { 
  ChatAgentDto, 
  SaveChatAgentRequest, 
  ChatAgentListResponse,
  SingleChatAgentResponse
} from '@/dto/chatAgent'

class ChatAgentService {
  /**
   * 保存智能体信息（创建或更新）
   */
  async saveChatAgent(request: SaveChatAgentRequest): Promise<SingleChatAgentResponse> {
    const response = await apiClient.post('/chat-agents/save', request)
    return response.data
  }

  /**
   * 删除智能体
   */
  async deleteChatAgent(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/chat-agents/${id}`)
    return response.data
  }

  /**
   * 根据应用ID获取智能体列表（分页）
   */
  async getChatAgentsByApplicationID(applicationId: string, page: number = 1, pageSize: number = 10): Promise<ChatAgentListResponse> {
    const response = await apiClient.get(`/chat-agents/application/${applicationId}`, {
      params: { page, page_size: pageSize }
    })
    return response.data
  }

  /**
   * 上传智能体头像
   */
  async uploadAvatar(file: File): Promise<{ data: { file_path: string } }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await apiClient.post('/chat-agents/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default new ChatAgentService()
