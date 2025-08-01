import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#8BC34A',      // 柠檬绿
          secondary: '#FFC107',    // 柠檬黄
          accent: '#A5D6A7',       // 浅绿色
          error: '#F44336',
          warning: '#FF9800',
          info: '#2196F3',
          success: '#4CAF50',
          surface: '#F1F8E9',      // 主背景色
          background: '#F9FBE7',   // 次要背景色
        }
      }
    }
  },
  defaults: {
    VBtn: {
      variant: 'elevated',
      color: 'primary'
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
