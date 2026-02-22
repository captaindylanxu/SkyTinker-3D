import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getReferralFromUrl, saveReferralCode } from './services/referral'

// 检查 URL 中的邀请码并保存
const referralCode = getReferralFromUrl();
if (referralCode) {
  saveReferralCode(referralCode);
  // 清除 URL 中的 ref 参数，保持 URL 干净
  const url = new URL(window.location.href);
  url.searchParams.delete('ref');
  window.history.replaceState({}, '', url.pathname);
}

createRoot(document.getElementById('root')).render(<App />)
