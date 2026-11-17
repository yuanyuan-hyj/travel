import axios from 'axios'

// axios 二次封装
const instance = axios.create({
  baseURL: '',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('请求失败:', error)
    return Promise.reject(error)
  },
)

export const post = (url, data = {}) => {
  return instance.post(url, data)
}
export const get = (url, params = {}) => {
  return instance.get(url, { params })
}

//处理流式接口（SSE 格式，走 Vite 代理）
export async function fetchStream(url, data, onChunk, onComplete, onError) {
  const controller = new AbortController()

  // 走同源 Vite 代理，避免浏览器跨域
  const fullUrl = url.startsWith('/') ? url : `/api/travel/${url}`

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    })

    if (!response.ok || !response.body) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`)
    }

    //创建响应体的可读流读取器
    const reader = response.body.getReader()
    //将二进制数据解码为字符串
    const decoder = new TextDecoder()

    let result = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      result += chunk
      // SSE 格式解析：每行 data: {...}
      const lines = chunk.split('\n').filter(line => line.trim())
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const jsonStr = line.substring(5)
          try {
            if (jsonStr) {
              const jsonData = JSON.parse(jsonStr)
              if (jsonData.type === 'chunk') {
                //分片的数据
                if (typeof onChunk === 'function') onChunk(jsonData.content)
              } else if (jsonData.done) {
                //完成的数据
                if (typeof onComplete === 'function') onComplete()
              } else if (jsonData.error) {
                //错误的数据
                if (typeof onError === 'function') onError(jsonData.error)
              }
            }
          } catch (err) {
            if (typeof onError === 'function') onError('解析JSON失败')
          }
        }
      }
    }

    return controller.abort()
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('流式请求失败:', err)
      if (typeof onError === 'function') onError(err.message)
    }
  }
}

export default instance
