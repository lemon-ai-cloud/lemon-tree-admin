import apiClient from './api'
import type { 
  ApplicationStorageConfigDto, 
  SaveApplicationStorageConfigRequest, 
  SingleApplicationStorageConfigResponse
} from '@/dto/applicationStorageConfig'

class ApplicationStorageConfigService {
  /**
   * 保存应用存储配置
   */
  async saveApplicationStorageConfig(request: SaveApplicationStorageConfigRequest): Promise<SingleApplicationStorageConfigResponse> {
    const response = await apiClient.post('/application-storage-configs/save', request)
    return response.data
  }

  /**
   * 根据应用ID获取存储配置
   */
  async getApplicationStorageConfigByApplicationID(applicationId: string): Promise<SingleApplicationStorageConfigResponse> {
    const response = await apiClient.get(`/application-storage-configs/application/${applicationId}`)
    return response.data
  }
}

export default new ApplicationStorageConfigService()
