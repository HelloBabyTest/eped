import { BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">E-Pedagog</span>
          </div>
          
          <div className="flex flex-wrap gap-8 text-sm text-gray-500 dark:text-gray-400 justify-center md:justify-start">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('aboutUsFooter')}</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('helpFooter')}</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('privacyPolicy')}</a>
            <a href="https://singular-gaufre-324c93.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors">
              Muallif haqida ma'lumot
            </a>
          </div>
          
          <div className="text-sm text-gray-400 dark:text-gray-500 flex flex-col items-center md:items-end gap-1">
            <span>{t('rightsReserved')}</span>
            <span className="text-xs">
              Sayt muallifi: <a href="https://singular-gaufre-324c93.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Otabek Yoqubovich</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
