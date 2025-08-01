// 用户相关API服务

import apiClient from './api'
import type {
  LoginRequest,
  LoginResponse,
  SaveUserRequest,
  UserListResponse,
  UserDetailResponse,
  CurrentUserResponse,
  SystemUser
} from '@/types/user'

export class UserService {
  // 用户登录
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/users/login', credentials)
    return response.data
  }

  // 用户登出
  async logout(): Promise<void> {
    await apiClient.post('/users/logout')
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>('/users/current')
    return response.data
  }

  // 获取所有用户
  async getAllUsers(): Promise<UserListResponse> {
    const response = await apiClient.get<UserListResponse>('/users')
    return response.data
  }

  // 根据ID获取用户详情
  async getUserById(id: string): Promise<UserDetailResponse> {
    const response = await apiClient.get<UserDetailResponse>(`/users/${id}`)
    return response.data
  }

  // 保存用户（创建或更新）
  async saveUser(userData: SaveUserRequest): Promise<{ message: string; user: SystemUser }> {
    const response = await apiClient.post<{ message: string; user: SystemUser }>('/users/save', userData)
    return response.data
  }
}

export default new UserService() 