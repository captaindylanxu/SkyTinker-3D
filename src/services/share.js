// 分享服务

const GAME_URL = 'https://www.skytinker.com';

// 生成带邀请码的分享链接
export function generateShareUrl(playerId) {
  if (!playerId) return GAME_URL;
  return `${GAME_URL}?ref=${encodeURIComponent(playerId)}`;
}

// 生成分享文案
export function getShareText(score, t) {
  return t('share.text').replace('{score}', Math.floor(score));
}

// 检测是否在微信浏览器内
export function isWeChatBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

// 复制文本到剪贴板（兼容方案）
export async function copyToClipboard(text) {
  // 优先使用 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 降级到 execCommand
    }
  }
  // 降级方案：创建临时 textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

// 执行分享动作
// 微信内：复制到剪贴板，返回 { wechat: true } 让 UI 显示引导蒙层
// 非微信：复制到剪贴板，返回 { copied: true } 让 UI 显示提示
export async function doShare(url, text) {
  const shareContent = `${text} ${url}`;
  const copied = await copyToClipboard(shareContent);

  if (isWeChatBrowser()) {
    return { success: true, wechat: true, copied };
  }

  return { success: true, wechat: false, copied };
}
