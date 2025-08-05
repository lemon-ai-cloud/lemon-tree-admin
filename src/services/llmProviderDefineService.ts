import apiClient from './api'
import type {
  LlmProviderDefine,
  SaveLlmProviderDefineRequest,
  QueryLlmProviderDefineRequest,
  LlmProviderDefineListResponse,
  LlmProviderDefineResponse,
  UploadIconResponse
} from '@/dto/llmProviderDefine'

class LlmProviderDefineService {
  // 获取所有大语言模型提供商定义
  async getAllLlmProviderDefines(): Promise<LlmProviderDefineListResponse> {
    const response = await apiClient.get<LlmProviderDefineListResponse>('/llm-provider-defines')
    return response.data
  }

  // 根据ID获取大语言模型提供商定义
  async getLlmProviderDefineByID(id: string): Promise<LlmProviderDefineResponse> {
    const response = await apiClient.get<LlmProviderDefineResponse>(`/llm-provider-defines/${id}`)
    return response.data
  }

  // 保存大语言模型提供商定义（创建或更新）
  async saveLlmProviderDefine(data: SaveLlmProviderDefineRequest): Promise<LlmProviderDefineResponse> {
    const response = await apiClient.post<LlmProviderDefineResponse>('/llm-provider-defines/save', data)
    return response.data
  }

  // 查询大语言模型提供商定义
  async queryLlmProviderDefines(queryData: QueryLlmProviderDefineRequest): Promise<LlmProviderDefineListResponse> {
    const response = await apiClient.post<LlmProviderDefineListResponse>('/llm-provider-defines/query', queryData)
    return response.data
  }

  // 删除大语言模型提供商定义
  async deleteLlmProviderDefine(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/llm-provider-defines/${id}`)
    return response.data
  }

  // 上传图标文件
  async uploadIcon(file: File): Promise<UploadIconResponse> {
    const formData = new FormData()
    formData.append('icon', file)

    const response = await apiClient.post<UploadIconResponse>('/llm-provider-defines/upload-icon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default new LlmProviderDefineService() 