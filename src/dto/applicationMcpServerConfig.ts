// ApplicationMCP配置 数据传输对象定义

export interface ApplicationMcpServerConfigDto {
  id: string
  application_id: string
  name: string
  description: string
  version: string
  mcp_server_connect_type: string
  mcp_server_timeout: number
  mcp_server_url: string
  mcp_server_header: string
  mcp_server_command: string
  mcp_server_args: string
  mcp_server_env: string
  created_at: string
  updated_at: string
}

export interface SaveApplicationMcpServerConfigRequest {
  id?: string
  application_id: string
  name: string
  description: string
  version: string
  mcp_server_connect_type: string
  mcp_server_timeout: number
  mcp_server_url: string
  mcp_server_header: string
  mcp_server_command: string
  mcp_server_args: string
  mcp_server_env: string
}

export interface ApplicationMcpServerConfigListResponse {
  application_mcp_server_configs: ApplicationMcpServerConfigDto[]
}

export interface SingleApplicationMcpServerConfigResponse {
  application_mcp_server_config: ApplicationMcpServerConfigDto
}

// MCP工具信息
export interface ApplicationMcpServerToolDto {
  id: string
  application_id: string
  application_mcp_server_config_id: string
  name: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

// MCP工具列表响应
export interface McpToolsResponse {
  tools: ApplicationMcpServerToolDto[]
}
