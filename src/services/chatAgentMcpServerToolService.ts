import apiClient from './api'
import type {
  SaveChatAgentMcpServerToolSettingsRequest,
  SaveChatAgentMcpServerToolSettingsResponse,
  GetChatAgentAvailableMcpServerToolsResponse
} from '@/dto/chatAgentMcpServerTool'

class ChatAgentMcpServerToolService {
  /**
   * 保存聊天智能体的MCP工具设置
   * @param chatAgentId 聊天智能体ID
   * @param request 保存工具设置请求
   * @returns 保存结果
   */
  async saveChatAgentMcpServerToolSettings(
    chatAgentId: string,
    request: SaveChatAgentMcpServerToolSettingsRequest
  ): Promise<SaveChatAgentMcpServerToolSettingsResponse> {
    const response = await apiClient.put<SaveChatAgentMcpServerToolSettingsResponse>(
      `/chat-agents/${chatAgentId}/mcp-tools`,
      request
    )
    return response.data
  }

  /**
   * 获取聊天智能体可用的MCP工具列表
   * @param chatAgentId 聊天智能体ID
   * @returns 可用工具列表
   */
  async getChatAgentAvailableMcpServerTools(
    chatAgentId: string
  ): Promise<GetChatAgentAvailableMcpServerToolsResponse> {
    const response = await apiClient.get<GetChatAgentAvailableMcpServerToolsResponse>(
      `/chat-agents/${chatAgentId}/mcp-tools`
    )
    return response.data
  }
}

export default new ChatAgentMcpServerToolService()
