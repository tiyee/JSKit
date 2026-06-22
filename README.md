# JSKit

本人日常编写的 JS 工具集，方便自己使用。基于 **pnpm workspace + tsup** 的 monorepo，每个子包独立发布到 npm 的 `@tiyee/*` scope。

## 目录结构

```
JSKit/
├── packages/
│   ├── auth/                         # @tiyee/auth        React 登录态管理
│   ├── access/                       # @tiyee/access      React 权限组件
│   ├── requests/                     # @tiyee/requests    基于 fetch 的 HTTP 请求库
│   ├── webpack-ver-plugin/           # @tiyee/webpack-ver-plugin           生成版本号 json
│   └── webpack-auto-upload-plugin/   # @tiyee/webpack-auto-upload-plugin   SSH 自动上传产物
├── package.json                      # 根 workspace（私有）
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .changeset/
```

## 包一览

| 包 | 说明 |
|---|---|
| [`@tiyee/auth`](./packages/auth) | React 登录态管理：`useAuth` / `useLogin` / `useLogout` + `AuthProvider` |
| [`@tiyee/access`](./packages/access) | 兼容 umi access 用法的权限组件 `Access` + `useAccess` |
| [`@tiyee/requests`](./packages/requests) | 仿 umi-request 的轻量 fetch 封装 |
| [`@tiyee/webpack-ver-plugin`](./packages/webpack-ver-plugin) | webpack5 插件：生成版本号 json，配合前端比对实现强制刷新 |
| [`@tiyee/webpack-auto-upload-plugin`](./packages/webpack-auto-upload-plugin) | webpack5 插件：打包后 SSH 自动上传到服务器 |

## API 变更说明（相对早期散文件版本）

- **`@tiyee/auth`**：`useLogin` / `useLogout` 的首参由 `Promise<IUser>` 改为 `() => Promise<IUser>`（返回 Promise 的函数）。之前传一个已创建的 Promise 会导致每次渲染重建 `useCallback`，现在由 hook 在适当时机调用。
- **`@tiyee/requests`**：
  - `timeout` 真正生效（基于 `AbortController`，超时抛 `request timeout after Xms`），默认 `0` 表示不超时。
  - `responseType` 真正生效：`'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'` 会自动解析 Response；新增 `'response'` 表示返回原始 Response（**默认值**，保持与旧版 `.then(r => r.json())` 用法兼容）。
- **`@tiyee/webpack-auto-upload-plugin`**：上传前校验 `remotePath`，空值、根目录、`/root` `/usr` 等危险路径会被拒绝并报错，避免误删服务器关键目录。

## 安装

按需安装对应子包即可，例如：

```bash
pnpm add @tiyee/requests
# 或
npm install @tiyee/auth
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建全部子包
pnpm build

# 监听模式开发（全部子包）
pnpm dev

# 仅构建某个包
pnpm --filter @tiyee/requests build
```

## 发版（Changesets）

本项目使用 [Changesets](https://github.com/changesets/changesets) 管理版本与 CHANGELOG。

```bash
# 1. 记录变更：交互式选择受影响的包，填写变更摘要
pnpm changeset

# 2. 消费变更、更新各包 version 与 CHANGELOG
pnpm version

# 3. 构建 + 发布到 npm
pnpm release
```

> 首次发布前请确认 `npm whoami` 为 `tiyee`，并已在 npm 创建 `@tiyee` org。

## License

MIT
