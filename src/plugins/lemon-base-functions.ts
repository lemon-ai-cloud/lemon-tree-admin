import type {App} from 'vue'
import {getCurrentInstance} from 'vue'
import ResourceUtils from '@/utils/resource-utils'
import DateUtils from '@/utils/date-utils'

export default {
    install: (app: App) => {
        app.mixin({
            data() {
                return {
                    v_scope: ''
                }
            },
            methods: {
                /**
                 * 基于当前组件的scope进行翻译
                 * @param path scope之下的翻译路径
                 * @param params 参数
                 */
                $v_translate(path: string, params: { [index: string]: any }) {
                    const self = getCurrentInstance()
                    let v_scope = ''
                    if (this.v_scope && this.v_scope !== '') {
                        v_scope = this.v_scope
                    }
                    if (self !== null && self.exposed && self.exposed.v_scope && self.exposed.v_scope !== '') {
                        v_scope = self.exposed.v_scope
                    }
                    return this.$t(v_scope + path, params)
                },
                /**
                 * 基于全局的scope进行翻译
                 */
                $v_c_translate(path: string) {
                    return this.$t(path)
                },
                /**
                 * 获取完整的资源访问URL
                 * @param resource 资源URL后半段
                 */
                $v_resource(resource: string) {
                    return ResourceUtils.getSystemPublicResourceBaseUrl(resource)
                },
                /**
                 * 把时间戳格式化成日期字符串
                 * @param timestamp 时间戳
                 */
                $v_format_timestamp_as_date(timestamp: number) {
                    return DateUtils.format(new Date(timestamp), 'yyyy-MM-dd')
                },
                /**
                 * 把时间戳格式化成日期字符串
                 * @param timestamp 时间戳
                 */
                $v_format_timestamp_as_utc_date(timestamp: number) {
                    return DateUtils.utcFormat(new Date(timestamp), 'yyyy-MM-dd')
                },

                $v_format_timestamp_as_custom_date(timestamp: number, format: string) {
                    return DateUtils.format(new Date(timestamp), format)
                },

                $v_format_timestamp_as_utc_custom_date(timestamp: number, format: string) {
                    return DateUtils.utcFormat(new Date(timestamp), format)
                },
                /**
                 * 把时间戳格式化成日期字符串
                 * @param timestamp 时间戳
                 */
                $v_format_timestamp_as_datetime(timestamp: number) {
                    return DateUtils.format(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss')
                },
                /**
                 * 把时间戳格式化成日期字符串
                 * @param timestamp 时间戳
                 */
                $v_format_timestamp_as_utc_datetime(timestamp: number) {
                    return DateUtils.utcFormat(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss')
                }
            }
        })
    }
}
