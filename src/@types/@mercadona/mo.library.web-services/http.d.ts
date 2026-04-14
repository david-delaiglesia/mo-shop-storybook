declare module '@mercadona/mo.library.web-services/http' {
  interface HttpClientRequestOptions {
    headers?: Record<string, string | undefined>
    API_HOST?: string
    API_VERSION?: string
    params?: Record<string, string>
  }
}
