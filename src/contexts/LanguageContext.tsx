import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'uz' | 'ru' | 'en';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  dashboard: {
    uz: 'Boshqaruv paneli',
    ru: 'Панель управления',
    en: 'Dashboard',
  },
  personalNotes: {
    uz: 'Shaxsiy qaydnomalar',
    ru: 'Личные заметки',
    en: 'Personal Notes',
  },
  addNote: {
    uz: 'Yangi qayd qo\'shish',
    ru: 'Добавить заметку',
    en: 'Add Note',
  },
  title: {
    uz: 'Sarlavha',
    ru: 'Заголовок',
    en: 'Title',
  },
  content: {
    uz: 'Mazmuni',
    ru: 'Содержание',
    en: 'Content',
  },
  file: {
    uz: 'Fayl',
    ru: 'Файл',
    en: 'File',
  },
  save: {
    uz: 'Saqlash',
    ru: 'Сохранить',
    en: 'Save',
  },
  cancel: {
    uz: 'Bekor qilish',
    ru: 'Отмена',
    en: 'Cancel',
  },
  logout: {
    uz: 'Chiqish',
    ru: 'Выход',
    en: 'Logout',
  },
  noNotes: {
    uz: 'Hozircha qaydnomalar yo\'q',
    ru: 'Заметок пока нет',
    en: 'No notes yet',
  },
  download: {
    uz: 'Yuklab olish',
    ru: 'Скачать',
    en: 'Download',
  },
  delete: {
    uz: 'O\'chirish',
    ru: 'Удалить',
    en: 'Delete',
  },
  academicWork: {
    uz: 'O\'QUV ISHLARI',
    ru: 'УЧЕБНАЯ РАБОТА',
    en: 'ACADEMIC WORK',
  },
  methodicalWork: {
    uz: 'OʻQUV-USLUBIY ISHLAR',
    ru: 'УЧЕБНО-МЕТОДИЧЕСКАЯ РАБОТА',
    en: 'METHODICAL WORK',
  },
  scientificWork: {
    uz: 'ILMIY-TADQIQOT ISHLARI',
    ru: 'НАУЧНО-ИССЛЕДОВАТЕЛЬСКАЯ РАБОТА',
    en: 'SCIENTIFIC WORK',
  },
  masterApprentice: {
    uz: 'USTOZ-SHOGIRD ISHLARI',
    ru: 'РАБОТА МАСТЕР-УЧЕНИК',
    en: 'MASTER-APPRENTICE',
  },
  annualWork: {
    uz: 'YILLIK BAJARILGAN ISHLAR',
    ru: 'ГОДОВАЯ ВЫПОЛНЕННАЯ РАБОТА',
    en: 'ANNUAL COMPLETED WORK',
  },
  norms: {
    uz: 'ME’YORLAR',
    ru: 'НОРМЫ',
    en: 'NORMS',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as Language) || 'uz';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', language);
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
