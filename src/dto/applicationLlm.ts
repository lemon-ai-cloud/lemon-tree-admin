// ApplicationLLM 相关的 DTO 类型定义

// 应用模型 DTO
export interface ApplicationLlmDto {
  id: string
  name: string
  alias: string
  application_id: string
  llm_provider_id: string
  enabled: boolean
  ability_vision: boolean
  ability_network: boolean
  ability_text_embeddings: boolean
  ability_thinking: boolean
  ability_call_tools: boolean
  ability_reranking: boolean
  billing_currency: string
  billing_price_input: number
  billing_price_output: number
  created_at: string
  updated_at: string
}

// 保存应用模型请求
export interface SaveApplicationLlmRequest {
  id?: string // 更新时必填
  name: string
  alias: string
  application_id: string
  llm_provider_id: string
  enabled: boolean
  ability_vision: boolean
  ability_network: boolean
  ability_text_embeddings: boolean
  ability_thinking: boolean
  ability_call_tools: boolean
  ability_reranking: boolean
  billing_currency: string
  billing_price_input: number
  billing_price_output: number
}

// 更新启用状态请求
export interface UpdateEnabledStatusRequest {
  id: string
  enabled: boolean
}

// 应用模型列表响应
export interface ApplicationLlmListResponse {
  application_llm: ApplicationLlmDto[]
}

// 单个应用模型响应
export interface SingleApplicationLlmResponse {
  application_llm: ApplicationLlmDto
}
