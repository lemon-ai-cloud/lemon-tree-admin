<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">应用设置</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>基本信息</v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field
                v-model="form.name"
                label="应用名称"
                :rules="[rules.required]"
                variant="outlined"
                required
              />
              
              <v-textarea
                v-model="form.description"
                label="应用描述"
                :rules="[rules.required]"
                variant="outlined"
                required
              />
            </v-form>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="saving"
              @click="saveSettings"
            >
              保存设置
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>存储配置</v-card-title>
          <v-card-text>
            <v-select
              v-model="storageConfig.type"
              label="存储类型"
              :items="storageTypes"
              variant="outlined"
            />
            
            <v-text-field
              v-if="storageConfig.type === 'file_system'"
              v-model="storageConfig.rootPath"
              label="根路径"
              variant="outlined"
            />
            
            <v-text-field
              v-if="storageConfig.type === 's3'"
              v-model="storageConfig.endpoint"
              label="S3 Endpoint"
              variant="outlined"
            />
            
            <v-text-field
              v-if="storageConfig.type === 's3'"
              v-model="storageConfig.bucketName"
              label="Bucket名称"
              variant="outlined"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>网络搜索配置</v-card-title>
          <v-card-text>
            <v-select
              v-model="netSearchConfig.type"
              label="搜索类型"
              :items="searchTypes"
              variant="outlined"
            />
            
            <v-text-field
              v-model="netSearchConfig.apiUrl"
              label="API URL"
              variant="outlined"
            />
            
            <v-text-field
              v-model="netSearchConfig.apiKey"
              label="API Key"
              type="password"
              variant="outlined"
            />
            
            <v-text-field
              v-model.number="netSearchConfig.searchResultCount"
              label="搜索结果数量"
              type="number"
              variant="outlined"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>MCP服务器配置</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="mcpConfig.name"
              label="服务器名称"
              variant="outlined"
            />
            
            <v-text-field
              v-model="mcpConfig.version"
              label="版本"
              variant="outlined"
            />
            
            <v-select
              v-model="mcpConfig.connectType"
              label="连接方式"
              :items="connectTypes"
              variant="outlined"
            />
            
            <v-text-field
              v-if="mcpConfig.connectType === 'sse' || mcpConfig.connectType === 'streamable-http'"
              v-model="mcpConfig.serverUrl"
              label="服务器URL"
              variant="outlined"
            />
            
            <v-text-field
              v-if="mcpConfig.connectType === 'stdio'"
              v-model="mcpConfig.serverCommand"
              label="服务器命令"
              variant="outlined"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// 状态
const saving = ref(false)

// 表单数据
const form = reactive({
  name: '',
  description: ''
})

// 存储配置
const storageConfig = reactive({
  type: 'file_system',
  rootPath: '',
  endpoint: '',
  bucketName: ''
})

// 网络搜索配置
const netSearchConfig = reactive({
  type: 'bing',
  apiUrl: '',
  apiKey: '',
  searchResultCount: 5
})

// MCP配置
const mcpConfig = reactive({
  name: '',
  version: '',
  connectType: 'sse',
  serverUrl: '',
  serverCommand: ''
})

// 表单验证规则
const rules = {
  required: (value: string) => !!value || '此字段为必填项'
}

// 选项
const storageTypes = [
  { title: '文件系统', value: 'file_system' },
  { title: 'S3存储', value: 's3' }
]

const searchTypes = [
  { title: 'Bing搜索', value: 'bing' },
  { title: 'Google搜索', value: 'google' }
]

const connectTypes = [
  { title: 'SSE', value: 'sse' },
  { title: 'HTTP流', value: 'streamable-http' },
  { title: '标准输入输出', value: 'stdio' }
]

// 表单引用
const formRef = ref()

// 保存设置
const saveSettings = async () => {
  try {
    const { valid } = await formRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    // 这里调用API保存设置
    console.log('保存应用设置:', {
      form,
      storageConfig,
      netSearchConfig,
      mcpConfig
    })
    
  } catch (error) {
    console.error('保存设置失败:', error)
  } finally {
    saving.value = false
  }
}

// 获取应用设置
const fetchSettings = async () => {
  try {
    // 这里调用API获取应用设置
    // 暂时使用默认值
  } catch (error) {
    console.error('获取应用设置失败:', error)
  }
}

onMounted(() => {
  fetchSettings()
})
</script> 