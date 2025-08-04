// 应用相关类型定义

import type { BaseModelDto } from './base'

// 应用DTO（与后台ApplicationDto对应）
export interface Application extends BaseModelDto {
  name: string
  description: string
}

// 应用列表响应
export interface ApplicationListResponse {
  applications: Application[]
}

// 应用详情响应
export interface ApplicationDetailResponse {
  application: Application
}

// 保存应用请求参数（与后台ApplicationSaveDto对应）
export interface SaveApplicationRequest {
  id?: string // 应用ID（更新时提供）
  name: string
  description: string
} 