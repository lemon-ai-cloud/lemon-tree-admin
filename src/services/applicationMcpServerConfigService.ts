import apiClient from './api'
import type { 
  ApplicationMcpServerConfigDto, 
  SaveApplicationMcpServerConfigRequest, 
  ApplicationMcpServerConfigListResponse,
  McpToolsResponse
} from '@/dto/applicationMcpServerConfig'

class ApplicationMcpServerConfigService {
  /**
   * 保存应用MCP配置信息（创建或更新）
   */
  async saveApplicationMcpServerConfig(request: SaveApplicationMcpServerConfigRequest): Promise<{ application_mcp_server_config: ApplicationMcpServerConfigDto }> {
    const response = await apiClient.post('/application-mcp-server-configs/save', request)
    return response.data
  }

  /**
   * 删除MCP配置
   */
  async deleteApplicationMcpServerConfig(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/application-mcp-server-configs/${id}`)
    return response.data
  }

  /**
   * 根据应用ID获取MCP配置列表
   */
  async getMcpServerConfigsByApplicationID(applicationId: string): Promise<ApplicationMcpServerConfigListResponse> {
    const response = await apiClient.get(`/application-mcp-server-configs/application/${applicationId}`)
    return response.data
  }

  /**
   * 获取MCP服务器的所有工具
   */
  async getMcpServerTools(configId: string): Promise<McpToolsResponse> {
    const response = await apiClient.get(`/application-mcp-server-configs/${configId}/tools`)
    return response.data
  }

  /**
   * 同步MCP服务器的工具列表
   */
  async syncMcpServerTools(configId: string): Promise<McpToolsResponse & { message: string }> {
    const response = await apiClient.post(`/application-mcp-server-configs/${configId}/sync-tools`)
    return response.data
  }
}

export default new ApplicationMcpServerConfigService()
