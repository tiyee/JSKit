import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  // qs 打包进产物，使用方无需额外安装
  external: [],
  outExtensions: () => ({js: '.js', cjs: '.cjs'}),
  clean: true,
  sourcemap: true,
})
