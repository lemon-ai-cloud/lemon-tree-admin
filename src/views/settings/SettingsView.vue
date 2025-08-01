<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">系统设置</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>系统信息</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>系统版本</v-list-item-title>
                <v-list-item-subtitle>v1.0.0</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>数据库状态</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip color="success" size="small">正常</v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>服务器状态</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip color="success" size="small">运行中</v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>用户统计</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>总用户数</v-list-item-title>
                <v-list-item-subtitle>{{ stats.totalUsers }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>总应用数</v-list-item-title>
                <v-list-item-subtitle>{{ stats.totalApplications }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>总智能体数</v-list-item-title>
                <v-list-item-subtitle>{{ stats.totalAgents }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>系统维护</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  block
                  prepend-icon="mdi-database"
                  @click="cleanupDatabase"
                  :loading="cleaning"
                >
                  清理过期数据
                </v-btn>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-btn
                  color="warning"
                  block
                  prepend-icon="mdi-refresh"
                  @click="refreshCache"
                  :loading="refreshing"
                >
                  刷新缓存
                </v-btn>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-btn
                  color="info"
                  block
                  prepend-icon="mdi-download"
                  @click="exportData"
                  :loading="exporting"
                >
                  导出数据
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 状态
const cleaning = ref(false)
const refreshing = ref(false)
const exporting = ref(false)

// 统计数据
const stats = ref({
  totalUsers: 0,
  totalApplications: 0,
  totalAgents: 0
})

// 清理数据库
const cleanupDatabase = async () => {
  try {
    cleaning.value = true
    // 这里调用API清理过期数据
    console.log('清理过期数据')
  } catch (error) {
    console.error('清理数据库失败:', error)
  } finally {
    cleaning.value = false
  }
}

// 刷新缓存
const refreshCache = async () => {
  try {
    refreshing.value = true
    // 这里调用API刷新缓存
    console.log('刷新缓存')
  } catch (error) {
    console.error('刷新缓存失败:', error)
  } finally {
    refreshing.value = false
  }
}

// 导出数据
const exportData = async () => {
  try {
    exporting.value = true
    // 这里调用API导出数据
    console.log('导出数据')
  } catch (error) {
    console.error('导出数据失败:', error)
  } finally {
    exporting.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    // 这里调用API获取统计数据
    stats.value = {
      totalUsers: 12,
      totalApplications: 5,
      totalAgents: 8
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script> 