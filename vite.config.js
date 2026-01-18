import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 使用 loadEnv 加载所有环境变量（包括 process.env 和 .env 文件）
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // 显式定义环境变量，确保在构建时正确注入
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    },
  }
})
