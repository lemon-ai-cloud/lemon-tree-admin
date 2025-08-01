<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">欢迎使用 Lemon Tree Admin</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">应用总数</div>
            <div class="text-h4 text-primary">{{ stats.applications }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">用户总数</div>
            <div class="text-h4 text-success">{{ stats.users }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">在线用户</div>
            <div class="text-h4 text-info">{{ stats.onlineUsers }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">系统状态</div>
            <div class="text-h4 text-success">正常</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>快速操作</v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              class="ma-2"
              @click="$router.push('/applications')"
            >
              创建应用
            </v-btn>
            <v-btn
              color="success"
              prepend-icon="mdi-account-plus"
              class="ma-2"
              @click="$router.push('/users')"
            >
              添加用户
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>系统信息</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>当前用户</v-list-item-title>
                <v-list-item-subtitle>{{ userStore.userFullName }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>登录时间</v-list-item-title>
                <v-list-item-subtitle>{{ loginTime }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

// 统计数据
const stats = ref({
  applications: 0,
  users: 0,
  onlineUsers: 0
})

// 登录时间
const loginTime = ref(new Date().toLocaleString())

// 获取统计数据
const fetchStats = async () => {
  // 这里可以调用API获取真实的统计数据
  stats.value = {
    applications: 5,
    users: 12,
    onlineUsers: 3
  }
}

onMounted(() => {
  fetchStats()
})
</script> 