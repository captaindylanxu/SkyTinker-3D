#!/usr/bin/env node

/**
 * 构建时环境变量检查脚本
 * 在 Vercel 构建日志中显示环境变量状态
 */

console.log('\n========================================');
console.log('🔍 环境变量检查 (Build Time)');
console.log('========================================\n');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('VERCEL:', process.env.VERCEL || 'undefined');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'undefined');
console.log('');

if (url) {
    console.log('✅ VITE_SUPABASE_URL: 已设置');
    console.log('   - 值:', url.substring(0, 40) + '...');
    console.log('   - 长度:', url.length);
} else {
    console.log('❌ VITE_SUPABASE_URL: 未设置!');
}

console.log('');

if (key) {
    console.log('✅ VITE_SUPABASE_ANON_KEY: 已设置');
    console.log('   - 前缀:', key.substring(0, 20) + '...');
    console.log('   - 长度:', key.length);
    console.log('   - 是否为 JWT (3 部分):', key.split('.').length === 3 ? '是' : '否');
} else {
    console.log('❌ VITE_SUPABASE_ANON_KEY: 未设置!');
}

console.log('\n========================================');

// 列出所有 VITE_ 开头的环境变量
const viteEnvVars = Object.keys(process.env).filter(k => k.startsWith('VITE_'));
console.log('所有 VITE_ 环境变量:', viteEnvVars.length > 0 ? viteEnvVars.join(', ') : '无');

console.log('========================================\n');

if (!url || !key) {
    console.log('⚠️  警告: 环境变量缺失，Supabase 功能将不可用');
    console.log('   请检查 Vercel 的 Environment Variables 设置');
    console.log('');
}
