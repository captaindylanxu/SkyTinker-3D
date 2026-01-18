import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 从 process.env 直接读取（Vercel 注入的）
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  
  console.log('🔧 Vite Config - Direct process.env:')
  console.log('  VITE_SUPABASE_URL:', supabaseUrl ? `Set (${supabaseUrl.substring(0, 30)}...)` : '❌ Missing')
  console.log('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? `Set (length: ${supabaseKey.length})` : '❌ Missing')
  
  return {
    plugins: [react()],
    // 使用 define 将环境变量硬编码到构建中
    define: {
      __SUPABASE_URL__: JSON.stringify(supabaseUrl),
      __SUPABASE_ANON_KEY__: JSON.stringify(supabaseKey),
    },
  }
})
