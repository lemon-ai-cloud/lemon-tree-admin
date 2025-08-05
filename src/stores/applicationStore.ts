// 应用状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Application, SaveApplicationRequest } from '@/dto/application.ts'
import applicationService from '@/services/applicationService'

export const useApplicationStore = defineStore('application', () => {
  // 状态
  const applications = ref<Application[]>([])
  const selectedApplication = ref<Application | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)

  // 计算属性
  const hasApplications = computed(() => applications.value.length > 0)
  const selectedAppName = computed(() => selectedApplication.value?.name || '选择应用')

  // 获取所有应用
  const fetchApplications = async () => {
    try {
      isLoading.value = true
      const response = await applicationService.getAllApplications()
      applications.value = response.applications
      
      // 如果当前选中的应用不在列表中，需要重新选择
      if (selectedApplication.value) {
        const foundApp = applications.value.find(app => app.id === selectedApplication.value?.id)
        if (!foundApp) {
          // 当前选中的应用已被删除，选择第一个应用或清空选择
          if (applications.value.length > 0) {
            selectApplication(applications.value[0])
          } else {
            selectApplication(null)
          }
        }
      }
    } catch (error) {
      console.error('获取应用列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 选择应用
  const selectApplication = (application: Application | null) => {
    selectedApplication.value = application
    // 保存到本地存储
    if (application) {
      localStorage.setItem('selectedApplication', JSON.stringify(application))
    } else {
      localStorage.removeItem('selectedApplication')
    }
  }

  // 保存应用（创建或更新）
  const saveApplication = async (appData: SaveApplicationRequest) => {
    try {
      isSaving.value = true
      const response = await applicationService.saveApplication(appData)
      const savedApp = response.application
      
      // 更新应用列表
      const existingIndex = applications.value.findIndex(app => app.id === savedApp.id)
      if (existingIndex >= 0) {
        // 更新现有应用
        applications.value[existingIndex] = savedApp
        // 如果更新的是当前选中的应用，也要更新选中状态
        if (selectedApplication.value?.id === savedApp.id) {
          selectApplication(savedApp)
        }
      } else {
        // 添加新应用
        applications.value.push(savedApp)
        // 如果是第一个应用，自动选择
        if (applications.value.length === 1) {
          selectApplication(savedApp)
        }
      }
      
      return savedApp
    } catch (error) {
      console.error('保存应用失败:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  // 删除应用
  const deleteApplication = async (id: string) => {
    try {
      isDeleting.value = true
      await applicationService.deleteApplication(id)
      
      // 从列表中移除应用
      const deletedIndex = applications.value.findIndex(app => app.id === id)
      if (deletedIndex >= 0) {
        applications.value.splice(deletedIndex, 1)
      }
      
      // 如果删除的是当前选中的应用，需要重新选择
      if (selectedApplication.value?.id === id) {
        if (applications.value.length > 0) {
          // 选择第一个应用
          selectApplication(applications.value[0])
        } else {
          // 没有应用了，清空选择
          selectApplication(null)
        }
      }
    } catch (error) {
      console.error('删除应用失败:', error)
      throw error
    } finally {
      isDeleting.value = false
    }
  }

  // 查询应用
  const queryApplications = async (queryData: { name?: string; description?: string }) => {
    try {
      isLoading.value = true
      const response = await applicationService.queryApplications(queryData)
      applications.value = response.applications
    } catch (error) {
      console.error('查询应用失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 初始化应用状态
  const initializeApplications = async () => {
    try {
      await fetchApplications()
      
      // 恢复上次选择的应用
      const savedApp = localStorage.getItem('selectedApplication')
      if (savedApp) {
        const app = JSON.parse(savedApp)
        const foundApp = applications.value.find(a => a.id === app.id)
        if (foundApp) {
          selectApplication(foundApp)
        }
      }
    } catch (error) {
      console.error('初始化应用状态失败:', error)
    }
  }

  return {
    // 状态
    applications,
    selectedApplication,
    isLoading,
    isSaving,
    isDeleting,
    
    // 计算属性
    hasApplications,
    selectedAppName,
    
    // 方法
    fetchApplications,
    selectApplication,
    saveApplication,
    deleteApplication,
    queryApplications,
    initializeApplications
  }
}) 