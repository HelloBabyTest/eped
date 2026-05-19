import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, LayoutDashboard, FileText, Users, ArrowRight, Target, Lightbulb, Shield, UserCircle2, Code2, Rocket, MapPin, Mail, ArrowUp, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 pt-16 relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full">
              {t('heroSubtitle')}
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
              {t('heroTitle')} <br />
              <span className="text-indigo-600 dark:text-indigo-400">{t('heroTitleBold')}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              {t('heroDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {t('startNow')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-gray-700 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all"
              >
                {t('loginSystem')}
              </Link>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: LayoutDashboard,
                title: t('feature1Title') || "Shaxsiy Kabinet",
                desc: t('feature1Desc') || "Har bir professor-o'qituvchi uchun qulay va intuitiv boshqaruv paneli."
              },
              {
                icon: FileText,
                title: t('feature2Title') || "Elektron Hisobotlar",
                desc: t('feature2Desc') || "Qog'ozbozlikdan voz keching, barcha hisobotlar raqamli formatda."
              },
              {
                icon: Users,
                title: t('feature3Title') || "Rahbariyat Nazorati",
                desc: t('feature3Desc') || "O'quv jarayonini real vaqt rejimida kuzatish va tahlil qilish."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{t('aboutUs')}</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              {t('aboutDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl"><Target className="w-6 h-6" /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('goalsTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{t('goalsDesc')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-xl"><Lightbulb className="w-6 h-6" /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('innovationTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{t('innovationDesc')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-xl"><Shield className="w-6 h-6" /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('securityTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{t('securityDesc')}</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-700 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/30 rounded-full text-indigo-100 text-sm font-bold mb-6 border border-indigo-400/30">
                  <UserCircle2 className="w-4 h-4" /> {t('founderSubtitle')}
                </div>
                <h3 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                  OTABEK CHORIYEV
                </h3>
                <p className="text-indigo-100 text-lg md:text-xl max-w-2xl leading-relaxed italic border-l-4 border-indigo-400 pl-6">
                  {t('founderQuote')}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 mt-10">
                  <div className="flex items-center gap-2 text-indigo-50 bg-indigo-900/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <Code2 className="w-5 h-5 text-indigo-300" /> <span className="font-medium">{t('edtechInnovator')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-50 bg-indigo-900/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <Rocket className="w-5 h-5 text-indigo-300" /> <span className="font-medium">{t('digitalEdu')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: t('statLabel1'), value: "10,000+" },
              { label: t('statLabel2'), value: "50+" },
              { label: t('statLabel3'), value: "1M+" },
              { label: t('statLabel4'), value: "95%" }
            ].map((stat, i) => (
              <div key={i} className="text-white bg-indigo-800/50 p-6 rounded-2xl backdrop-blur-sm border border-indigo-700">
                <div className="text-4xl font-bold mb-3 drop-shadow-lg">{stat.value}</div>
                <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact Section */}
      <footer className="bg-gray-900 border-t border-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('footerTitle')}</h3>
              <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
                {t('footerDesc')}
              </p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <h4 className="text-lg font-bold text-white mb-2">{t('contactUs')}</h4>
              
              <div className="flex items-start gap-4 justify-start bg-gray-800/50 p-4 rounded-xl border border-gray-700 w-full max-w-md hover:bg-gray-800 transition-colors">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{t('addressLabel')}</div>
                  <div className="text-gray-200 text-sm leading-relaxed">
                    {t('addressVal')}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 justify-start bg-gray-800/50 p-4 rounded-xl border border-gray-700 w-full max-w-md hover:bg-gray-800 transition-colors">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{t('emailLabel')}</div>
                  <a href="mailto:otabekyoqubovich@gmail.com" className="text-gray-200 text-sm hover:text-indigo-400 transition-colors font-medium">
                    otabekyoqubovich@gmail.com
                  </a>
                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} {t('copyrightText')}
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all z-50 group flex items-center justify-center"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
