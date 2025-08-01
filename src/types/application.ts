// 应用相关类型定义

// 应用模型
export interface Application {
  id: string
  name: string
  description: string
  status?: 'active' | 'inactive'
  version?: string
  created_at: string
  updated_at: string
}

// 应用列表响应
export interface ApplicationListResponse {
  applications: Application[]
}

// 应用详情响应
export interface ApplicationDetailResponse {
  application: Application
}

// 保存应用请求参数
export interface SaveApplicationRequest {
  id?: string
  name: string
  description: string
  status?: 'active' | 'inactive'
  version?: string
} 