"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from 'react';
import { en } from './locales/en';
import { zhTW } from './locales/zh-TW';

export type Language = 'en' | 'zh-TW';
export type Translations = typeof en;

interface I18nContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
}

const translations = {
  en,
  'zh-TW': zhTW,
};

export const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'zh-TW')) {
        setLanguage(savedLang);
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }
    
    return value || key;
  };

  const contextValue = React.useMemo(
    () => ({
      language,
      t,
      setLanguage: handleSetLanguage,
    }),
    [language]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
} 