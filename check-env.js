// 构建时检查环境变量
console.log('🔍 Checking environment variables at build time...');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');

if (process.env.VITE_SUPABASE_URL) {
  console.log('URL value:', process.env.VITE_SUPABASE_URL.substring(0, 30) + '...');
}

if (process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('Key length:', process.env.VITE_SUPABASE_ANON_KEY.length);
  console.log('Key prefix:', process.env.VITE_SUPABASE_ANON_KEY.substring(0, 10) + '...');
}

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Environment variables are missing at build time!');
  console.error('This means Vercel is not injecting the environment variables correctly.');
} else {
  console.log('✅ All environment variables are present at build time!');
}
