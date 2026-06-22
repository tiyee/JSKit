import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: false,
  // React 作为 peerDependency，不打进产物
  external: ['react'],
  // 产物文件名：index.js / index.cjs（保持与 package.json 引用一致）
  outExtensions: () => ({js: '.js', cjs: '.cjs'}),
  clean: true,
  sourcemap: true,
  // React 17+ JSX runtime，无需 import React
  jsx: 'automatic',
})
