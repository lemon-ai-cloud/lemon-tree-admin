// ChatAgent 数据传输对象定义

export interface ChatAgentDto {
  id: string
  name: string
  description: string
  application_id: string
  avatar_url: string
  system_prompt: string
  chat_model_id: string
  conversation_naming_prompt: string
  conversation_naming_model_id: string
  model_temperature: number
  model_top_p: number
  enable_context_length_limit: boolean
  context_length_limit: number
  enable_max_output_token_count_limit: boolean
  max_output_token_count_limit: number
  default_streamable: boolean
  created_at: string
  updated_at: string
}

export interface SaveChatAgentRequest {
  id?: string
  name: string
  description: string
  application_id: string
  avatar_url: string
  system_prompt: string
  chat_model_id: string
  conversation_naming_prompt: string
  conversation_naming_model_id: string
  model_temperature: number
  model_top_p: number
  enable_context_length_limit: boolean
  context_length_limit: number
  enable_max_output_token_count_limit: boolean
  max_output_token_count_limit: number
  default_streamable: boolean
}

export interface ChatAgentListResponse {
  chat_agents: ChatAgentDto[]
  total: number
  page: number
  page_size: number
}

export interface SingleChatAgentResponse {
  chat_agent: ChatAgentDto
}
