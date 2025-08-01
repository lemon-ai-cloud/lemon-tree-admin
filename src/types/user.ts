// 用户相关类型定义

// 系统用户模型
export interface SystemUser {
  id: string
  name: string
  number: string
  email: string
  password?: string
  password_salt?: string
  created_at: string
  updated_at: string
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

// 保存用户请求参数
export interface SaveUserRequest {
  id?: string
  name: string
  number: string
  email: string
  password?: string
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