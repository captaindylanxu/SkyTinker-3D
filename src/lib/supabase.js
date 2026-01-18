import { createClient } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 调试信息
console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ NOT SET',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 10) : '❌ NOT SET',
  envMode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
});

// 创建 Supabase 客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 检查是否配置了 Supabase
export const isSupabaseConfigured = () => {
  const configured = supabase !== null;
  console.log('✅ Supabase configured:', configured);
  if (!configured) {
    console.warn('⚠️ Supabase is not configured. Please check environment variables:');
    console.warn('   - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.warn('   - VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
  }
  return configured;
};

export default supabase;
