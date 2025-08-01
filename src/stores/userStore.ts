// 用户状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SystemUser } from '@/types/user'
import userService from '@/services/userService'

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<SystemUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)
  const userFullName = computed(() => currentUser.value?.name || '')

  // 登录
  const login = async (number: string, password: string) => {
    try {
      isLoading.value = true
      const response = await userService.login({ number, password })
      
      // 保存用户信息和token
      currentUser.value = response.user
      token.value = response.token
      
      // 保存到本地存储
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      if (token.value) {
        await userService.logout()
      }
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除状态和本地存储
      currentUser.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      if (!token.value) return
      
      const response = await userService.getCurrentUser()
      currentUser.value = response.user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取失败，清除认证状态
      await logout()
    }
  }

  // 初始化用户状态
  const initializeAuth = async () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      try {
        currentUser.value = JSON.parse(savedUser)
        await fetchCurrentUser()
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        await logout()
      }
    }
  }

  return {
    // 状态
    currentUser,
    token,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    userFullName,
    
    // 方法
    login,
    logout,
    fetchCurrentUser,
    initializeAuth
  }
}) 