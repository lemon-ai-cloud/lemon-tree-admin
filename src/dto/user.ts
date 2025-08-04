// 用户相关类型定义

import type { BaseModelDto } from './base'

// 系统用户DTO（与后台SystemUserDto对应）
export interface SystemUser extends BaseModelDto {
  name: string
  number: string
  email: string
  // 注意：密码相关字段不包含在DTO中，避免安全风险
}

// 登录请求参数
export interface LoginRequest {
  number: string
  password: string
}

// 登录响应
export interface LoginResponse {
  message: string
  user: SystemUser
  token: string
}

// 保存用户请求参数（与后台SystemUserSaveDto对应）
export interface SaveUserRequest {
  id?: string // 用户ID（更新时提供）
  name: string
  number: string
  email: string
  password: string
}

// 用户列表响应
export interface UserListResponse {
  users: SystemUser[]
}

// 用户详情响应
export interface UserDetailResponse {
  user: SystemUser
}

// 当前用户响应
export interface CurrentUserResponse {
  user: SystemUser
}

// 通用响应格式
export interface ApiResponse<T = any> {
  message?: string
  data?: T
  error?: string
} 