import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, LayoutDashboard, FileText, Users, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white pt-16">
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
              {t('heroBadge')}
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              {t('heroTitle1')} <br />
              <span className="text-indigo-600">{t('heroTitle2')}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
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
                {t('loginBtn')}
              </Link>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: LayoutDashboard,
                title: t('feat1Title'),
                desc: t('feat1Desc')
              },
              {
                icon: FileText,
                title: t('feat2Title'),
                desc: t('feat2Desc')
              },
              {
                icon: Users,
                title: t('feat3Title'),
                desc: t('feat3Desc')
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: t('statTeachers'), value: "10,000+" },
              { label: t('statSchools'), value: "500+" },
              { label: t('statReports'), value: "1M+" },
              { label: t('statEfficiency'), value: "95%" }
            ].map((stat, i) => (
              <div key={i} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-indigo-100 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
