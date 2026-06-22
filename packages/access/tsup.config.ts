import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: false,
  external: ['react'],
  outExtensions: () => ({js: '.js', cjs: '.cjs'}),
  clean: true,
  sourcemap: true,
  jsx: 'automatic',
})
