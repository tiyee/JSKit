# JSKit
本人日常编写的js库，方便自己使用

## request.js

本来是想使用[umi-request](https://github.com/umijs/plugin-request)的，可惜它依赖太多了，直接讲整个umijs都包含进来了，于是按照它的api自己实现了一套。

对于umijs的`useRequest`，配合[react-query](https://tanstack.com/query/latest/docs/react/overview)来实现类似`useRequest`的效果
```typecrypt
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import request from './request'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn:() => request.get('https://api.github.com/repos/tannerlinsley/react-query').then((resp: Response) => resp.json())
  })

  if (isLoading) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
```

## webpack-ver-plugin.js

是一个webpack5 插件，主要用途是生成一个版本json文件。

如果我们访问地址`https://abc.com/#/home`，因为有浏览器缓存，我们改代码后，html不会更新，引入的js还是旧的，这个时候，我们可以请求这个版本号文件，如果跟js的版本号不一致，强制跳转带版本号的页面`https://abc.com/?ver=v2#/home`

```typescript
import Ver from './Version'

function App() {
    const parsedUrl = new URL(window.location.href)
    request
        .get('ver.json?ver=' + new Date().getTime().toString())
        .then((resp: Response) => resp.json())
        .then(data => {
            console.log(data, Ver)
            const {ver} = data
            if (Ver !== ver) {
                const params = new URLSearchParams()
                params.set('ver', ver)
                location.href = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}?${params.toString()}${
                    parsedUrl.hash
                }`
            }
        })
        .catch(e => console.log(e))

    // other code
}

```
## webpack-auto-upload.plugin.js

一个自动上传代码的插件,通过ssh连接服务器并上传代码
