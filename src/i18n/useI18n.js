import { create } from 'zustand';
import { LOCALES, detectLanguage } from './locales';

const useI18nStore = create((set, get) => ({
  locale: detectLanguage(),
  
  setLocale: (locale) => {
    if (LOCALES[locale]) {
      set({ locale });
    }
  },
  
  t: (key) => {
    const { locale } = get();
    const translations = LOCALES[locale] || LOCALES['en'];
    
    // 支持嵌套键，如 'partTypes.Fuselage'
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 回退到英文
        value = LOCALES['en'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // 返回原始键作为最后手段
          }
        }
        break;
      }
    }
    
    return value;
  },
}));

export function useI18n() {
  const locale = useI18nStore((state) => state.locale);
  const setLocale = useI18nStore((state) => state.setLocale);
  const t = useI18nStore((state) => state.t);
  
  return { locale, setLocale, t };
}

export default useI18n;
