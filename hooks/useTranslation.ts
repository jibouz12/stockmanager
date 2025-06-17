import { useState, useEffect } from 'react';
import { TranslationService, Language } from '@/services/TranslationService';

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    TranslationService.getCurrentLanguage()
  );

  useEffect(() => {
    TranslationService.initialize();
  }, []);

  const changeLanguage = async (language: Language) => {
    await TranslationService.setLanguage(language);
    setCurrentLanguage(language);
  };

  const t = (key: string, params?: { [key: string]: string | number }) => {
    return TranslationService.translate(key, params);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
  };
}