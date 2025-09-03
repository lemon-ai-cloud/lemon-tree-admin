// LlmProvider 相关的 DTO 类型定义

// 大语言模型提供商基础信息
export interface LlmProvider {
  id: string
  name: string
  description: string
  type: string
  icon_url: string
  application_id: string
  api_url: string
  api_key: string
  created_at: string
  updated_at: string
}

// 保存大语言模型提供商的请求参数
export interface SaveLlmProviderRequest {
  id?: string // 更新时必填
  name: string
  description: string
  type: string
  icon_url: string
  application_id: string
  api_url: string
  api_key: string
}

// 查询大语言模型提供商的条件参数
export interface QueryLlmProviderRequest {
  id?: string
  name?: string
  description?: string
  type?: string
  icon_url?: string
  application_id?: string
  api_url?: string
  api_key?: string
}

// 大语言模型提供商列表响应
export interface LlmProviderListResponse {
  llm_providers: LlmProvider[]
}

// 单个大语言模型提供商响应
export interface LlmProviderResponse {
  llm_provider: LlmProvider
}

// 上传图标响应
export interface UploadIconResponse {
  message: string
  data: {
    file_name: string
    file_path: string
    file_size: number
    mime_type: string
  }
}
