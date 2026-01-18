// 构建时检查环境变量
console.log('🔍 Checking environment variables at build time...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');

if (process.env.VITE_SUPABASE_URL) {
  console.log('URL value:', process.env.VITE_SUPABASE_URL.substring(0, 30) + '...');
  console.log('URL full length:', process.env.VITE_SUPABASE_URL.length);
}

if (process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('Key length:', process.env.VITE_SUPABASE_ANON_KEY.length);
  console.log('Key prefix:', process.env.VITE_SUPABASE_ANON_KEY.substring(0, 10) + '...');
  console.log('Key has 3 parts (JWT):', process.env.VITE_SUPABASE_ANON_KEY.split('.').length === 3);
}

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Environment variables are missing at build time!');
  console.error('This means Vercel is not injecting the environment variables correctly.');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('VITE_')));
} else {
  console.log('✅ All environment variables are present at build time!');
}
