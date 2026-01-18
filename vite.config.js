import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 在 Node.js 环境中直接读取 process.env（Vercel 注入的环境变量）
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

console.log('🔧 vite.config.js - 环境变量读取:')
console.log('  VITE_SUPABASE_URL:', SUPABASE_URL ? `✅ ${SUPABASE_URL.substring(0, 30)}...` : '❌ 未设置')
console.log('  VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `✅ (长度: ${SUPABASE_ANON_KEY.length})` : '❌ 未设置')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 使用 define 将环境变量硬编码到构建产物中
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
  },
})
