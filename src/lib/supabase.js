import { createClient } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 检查是否配置了 Supabase
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

export default supabase;
