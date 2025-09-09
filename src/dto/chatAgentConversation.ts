// ChatAgentConversation 数据传输对象定义

export interface ChatMessageResponseEventDto {
  conversation_id: string
  request_id: string
  message_type: string
  content: string
}

export interface ChatMessageUseToolDto {
  application_mcp_config_id: string
  tool_name: string
}

export interface ChatUserSendMessageRequest {
  service_user_id: string
  system_prompt: string
  user_message: string
  predefined_answer?: string
  used_mcp_tool_list: ChatMessageUseToolDto[]
  used_internal_tool_list: string[]
  conversation_id?: string
  attachments?: string[]
}

export interface GetConversationListRequest {
  service_user_id: string
  last_id?: string
  size?: number
  sort?: string
}

export interface ConversationInfoDto {
  id: string
  title: string
  application_id: string
  service_user_id: string
  created_at?: number
  updated_at?: number
}

export interface GetConversationListResponse {
  conversations: ConversationInfoDto[]
  total_count: number
}

export interface GetChatMessageListRequest {
  conversation_id: string
  last_id?: string
  size?: number
  sort?: string
}

export interface ChatMessageAttachmentInfoDto {
  id: string
  name: string
}

export interface ChatMessageInfoDto {
  id: string
  application_id: string
  conversation_id: string
  request_id: string
  type: string
  role?: string
  content?: string
  function_call_id?: string
  function_call_name?: string
  function_call_arguments?: string
  function_call_output?: string
  prompt_token_count: number
  completion_token_count: number
  total_token_count: number
  created_at?: number
  updated_at?: number
  attachment_info_list: ChatMessageAttachmentInfoDto[]
}

export interface GetChatMessageListResponse {
  messages: ChatMessageInfoDto[]
  total_count: number
}

export interface DeleteConversationRequest {
  conversation_id: string
}

export interface DeleteConversationResponse {
  success: boolean
  message?: string
  error?: string
  deleted_messages_count?: number
  deleted_attachments_count?: number
}

export interface RenameConversationRequest {
  conversation_id: string
  new_title: string
}

export interface RenameConversationResponse {
  success: boolean
  message?: string
  error?: string
  conversation_id?: string
  new_title?: string
}

export interface UploadAttachmentResponse {
  success: boolean
  attachment_id?: string
  original_filename?: string
  file_size?: number
  attachment_type?: string
  is_processed?: boolean
  processing_error?: string
  markdown_content?: string
  error?: string
}
