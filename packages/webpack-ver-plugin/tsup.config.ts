import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs'],
  // webpack 插件运行在 Node 端，无需类型打包
  dts: false,
  clean: true,
  sourcemap: true,
  // 不进行任何依赖打包，node-ssh 等运行时从使用方的 node_modules 解析
  external: [],
})
