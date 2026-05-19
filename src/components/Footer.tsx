import { BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">E-Pedagog</span>
          </div>
          
          <div className="flex gap-8 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('aboutUsFooter')}</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('helpFooter')}</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('privacyPolicy')}</a>
          </div>
          
          <div className="text-sm text-gray-400 dark:text-gray-500">
            {t('rightsReserved')}
          </div>
        </div>
      </div>
    </footer>
  );
}
