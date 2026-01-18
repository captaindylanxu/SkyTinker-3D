import { createClient } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 调试信息
console.log('Supabase Config:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 10) : 'NOT SET',
});

// 创建 Supabase 客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 检查是否配置了 Supabase
export const isSupabaseConfigured = () => {
  const configured = supabase !== null;
  console.log('Supabase configured:', configured);
  return configured;
};

export default supabase;
