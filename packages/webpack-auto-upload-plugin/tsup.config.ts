import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs'],
  dts: false,
  clean: true,
  sourcemap: true,
  external: [],
})
