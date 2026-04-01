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
  // Landing Page Translations
  heroBadge: {
    uz: 'Zamonaviy Ta\'lim Tizimi',
    ru: 'Современная Система Образования',
    en: 'Modern Education System',
  },
  heroTitle1: {
    uz: 'O\'qituvchilar uchun',
    ru: 'Для преподавателей',
    en: 'For Teachers',
  },
  heroTitle2: {
    uz: 'Elektron Ish Rejasi',
    ru: 'Электронный План Работы',
    en: 'Electronic Work Plan',
  },
  heroDesc: {
    uz: 'E-Pedagog platformasi orqali o\'z ish rejalaringizni boshqaring, hisobotlarni topshiring va ta\'lim sifatini yangi bosqichga olib chiqing.',
    ru: 'Управляйте своими планами работы, сдавайте отчеты и выводите качество образования на новый уровень через платформу E-Pedagog.',
    en: 'Manage your work plans, submit reports, and take the quality of education to a new level through the E-Pedagog platform.',
  },
  startNow: {
    uz: 'Hoziroq boshlang',
    ru: 'Начать сейчас',
    en: 'Start Now',
  },
  loginBtn: {
    uz: 'Tizimga kirish',
    ru: 'Войти в систему',
    en: 'Login',
  },
  feat1Title: {
    uz: 'Shaxsiy Kabinet',
    ru: 'Личный Кабинет',
    en: 'Personal Cabinet',
  },
  feat1Desc: {
    uz: 'Har bir o\'qituvchi uchun qulay va intuitiv boshqaruv paneli.',
    ru: 'Удобная и интуитивно понятная панель управления для каждого учителя.',
    en: 'A convenient and intuitive control panel for every teacher.',
  },
  feat2Title: {
    uz: 'Elektron Hisobotlar',
    ru: 'Электронные Отчеты',
    en: 'Electronic Reports',
  },
  feat2Desc: {
    uz: 'Qog\'ozbozlikdan voz keching, barcha hisobotlar raqamli formatda.',
    ru: 'Откажитесь от бумажной волокиты, все отчеты в цифровом формате.',
    en: 'Say goodbye to paperwork, all reports are in digital format.',
  },
  feat3Title: {
    uz: 'Rahbariyat Nazorati',
    ru: 'Контроль Руководства',
    en: 'Management Control',
  },
  feat3Desc: {
    uz: 'O\'quv jarayonini real vaqt rejimida kuzatish va tahlil qilish.',
    ru: 'Мониторинг и анализ учебного процесса в режиме реального времени.',
    en: 'Monitoring and analyzing the educational process in real time.',
  },
  statTeachers: {
    uz: 'O\'qituvchilar',
    ru: 'Учителя',
    en: 'Teachers',
  },
  statSchools: {
    uz: 'Maktablar',
    ru: 'Школы',
    en: 'Schools',
  },
  statReports: {
    uz: 'Hisobotlar',
    ru: 'Отчеты',
    en: 'Reports',
  },
  statEfficiency: {
    uz: 'Samaradorlik',
    ru: 'Эффективность',
    en: 'Efficiency',
  },
  // Navbar Translations
  navLogin: {
    uz: 'Kirish',
    ru: 'Вход',
    en: 'Login',
  },
  navRegister: {
    uz: 'Ro\'yxatdan o\'tish',
    ru: 'Регистрация',
    en: 'Register',
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
