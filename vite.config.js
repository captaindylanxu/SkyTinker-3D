import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  // 打印日志（Vercel 构建日志会显示这个 console.log）
  // 注意：为了安全，我们只打印“是否存在”，不要打印具体的值！
  console.log('--- DEBUG ENV VARS ---')
  console.log('VITE_SUPABASE_URL exists:', !!env.VITE_SUPABASE_URL)
  console.log('VITE_SUPABASE_ANON_KEY exists:', !!env.VITE_SUPABASE_ANON_KEY)
  console.log('----------------------')
  return {
    plugins: [react()],
    // 确保 VITE_ 前缀的环境变量被暴露
    envPrefix: 'VITE_',
    // 使用 define 显式注入环境变量
    //define: {
    //  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
    //  'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    //},
  }
})
