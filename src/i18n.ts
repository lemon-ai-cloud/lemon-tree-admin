import {createI18n} from 'vue-i18n'
import language from './language'

const i18n = createI18n({
    fallbackLocale: 'cn',
    globalInjection: true,
    legacy: false,
    locale: 'cn',
    messages: language
})

export default i18n
