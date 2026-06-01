import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import fr, { type TranslationKeys } from '../i18n/fr';
import ar from '../i18n/ar';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'cimr_settings';

function getSavedLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.language === 'ar' || parsed.language === 'fr') return parsed.language;
    }
  } catch { /* ignore */ }
  return 'fr';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getSavedLanguage);

  const translations = language === 'ar' ? ar : fr;
  const isRTL = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Sync with cimr_settings in localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, language: lang }));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const html = document.documentElement;
    if (isRTL) {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      html.style.fontFamily = "'Noto Sans Arabic', 'Segoe UI', sans-serif";
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'fr');
      html.style.fontFamily = '';
    }
  }, [isRTL]);

  // Listen for settings changes from SettingsPage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.language && parsed.language !== language) {
            setLanguageState(parsed.language);
          }
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations as TranslationKeys, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
