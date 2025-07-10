import { defineConfig } from 'rolldown'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
  platform: 'node',
  // 如果有外部依赖，可以在这里声明
  external: ['mysql2'],
}) 