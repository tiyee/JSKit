# JSKit
本人日常编写的js库，方便自己使用

## request.js

本来是想使用[umi-request](https://github.com/umijs/plugin-request)的，可惜它依赖太多了，直接将整个umijs都包含进来了，于是按照它的api自己实现了一套。

对于umijs的`useRequest`同样也很复杂，我们可以用这个request配合[react-query](https://tanstack.com/query/latest/docs/react/overview)来实现类似`useRequest`的效果
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

## access

umi[权限](https://umijs.org/docs/max/access)的一个实现，`Access`组件的props跟umi完全一致，`useAccess`的用法基本一致。不提同的是`useAccess`方法的参数类型有所不同

```typescript
import {Access, useAccess} from 'access'
function App() {
  const hasLogin = false // fetch from remote
  const access = useAccess({hasLogin})
  if (access.canReadFoo) {
      return <span>有canReadFoo权限</span>
  }
  if (access.canDeleteFoo('abcc')) {
      return <span>canDeleteFoo</span>
  }
  return <Access fallback={'你没有登陆'} accessible={hasLogin}>
            <span>你已经登录</span>
        </Access>
}

```

## auth

`auth`是登陆相关的模块，有基础的登陆验证设置模块`useAuth`和执行登陆、退出逻辑的`useLogin`和`useLogout`

不同的项目用户信息不一样，更改`IUser`和`initState`内容即可。

要使用`auth`需要上层加入`AuthProvider`。比如

```typescript

function App() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    )
}

```
一个完整的demo

```typescript

import * as React from 'react'
import {useAuth, AuthProvider, useLogin, IUser} from 'utils/auth'
const Auth = () => {
    const fn = new Promise<IUser>(resolve => {
        setTimeout(() => {
            resolve({uid: 1, nickname: '123'})
        }, 10000)
    })

    const {setLogout, setLogin, isLogin} = useAuth()
    const {loadding, user} = useLogin(fn)

    return (
        <center>
            <p>{isLogin ? 'login' : 'not login'}</p>
            <p>{loadding ? 'loadding' : user.nickname}</p>
            <button
                onClick={() => {
                    isLogin ? setLogout() : setLogin()
                }}>
                {isLogin ? '退出' : '登陆'}
            </button>
        </center>
    )
}
function App() {
    return (
        <AuthProvider>
            <Auth />
        </AuthProvider>
    )
}

```


## webpack-ver-plugin.js

是一个webpack5 插件，主要用途是生成一个版本json文件。

如果我们访问地址`https://abc.com/#/home`，因为有浏览器缓存，我们改代码后，html不会更新，引入的js还是旧的，这个时候，我们可以请求这个版本号文件，如果跟js的版本号不一致，强制跳转带版本号的页面`https://abc.com/?ver=v2#/home`

当然，我们也可以根据Semver来判断是否需要强制跳转。

```typescript
// Version.tsx `export default 'v8'`
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
                parsedUrl.search = params.toString()
                console.log('new url ', parsedUrl.toString())
                location.href = parsedUrl.toString()
            }
        })
        .catch(e => console.log(e))

    // other code
}

```
## webpack-auto-upload-plugin.js

一个自动上传代码的插件,通过ssh连接服务器并上传代码
