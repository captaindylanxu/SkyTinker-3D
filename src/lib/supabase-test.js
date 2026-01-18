import { createClient } from '@supabase/supabase-js';

// 临时测试：直接硬编码值
const HARDCODED_URL = 'https://zwtxjoamnjhuveaxwlbv.supabase.co';
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dHhqb2FtbmpodXZlYXh3bGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTIyODgsImV4cCI6MjA4NDI2ODI4OH0.kt9odd3uDARzZ3mlls3zjgHuiJC4A3hyYVtEtDTIea0';

console.log('🧪 Testing hardcoded Supabase connection...');
console.log('URL:', HARDCODED_URL);
console.log('Key length:', HARDCODED_KEY.length);

// 创建测试客户端
export const supabaseTest = createClient(HARDCODED_URL, HARDCODED_KEY);

console.log('✅ Hardcoded Supabase client created:', supabaseTest ? 'Success' : 'Failed');

export default supabaseTest;
