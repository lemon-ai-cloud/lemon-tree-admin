// 基础DTO类型定义
// 与后台BaseModelDto对应，所有DTO都应该继承此结构

// 基础模型DTO
export interface BaseModelDto {
  id: string
  created_at: number // Unix 13位毫秒时间戳
  updated_at: number // Unix 13位毫秒时间戳
  deleted_at?: number // Unix 13位毫秒时间戳
} 