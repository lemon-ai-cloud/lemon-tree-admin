import apiClient from './api'
import type { 
  ApplicationLlmDto, 
  SaveApplicationLlmRequest, 
  UpdateEnabledStatusRequest,
  ApplicationLlmListResponse 
} from '@/dto/applicationLlm'

class ApplicationLlmService {
  /**
   * 保存应用模型信息（创建或更新）
   */
  async saveApplicationLlm(request: SaveApplicationLlmRequest): Promise<{ application_llm: ApplicationLlmDto }> {
    const response = await apiClient.post('/application-llms/save', request)
    return response.data
  }

  /**
   * 更新模型启用状态
   */
  async updateEnabledStatus(id: string, enabled: boolean): Promise<{ message: string }> {
    const request: UpdateEnabledStatusRequest = { id, enabled }
    const response = await apiClient.put(`/application-llms/${id}/enabled`, request)
    return response.data
  }

  /**
   * 根据提供商ID获取模型列表
   */
  async getModelsByProviderID(providerId: string): Promise<ApplicationLlmListResponse> {
    const response = await apiClient.get(`/application-llms/provider/${providerId}`)
    return response.data
  }

  /**
   * 根据应用ID获取模型列表
   */
  async getModelsByApplicationID(applicationId: string): Promise<ApplicationLlmListResponse> {
    const response = await apiClient.get(`/application-llms/application/${applicationId}`)
    return response.data
  }
}

export default new ApplicationLlmService()
