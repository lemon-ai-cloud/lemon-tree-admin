import {createApp, h} from 'vue'
import {createPinia} from 'pinia'

// Ant Design Vue
import Antd, {ConfigProvider} from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 主题配置
import {theme} from './config/theme'

import App from './App.vue'
import router from './router'

import i18n from './i18n'
import LemonBaseFunctions from '@/plugins/lemon-base-functions.ts'

// 使用 ConfigProvider 包装应用
const app = createApp({
    setup() {
        return () => h(ConfigProvider, {theme}, () => h(App))
    }
})

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(i18n)
app.use(LemonBaseFunctions)

app.mount('#app')
