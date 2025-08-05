// Ant Design Vue 主题配置
export const theme = {
  token: {
    // 主色调
    colorPrimary: '#5ab067', // 新的主题色
    colorPrimaryHover: '#4a9a57', // 深一点的主题色
    colorPrimaryActive: '#3a8a47', // 更深的主题色
    
    // 功能色
    colorSuccess: '#4CAF50',
    colorWarning: '#FF9800',
    colorError: '#F44336',
    colorInfo: '#2196F3',
    
    // 中性色 - 改为更简约的配色
    colorText: '#333333',
    colorTextSecondary: '#666666',
    colorTextTertiary: '#999999',
    colorTextQuaternary: '#CCCCCC',
    
    // 背景色 - 统一为白色系
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#FFFFFF',
    
    // 边框色 - 更淡的灰色
    colorBorder: '#F0F0F0',
    colorBorderSecondary: '#F5F5F5',
    
    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // 阴影 - 更轻微的阴影
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 1px 2px rgba(0, 0, 0, 0.06)',
    
    // 禁用线框模式
    wireframe: false,
  },
  components: {
    // 按钮配置
    Button: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
      fontWeight: 500,
    },
    
    // 卡片配置
    Card: {
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    },
    
    // 输入框配置
    Input: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
    },
    
    // 选择器配置
    Select: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
    },
    
    // 表格配置
    Table: {
      borderRadius: 8,
      headerBg: '#FAFAFA',
      headerColor: '#333333',
      headerSplitColor: '#F0F0F0',
    },
    
    // 模态框配置
    Modal: {
      borderRadius: 8,
      headerBg: '#FFFFFF',
      contentBg: '#FFFFFF',
    },
    
    // 抽屉配置
    Drawer: {
      borderRadius: 8,
      headerBg: '#FFFFFF',
      bodyBg: '#FFFFFF',
    },
    
    // 下拉菜单配置
    Dropdown: {
      borderRadius: 6,
      controlItemBgHover: '#F8F8F8',
    },
    
    // 菜单配置
    Menu: {
      borderRadius: 6,
      itemBg: 'transparent',
      itemHoverBg: '#F8F8F8',
      itemSelectedBg: '#F0F8F0',
      itemSelectedColor: '#5ab067',
    },
    
    // 标签页配置
    Tabs: {
      borderRadius: 6,
      cardBg: '#FFFFFF',
      cardGutter: 8,
    },
    
    // 表单配置
    Form: {
      labelColor: '#333333',
      labelFontSize: 14,
      labelFontWeight: 500,
    },
  },
}

// 导出主题色常量，方便在其他地方使用
export const themeColors = {
  primary: '#5ab067',
  primaryHover: '#4a9a57',
  primaryActive: '#3a8a47',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
} 