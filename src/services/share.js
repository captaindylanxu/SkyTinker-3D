// 分享服务 - 支持多平台社交媒体分享

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

// 检测是否支持 Web Share API
export function supportsWebShare() {
  return !!navigator.share;
}

// 分享平台配置
export const SHARE_PLATFORMS = {
  wechat: {
    id: 'wechat',
    icon: '💬',
    // 微信分享：复制链接引导用户粘贴
    share: async (url, text) => {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        return { success: true, method: 'clipboard' };
      } catch {
        // 降级：选中文本让用户手动复制
        return { success: true, method: 'fallback' };
      }
    },
  },
  whatsapp: {
    id: 'whatsapp',
    icon: '📱',
    share: async (url, text) => {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      return { success: true };
    },
  },
  twitter: {
    id: 'twitter',
    icon: '🐦',
    share: async (url, text) => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      return { success: true };
    },
  },
  facebook: {
    id: 'facebook',
    icon: '👥',
    share: async (url, text) => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
      return { success: true };
    },
  },
  system: {
    id: 'system',
    icon: '📤',
    share: async (url, text) => {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'SkyTinker', text, url });
          return { success: true };
        } catch (e) {
          if (e.name === 'AbortError') return { success: false };
          return { success: false };
        }
      }
      // 降级到复制链接
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        return { success: true, method: 'clipboard' };
      } catch {
        return { success: false };
      }
    },
  },
};

// 获取当前环境推荐的分享平台列表
export function getAvailablePlatforms() {
  const platforms = [];
  
  if (isWeChatBrowser()) {
    // 微信环境：微信优先
    platforms.push('wechat');
    platforms.push('system');
  } else {
    // 非微信环境
    if (supportsWebShare()) {
      platforms.push('system');
    }
    platforms.push('whatsapp');
    platforms.push('twitter');
    platforms.push('facebook');
    platforms.push('wechat'); // 仍然提供微信选项（复制链接）
  }
  
  return platforms;
}
