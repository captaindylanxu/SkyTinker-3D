import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite 会自动处理 VITE_ 前缀的环境变量
  // 不需要额外配置，让 Vite 自然处理
})
