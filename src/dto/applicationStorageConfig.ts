// ApplicationStorageConfig 数据传输对象定义

export interface ApplicationStorageConfigDto {
  id: string
  type: string
  application_id: string
  root_path: string
  endpoint: string
  region: string
  bucket_name: string
  secret_id: string
  secret_key: string
  key_prefix: string
  created_at: string
  updated_at: string
}

export interface SaveApplicationStorageConfigRequest {
  id?: string
  type: string
  application_id: string
  root_path: string
  endpoint: string
  region: string
  bucket_name: string
  secret_id: string
  secret_key: string
  key_prefix: string
}

export interface SingleApplicationStorageConfigResponse {
  application_storage_config: ApplicationStorageConfigDto | null
}
