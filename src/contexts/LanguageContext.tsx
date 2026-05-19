import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'uz' | 'ru' | 'en';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  dashboard: {
    uz: 'BOSHQARUV PANELI',
    ru: 'ПАНЕЛЬ УПРАВЛЕНИЯ',
    en: 'DASHBOARD',
  },
  personalNotes: {
    uz: 'SHAXSIY QAYDNOMALAR',
    ru: 'ЛИЧНЫЕ ЗАМЕТКИ',
    en: 'PERSONAL NOTES',
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
    uz: 'CHIQISH',
    ru: 'ВЫХОД',
    en: 'LOGOUT',
  },
  profile: {
    uz: 'Profil',
    ru: 'Профиль',
    en: 'Profile',
  },
  login: {
    uz: 'Kirish',
    ru: 'Войти',
    en: 'Login',
  },
  register: {
    uz: 'Ro\'yxatdan o\'tish',
    ru: 'Регистрация',
    en: 'Register',
  },
  confirmLogoutTitle: {
    uz: 'Tizimdan chiqish',
    ru: 'Выход из системы',
    en: 'Logout',
  },
  confirmLogoutMsg: {
    uz: 'Haqiqatan ham tizimdan chiqmoqchimisiz?',
    ru: 'Вы действительно хотите выйти из системы?',
    en: 'Are you sure you want to log out?',
  },
  confirm: {
    uz: 'Tasdiqlash',
    ru: 'Подтвердить',
    en: 'Confirm',
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
  heroSubtitle: {
    uz: 'Zamonaviy Ta\'lim Tizimi',
    ru: 'Современная система образования',
    en: 'Modern Education System',
  },
  heroTitle: {
    uz: 'Professor-o\'qituvchilar uchun',
    ru: 'Для профессорско-преподавательского состава',
    en: 'For Teaching Staff',
  },
  heroTitleBold: {
    uz: 'Elektron Ish Rejasi',
    ru: 'Электронный план работы',
    en: 'Electronic Work Plan',
  },
  heroDesc: {
    uz: 'E-Pedagog platformasi orqali o\'z ish rejalaringizni boshqaring, hisobotlarni topshiring va ta\'lim sifatini yangi bosqichga olib chiqing.',
    ru: 'Управляйте своими планами работы, сдавайте отчеты и выводите качество образования на новый уровень с помощью платформы E-Pedagog.',
    en: 'Manage your work plans, submit reports, and take education quality to the next level through the E-Pedagog platform.',
  },
  startNow: {
    uz: 'Hoziroq boshlang',
    ru: 'Начать сейчас',
    en: 'Start right now',
  },
  loginSystem: {
    uz: 'Tizimga kirish',
    ru: 'Вход в систему',
    en: 'Login to system',
  },
  aboutUs: {
    uz: 'Biz Haqimizda',
    ru: 'О нас',
    en: 'About Us',
  },
  aboutDesc: {
    uz: 'Ushbu platforma ta\'lim tizimini raqamlashtirish va professor-o\'qituvchilar ishini yengillashtirish maqsadida ishlab chiqilgan.',
    ru: 'Данная платформа разработана с целью цифровизации системы образования и облегчения работы профессорско-преподавательского состава.',
    en: 'This platform has been developed to digitize the education system and ease the work of teaching staff.',
  },
  feature1Title: {
    uz: 'Shaxsiy Kabinet',
    ru: 'Личный кабинет',
    en: 'Personal Dashboard',
  },
  feature1Desc: {
    uz: 'Har bir professor-o\'qituvchi uchun qulay va intuitiv boshqaruv paneli.',
    ru: 'Удобная и интуитивно понятная панель управления для каждого преподавателя.',
    en: 'A convenient and intuitive dashboard for each teaching staff member.',
  },
  feature2Title: {
    uz: 'Elektron Hisobotlar',
    ru: 'Электронные отчеты',
    en: 'Electronic Reports',
  },
  feature2Desc: {
    uz: 'Qog\'ozbozlikdan voz keching, barcha hisobotlar raqamli formatda.',
    ru: 'Откажитесь от бумажной работы, все отчеты в цифровом формате.',
    en: 'Ditch the paperwork, all reports are in digital format.',
  },
  feature3Title: {
    uz: 'Rahbariyat Nazorati',
    ru: 'Контроль руководства',
    en: 'Management Control',
  },
  feature3Desc: {
    uz: 'O\'quv jarayonini real vaqt rejimida kuzatish va tahlil qilish.',
    ru: 'Наблюдение и анализ учебного процесса в режиме реального времени.',
    en: 'Monitor and analyze the educational process in real-time.',
  },
  goalsTitle: {
    uz: 'Maqsadimiz',
    ru: 'Наша цель',
    en: 'Our Goal',
  },
  goalsDesc: {
    uz: 'Ta\'lim muassasalarida hujjat aylanishini to\'liq raqamlashtirish va shaffoflikni ta\'minlash.',
    ru: 'Полная цифровизация документооборота в образовательных учреждениях и обеспечение прозрачности.',
    en: 'Total digitization of document flow in educational institutions and ensuring transparency.',
  },
  innovationTitle: {
    uz: 'Innovatsiya',
    ru: 'Инновация',
    en: 'Innovation',
  },
  innovationDesc: {
    uz: 'Eng zamonaviy texnologiyalar va sun\'iy intellekt yordamida jarayonlarni avtomatlashtirish.',
    ru: 'Автоматизация процессов с использованием самых современных технологий и искусственного интеллекта.',
    en: 'Process automation using the most advanced technologies and artificial intelligence.',
  },
  securityTitle: {
    uz: 'Xavfsizlik',
    ru: 'Безопасность',
    en: 'Security',
  },
  securityDesc: {
    uz: 'Foydalanuvchilar ma\'lumotlari xavfsizligini jahon standartlari darajasida ishonchli himoya qilish.',
    ru: 'Надежная защита данных пользователей по мировым стандартам безопасности.',
    en: 'Reliable protection of user data security at the level of world standards.',
  },
  founderSubtitle: {
    uz: 'PLATFORMA ASOSCHISI',
    ru: 'ОСНОВАТЕЛЬ ПЛАТФОРМЫ',
    en: 'PLATFORM FOUNDER',
  },
  founderQuote: {
    uz: '"Bizning asosiy vazifamiz — ustozlarning qimmatli vaqtini qog\'ozbozlikdan xalos etib, uni o\'quv jarayoni va ilmiy izlanishlarga sarflashlariga ko\'maklashishdir."',
    ru: '"Наша главная задача - освободить драгоценное время преподавателей от бумажной работы и помочь им потратить его на образовательный процесс и научные исследования."',
    en: '"Our main task is to save teachers\' precious time from paperwork and help them spend it on the educational process and scientific research."',
  },
  edtechInnovator: {
      uz: 'EdTech Innovator',
      ru: 'EdTech Инноватор',
      en: 'EdTech Innovator',
  },
  digitalEdu: {
      uz: 'Raqamli Ta\'lim',
      ru: 'Цифровое образование',
      en: 'Digital Education',
  },
  statLabel1: {
    uz: 'Professor-o\'qituvchilar',
    ru: 'Преподаватели',
    en: 'Teaching Staff',
  },
  statLabel2: {
    uz: 'OTMlar',
    ru: 'ВУЗы',
    en: 'Universities',
  },
  statLabel3: {
    uz: 'Hisobotlar',
    ru: 'Отчеты',
    en: 'Reports',
  },
  statLabel4: {
    uz: 'Samaradorlik',
    ru: 'Эффективность',
    en: 'Efficiency',
  },
  footerTitle: {
    uz: 'Elektron Ish Rejasi',
    ru: 'Электронный рабочий план',
    en: 'Electronic Work Plan',
  },
  footerDesc: {
    uz: 'Platforma ta\'lim tizimini raqamlashtirish va professor-o\'qituvchilar faoliyatini yengillashtirish maqsadida yaratilgan.',
    ru: 'Платформа создана с целью цифровизации системы образования и облегчения деятельности преподавателей.',
    en: 'The platform was created for the purpose of digitizing the education system and facilitating the activities of teachers.',
  },
  contactUs: {
    uz: 'Aloqa uchun',
    ru: 'Связаться с нами',
    en: 'Contact Us',
  },
  addressLabel: {
    uz: 'Manzil',
    ru: 'Адрес',
    en: 'Address',
  },
  addressVal: {
    uz: 'Uzbekistan, Toshkent, 100066, Tashkent, Islam Karimov street, 49',
    ru: 'Узбекистан, Ташкент, 100066, улица Ислама Каримова, 49',
    en: '49 Islam Karimov street, Tashkent 100066, Uzbekistan',
  },
  emailLabel: {
    uz: 'Elektron pochta',
    ru: 'Электронная почта',
    en: 'Email',
  },
  copyrightText: {
    uz: 'Elektron Ish Rejasi - Otabek Choriev. Barcha huquqlar himoyalangan.',
    ru: 'Электронный рабочий план - Отабек Чориев. Все права защищены.',
    en: 'Electronic Work Plan - Otabek Choriev. All rights reserved.',
  },
  aboutUsFooter: {
    uz: 'Biz haqimizda',
    ru: 'О нас',
    en: 'About us',
  },
  helpFooter: {
    uz: 'Yordam',
    ru: 'Помощь',
    en: 'Help',
  },
  privacyPolicy: {
    uz: 'Maxfiylik siyosati',
    ru: 'Политика конфиденциальности',
    en: 'Privacy Policy',
  },
  rightsReserved: {
    uz: '© 2026 E-Pedagog. Barcha huquqlar himoyalangan.',
    ru: '© 2026 E-Pedagog. Все права защищены.',
    en: '© 2026 E-Pedagog. All rights reserved.',
  }
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
