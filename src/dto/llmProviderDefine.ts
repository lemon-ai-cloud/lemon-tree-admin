import type { BaseModelDto } from './base'

// LlmProviderDefine DTO
export interface LlmProviderDefine extends BaseModelDto {
  name: string
  description: string
  icon_url: string
  type: string
}

// 保存 LlmProviderDefine 的请求 DTO
export interface SaveLlmProviderDefineRequest {
  id?: string
  name: string
  description: string
  icon_url: string
  type: string
}

// 查询 LlmProviderDefine 的请求 DTO
export interface QueryLlmProviderDefineRequest {
  name?: string
  description?: string
  type?: string
}

// LlmProviderDefine 列表响应
export interface LlmProviderDefineListResponse {
  llm_provider_defines: LlmProviderDefine[]
}

// 单个 LlmProviderDefine 响应
export interface LlmProviderDefineResponse {
  llm_provider_define: LlmProviderDefine
}

// 图片上传响应
export interface UploadIconResponse {
  message: string
  data: {
    file_name: string
    file_path: string
    file_size: number
    mime_type: string
  }
} 