import { createClient } from '@supabase/supabase-js';

// 调试：打印所有 import.meta.env
console.log('🔍 All import.meta.env:', import.meta.env);

// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 调试信息
console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ NOT SET',
  urlFull: supabaseUrl, // 打印完整 URL 用于调试
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 10) : '❌ NOT SET',
  keyFull: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 50)}...` : '❌ NOT SET', // 打印前50个字符
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
