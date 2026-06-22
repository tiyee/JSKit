/** @format */
import {stringify} from 'qs'
type HttpMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'head' | 'options'
interface IResponseHook {
    (resp: Response): Response
}
interface IRequestOptions {
    method?: HttpMethod
    headers?: HeadersInit
    params?: URLSearchParams | Record<string, string | number | boolean> | string | []
    data?: FormData | string | Record<string, any> | Array<any> | BodyInit
    timeout?: number
    credentials?: RequestCredentials
    mod?: RequestMode
    prefix?: string
    suffix?: string
    requestType?: 'json' | 'form'
    responseType?: 'response' | 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'
    hooks?: Array<IResponseHook>
    signal?: AbortSignal
}
const checkStatusHook: IResponseHook = (response: Response): Response => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        const error = new Error(`request error: ${response.statusText}`)
        throw error
    }
}
const initOptions: IRequestOptions = {
    method: 'get',
    params: {},
    data: '',
    timeout: 0,
    credentials: 'same-origin',
    headers: {},
    mod: 'same-origin',
    prefix: '',
    suffix: '',
    requestType: 'json',
    // 默认返回原始 Response，由调用方自行解析（与历史行为一致）
    responseType: 'response',
    hooks: [checkStatusHook],
}
const buildRequestInit = (options: IRequestOptions): RequestInit => {
    const myInit: RequestInit = {}
    const opts = {...initOptions, ...options}
    const {requestType = 'json', data} = opts
    let body: BodyInit | undefined
    if (data) {
        const dataType = Object.prototype.toString.call(data)
        if (dataType === '[object Object]' || dataType === '[object Array]') {
            if (requestType === 'json') {
                opts.headers = {
                    Accept: 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                    ...opts.headers,
                }
                body = JSON.stringify(data)
            } else if (requestType === 'form') {
                opts.headers = {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    ...opts.headers,
                }
                body = stringify(data, {arrayFormat: 'repeat', strictNullHandling: true})
            }
        } else {
            // 其他 requestType 自定义header
            opts.headers = {
                Accept: 'application/json',
                ...opts.headers,
            }
            body = data as BodyInit
        }
    }

    myInit.method = opts.method?.toUpperCase()
    myInit.headers = opts.headers
    myInit.body = body
    myInit.credentials = opts.credentials
    myInit.mode = opts.mod
    if (opts.signal) {
        myInit.signal = opts.signal
    }

    return myInit
}
// 按 responseType 把 Response 解析成对应数据；'response' 透传原始 Response
const parseByResponseType = async (response: Response, responseType: NonNullable<IRequestOptions['responseType']>) => {
    switch (responseType) {
        case 'response':
            return response
        case 'json':
            return response.json()
        case 'text':
            return response.text()
        case 'blob':
            return response.blob()
        case 'arrayBuffer':
            return response.arrayBuffer()
        case 'formData':
            return response.formData()
        default:
            return response
    }
}
class RequestInstance {
    private opts: IRequestOptions

    constructor(opts: IRequestOptions) {
        this.opts = opts || {}
    }

    private async _request(method: HttpMethod, url: string, options?: IRequestOptions): Promise<any> {
        const opts = {...this.opts, ...options, method}
        const prefix = opts.prefix ?? ''
        const suffix = opts.suffix ?? ''
        url = `${prefix}${url}${suffix}`

        if (opts.params) {
            const paramsType = Object.prototype.toString.call(opts.params)
            if (paramsType === '[object URLSearchParams]') {
                opts.params = opts.params.toString()
            } else if (paramsType === '[object Object]' || paramsType === '[object Array]') {
                opts.params = stringify(opts.params, {arrayFormat: 'brackets'})
            }

            const urlSign = url.indexOf('?') !== -1 ? '&' : '?'
            url = `${url}${urlSign}${opts.params}`
        }

        const myRequest = new Request(url)
        // timeout：用 AbortController 实现请求超时；0 表示不超时
        let controller: AbortController | undefined
        let timer: ReturnType<typeof setTimeout> | undefined
        const timeout = opts.timeout ?? 0
        if (timeout > 0) {
            controller = new AbortController()
            opts.signal = controller.signal
            timer = setTimeout(() => controller!.abort(), timeout)
        }
        const requestInit = buildRequestInit(opts)

        let resp: Promise<Response> = fetch(myRequest, requestInit)
        opts.hooks = opts.hooks ?? []
        for (let hook of opts.hooks) {
            resp = resp.then(hook)
        }

        try {
            const response = await resp
            return await parseByResponseType(response, opts.responseType ?? 'response')
        } catch (err) {
            // 把 abort 转成更明确的超时错误，便于调用方区分
            if (controller?.signal.aborted) {
                throw new Error(`request timeout after ${timeout}ms`)
            }
            throw err
        } finally {
            if (timer) clearTimeout(timer)
        }
    }
    async get(url: string, options?: IRequestOptions) {
        return this._request('get', url, options)
    }
    async post(url: string, options?: IRequestOptions) {
        return this._request('post', url, options)
    }
    async delete(url: string, options?: IRequestOptions) {
        return this._request('delete', url, options)
    }
    async put(url: string, options?: IRequestOptions) {
        return this._request('put', url, options)
    }
}

const request = (opts: IRequestOptions = initOptions) => {
    return new RequestInstance(opts)
}
export const extend = (initOpts: IRequestOptions) => request(initOpts)
export default request({})
