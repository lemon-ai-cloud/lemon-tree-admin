export default class ResourceUtils {
    public static getSystemPublicResourceBaseUrl() {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:12833/api/v1'
        return `${apiBaseUrl}/resources/download?path=`
    }

    public static getSystemPublicResourceRealUrl(resource: string) {
        if (resource) {
            if (resource.startsWith('http:') || resource.startsWith('https:')) {
                return resource
            } else {
                return ResourceUtils.getSystemPublicResourceBaseUrl() + resource
            }
        } else {
            return ''
        }
    }

    public static recoverSystemPublicResource(url: string) {
        return url.replace(ResourceUtils.getSystemPublicResourceBaseUrl(), '')
        // return url.replace(ResourceUtils.getBaseUrl() + '/system/resource/download', '')
    }

    public static downloadSystemPublicResource(resource: string, fileName: string) {
        return new Promise<void>(resolve => {
            let url = ''
            if (resource.startsWith('http:') || resource.startsWith('https:')) {
                url = resource
            } else {
                url = ResourceUtils.getSystemPublicResourceBaseUrl() + resource
            }
            fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = fileName
                    link.click()
                    resolve()
                })
        })
    }
}
