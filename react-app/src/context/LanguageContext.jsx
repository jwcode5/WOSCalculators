import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS } from '../data/i18n';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
  { value: "pl", label: "Polski" },
  { value: "ko", label: "한국어" },
  { value: "ja", label: "日本語" }
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('wosCalc_language');
    if (savedLang && TRANSLATIONS[savedLang]) {
      setLanguageState(savedLang);
    } else {
      const browserLang = navigator.language.substring(0, 2);
      if (TRANSLATIONS[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
      localStorage.setItem('wosCalc_language', lang);
    }
  };

  const t = useCallback((key, params = {}, fallback = "") => {
    const keys = key.split('.');
    let value = TRANSLATIONS[language];
    
    for (const k of keys) {
      if (value === undefined || value === null) break;
      value = value[k];
    }
    
    // Fallback to English if translation is missing
    if (value === undefined || value === null) {
      value = TRANSLATIONS['en'];
      for (const k of keys) {
        if (value === undefined || value === null) break;
        value = value[k];
      }
    }
    
    if (value === undefined || value === null) {
      return fallback || key;
    }
    
    let result = String(value);
    Object.keys(params).forEach(k => {
      result = result.replace(new RegExp(`{${k}}`, 'g'), params[k]);
    });
    
    return result;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
