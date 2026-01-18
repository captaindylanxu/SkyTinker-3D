// 环境变量调试组件
export function EnvDebug() {
  // 检查 import.meta.env
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // 检查全局变量（由 vite define 注入）
  const globalUrl = typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : null;
  const globalKey = typeof __SUPABASE_ANON_KEY__ !== 'undefined' ? __SUPABASE_ANON_KEY__ : null;
  
  // 使用的实际值
  const url = globalUrl || envUrl;
  const key = globalKey || envKey;
  
  // 硬编码的值用于对比
  const EXPECTED_URL = 'https://zwtxjoamnjhuveaxwlbv.supabase.co';
  const EXPECTED_KEY_LENGTH = 208;
  
  const urlMatch = url === EXPECTED_URL;
  const keyMatch = key && key.length === EXPECTED_KEY_LENGTH;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 10000,
      maxWidth: '400px',
      border: '2px solid ' + (urlMatch && keyMatch ? '#10b981' : '#ef4444'),
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
        🔍 环境变量调试
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>MODE:</strong> {import.meta.env.MODE}
      </div>
      
      <div style={{ marginBottom: '8px', fontSize: '10px', opacity: 0.7 }}>
        <strong>来源:</strong> {globalUrl ? '全局变量 (define)' : envUrl ? 'import.meta.env' : '未设置'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>VITE_SUPABASE_URL:</strong>
        <div style={{ color: urlMatch ? '#10b981' : '#ef4444' }}>
          {url || '❌ 未设置'}
        </div>
        {url && !urlMatch && (
          <div style={{ color: '#f59e0b', fontSize: '10px' }}>
            ⚠️ 值不匹配预期
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>VITE_SUPABASE_ANON_KEY:</strong>
        <div style={{ color: keyMatch ? '#10b981' : '#ef4444' }}>
          {key ? `${key.substring(0, 20)}... (长度: ${key.length})` : '❌ 未设置'}
        </div>
        {key && !keyMatch && (
          <div style={{ color: '#f59e0b', fontSize: '10px' }}>
            ⚠️ 长度不匹配（预期: {EXPECTED_KEY_LENGTH}）
          </div>
        )}
      </div>
      
      <div style={{
        marginTop: '10px',
        padding: '8px',
        background: urlMatch && keyMatch ? '#10b98120' : '#ef444420',
        borderRadius: '4px',
        fontWeight: 'bold',
      }}>
        {urlMatch && keyMatch ? '✅ 环境变量正常' : '❌ 环境变量异常'}
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        刷新页面或重新部署后查看
      </div>
    </div>
  );
}

export default EnvDebug;
