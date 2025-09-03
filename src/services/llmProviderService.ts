import apiClient from './api'
import type {
  LlmProvider,
  SaveLlmProviderRequest,
  QueryLlmProviderRequest,
  LlmProviderListResponse,
  LlmProviderResponse,
  UploadIconResponse
} from '@/dto/llmProvider'

class LlmProviderService {
  // 获取所有大语言模型提供商
  async getAllLlmProviders(): Promise<LlmProviderListResponse> {
    const response = await apiClient.get<LlmProviderListResponse>('/llm-providers')
    return response.data
  }

  // 根据ID获取大语言模型提供商
  async getLlmProviderByID(id: string): Promise<LlmProviderResponse> {
    const response = await apiClient.get<LlmProviderResponse>(`/llm-providers/${id}`)
    return response.data
  }

  // 保存大语言模型提供商（创建或更新）
  async saveLlmProvider(data: SaveLlmProviderRequest): Promise<LlmProviderResponse> {
    const response = await apiClient.post<LlmProviderResponse>('/llm-providers/save', data)
    return response.data
  }

  // 查询大语言模型提供商
  async queryLlmProviders(queryData: QueryLlmProviderRequest): Promise<LlmProviderListResponse> {
    const response = await apiClient.post<LlmProviderListResponse>('/llm-providers/query', queryData)
    return response.data
  }

  // 删除大语言模型提供商
  async deleteLlmProvider(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/llm-providers/${id}`)
    return response.data
  }

  // 根据应用ID获取大语言模型提供商列表
  async getLlmProvidersByApplicationID(applicationID: string): Promise<LlmProviderListResponse> {
    const response = await apiClient.get<LlmProviderListResponse>(`/llm-providers/application/${applicationID}`)
    return response.data
  }

  // 上传图标文件
  async uploadIcon(file: File): Promise<UploadIconResponse> {
    const formData = new FormData()
    formData.append('icon', file)

    const response = await apiClient.post<UploadIconResponse>('/llm-providers/upload-icon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default new LlmProviderService()
