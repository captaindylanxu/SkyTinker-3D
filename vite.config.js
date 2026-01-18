import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('🔧 Vite Config Debug:')
  console.log('  Mode:', mode)
  console.log('  CWD:', process.cwd())
  console.log('  All env keys:', Object.keys(env).length)
  console.log('  VITE_ prefixed vars:', Object.keys(env).filter(k => k.startsWith('VITE_')))
  console.log('  VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? `Set (${env.VITE_SUPABASE_URL.substring(0, 30)}...)` : '❌ Missing')
  console.log('  VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? `Set (length: ${env.VITE_SUPABASE_ANON_KEY.length})` : '❌ Missing')
  
  // 也检查 process.env
  console.log('  process.env.VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : '❌ Missing')
  console.log('  process.env.VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : '❌ Missing')
  
  return {
    plugins: [react()],
    // 确保 VITE_ 前缀的环境变量被暴露
    envPrefix: 'VITE_',
    // 使用 define 显式注入环境变量
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''),
    },
  }
})
