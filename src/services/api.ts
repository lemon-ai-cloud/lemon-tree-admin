// API 基础配置和HTTP客户端

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://manage.vrtalk.online:12833/api/v1'
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:12833/api/v1'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

	// 请求拦截器 - 添加认证Token
	apiClient.interceptors.request.use(
		(config) => {
			const token = localStorage.getItem('token')
			if (token && config.headers) {
				config.headers.Authorization = `Bearer ${token}`
			}
			return config
		},
		(error) => {
			return Promise.reject(error)
		}
	)

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error.config?.url ?? '')
      // 登录失败也常返回 401，此时不应整页跳转，否则登录页来不及展示错误信息
      const isLoginRequest = url.includes('/users/login')
      if (!isLoginRequest) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient 