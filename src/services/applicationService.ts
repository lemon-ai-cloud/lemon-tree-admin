// 应用相关API服务

import apiClient from './api'
import type {
  ApplicationListResponse,
  ApplicationDetailResponse,
  SaveApplicationRequest,
  Application
} from '@/types/application'

export class ApplicationService {
  // 获取所有应用
  async getAllApplications(): Promise<ApplicationListResponse> {
    const response = await apiClient.get<ApplicationListResponse>('/applications')
    return response.data
  }

  // 根据ID获取应用详情
  async getApplicationById(id: string): Promise<ApplicationDetailResponse> {
    const response = await apiClient.get<ApplicationDetailResponse>(`/applications/${id}`)
    return response.data
  }

  // 保存应用（创建或更新）
  async saveApplication(appData: SaveApplicationRequest): Promise<{ message: string; application: Application }> {
    const response = await apiClient.post<{ message: string; application: Application }>('/applications/save', appData)
    return response.data
  }

  // 删除应用
  async deleteApplication(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/applications/${id}`)
    return response.data
  }
}

export default new ApplicationService() 