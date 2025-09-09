// 聊天智能体MCP工具设置
export interface ChatAgentMcpServerToolSetting {
  id: string // 配置ID
  application_mcp_server_tool_id: string // 应用MCP工具ID
  enabled: boolean // 是否启用
}

// 聊天智能体可用的MCP工具
export interface ChatAgentAvailableMcpServerTool {
  id: string // 工具ID
  application_mcp_server_config_id: string // MCP服务配置ID
  name: string // 工具名称
  title: string // 工具标题
  description: string // 工具描述
  enabled: boolean // 是否启用
}

// MCP服务配置信息
export interface McpServerConfig {
  id: string // 配置ID
  name: string // 服务名称
  description: string // 服务描述
}

// 按MCP服务分组的工具
export interface McpServerToolGroup {
  server: McpServerConfig // MCP服务信息
  tools: ChatAgentAvailableMcpServerTool[] // 该服务下的工具列表
}

// 保存聊天智能体MCP工具设置请求
export interface SaveChatAgentMcpServerToolSettingsRequest {
  tool_settings: ChatAgentMcpServerToolSetting[] // 工具设置列表
}

// 保存聊天智能体MCP工具设置响应
export interface SaveChatAgentMcpServerToolSettingsResponse {
  success: boolean // 是否成功
  message: string // 消息
}

// 获取聊天智能体MCP工具设置响应
export interface GetChatAgentMcpServerToolSettingsResponse {
  success: boolean // 是否成功
  data: ChatAgentMcpServerToolSetting[] // 工具设置列表
  message: string // 消息
}

// 获取聊天智能体可用MCP工具响应
export interface GetChatAgentAvailableMcpServerToolsResponse {
  success: boolean // 是否成功
  data: McpServerToolGroup[] // 按MCP服务分组的工具列表
  message: string // 消息
}
