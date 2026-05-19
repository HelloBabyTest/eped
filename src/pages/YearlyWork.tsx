import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Printer, BookOpen, FileText, FlaskConical, Users, 
  TrendingUp, TrendingDown, CheckCircle2, Clock, XCircle,
  Award, ShieldCheck, Download, Eye, Calendar,
  BarChart2, PieChart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const summaryData = [
  { id: 1, label: "O'quv yuklama", plan: 850, actual: 420 },
  { id: 2, label: "O'quv-uslubiy ishlar", plan: 150, actual: 120 },
  { id: 3, label: "Ilmiy-tadqiqot ishlari", plan: 200, actual: 150 },
  { id: 4, label: "Ustoz-shogird ishlari", plan: 100, actual: 80 },
];

const detailedTasks = [
  { id: 1, type: "O'quv", title: "Ma'ruza darslari o'tish", hours: 180, date: "Sentabr - Dekabr", status: "Bajarildi" },
  { id: 2, type: "O'quv-uslubiy", title: "Oliy matematika fanidan o'quv qo'llanma", hours: 50, date: "Noyabr", status: "Jarayonda" },
  { id: 3, type: "Ilmiy", title: "Scopus bazasidagi jurnalda maqola", hours: 40, date: "Oktabr", status: "Bajarildi" },
  { id: 4, type: "Ustoz-shogird", title: "Iqtidorli talabalar bilan ishlash", hours: 25, date: "Doimiy", status: "Bajarildi" },
  { id: 5, type: "O'quv", title: "Amaliy mashg'ulotlar", hours: 240, date: "Sentabr - Yanvar", status: "Bajarildi" },
];

export default function YearlyWork({ adminUserId, isTasdiqlovchi }: { adminUserId?: string, isTasdiqlovchi?: boolean }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  const [isApproved, setIsApproved] = useState(false);
  useEffect(() => {
    const fetchAppr = async () => {
      let uid = adminUserId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) uid = user.id;
      }
      if (uid) {
        setIsApproved(localStorage.getItem('approved_yearly_' + uid) === 'true');
      }
    };
    fetchAppr();
  }, [adminUserId]);

  const toggleApproval = () => {
      if (!adminUserId) return;
      const newVal = !isApproved;
      setIsApproved(newVal);
      localStorage.setItem('approved_yearly_' + adminUserId, newVal ? 'true' : 'false');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
              <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Yillik Bajarilgan Ishlar</h1>
            {isApproved && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-lg flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Tasdiqlandi
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Professor-o'qituvchining o'quv yili davomida bajargan ishlari hisoboti</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm print:hidden"
          >
            <Printer className="w-4 h-4" /> Chop etish
          </button>
          
          {isTasdiqlovchi && (
             <button
               onClick={toggleApproval}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm ${isApproved ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.3)]'}`}
             >
               {isApproved ? (
                 <>
                   <XCircle className="w-4 h-4" />
                   Tasdiqni bekor qilish
                 </>
               ) : (
                 <>
                   <CheckCircle2 className="w-4 h-4" />
                   Tasdiqlash
                 </>
               )}
             </button>
          )}

          {!isTasdiqlovchi && (
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all font-semibold text-gray-700 dark:text-gray-200 print:hidden">
                <Download className="w-4 h-4" /> PDF Yuklash
             </button>
          )}
        </div>
      </div>

      <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
        >
          <BarChart2 className="w-4 h-4" />
          Umumiy Tahlil
        </button>
        <button 
          onClick={() => setActiveTab('detailed')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'detailed' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
        >
          <FileText className="w-4 h-4" />
          Batafsil Ro'yxat
        </button>
      </div>

      {activeTab === 'overview' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryData.map((item, index) => {
              const percent = Math.min(100, Math.round((item.actual / item.plan) * 100));
              const diff = item.actual - item.plan;
              
              return (
                <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:scale-110 transition-transform">
                      {item.id === 1 && <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                      {item.id === 2 && <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                      {item.id === 3 && <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                      {item.id === 4 && <Users className="w-6 h-6 text-green-600 dark:text-green-400" />}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-400 uppercase">Bajarilish</span>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{percent}%</div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-6">{item.label}</h3>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Soat</span>
                      <span className="font-bold text-gray-900 dark:text-white">{item.actual} <span className="text-gray-400 font-normal">/ {item.plan}</span></span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full ${
                          item.id === 1 ? 'bg-indigo-500' : 
                          item.id === 2 ? 'bg-blue-500' : 
                          item.id === 3 ? 'bg-purple-500' : 
                          'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Reja va Haqiqat (Radar)</h3>
              <div className="h-80 w-full min-h-[1px] min-w-[1px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={summaryData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={{ fill: '#9ca3af' }} />
                    <Radar name="Reja" dataKey="plan" stroke="#9ca3af" fill="#f3f4f6" fillOpacity={0.6} />
                    <Radar name="Haqiqat" dataKey="actual" stroke="#4f46e5" fill="#c7d2fe" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Taqqoslash (Bar)</h3>
              <div className="h-80 w-full min-h-[1px] min-w-[1px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={summaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="plan" name="O'quv yili rejasi" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Bajarilgan soat" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Approval Workflow */}
          <div className="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck className="w-64 h-64 text-indigo-300 mix-blend-overlay" />
            </div>
            
            <div className="relative z-10 mb-8">
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Hujjat holati</h3>
              <p className="text-2xl font-bold text-white">Yillik hisobotni tasdiqlash jarayoni</p>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Process line for md+ */}
              <div className="hidden md:block absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-gray-800 z-0"></div>

              <div className="relative z-10 flex items-center md:flex-col gap-4 md:gap-3 pl-4 md:pl-0">
                <div className="w-12 h-12 rounded-full bg-green-500 lg:bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] ring-4 ring-gray-900 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-left md:text-center">
                  <div className="text-sm text-gray-400 font-medium tracking-wide">O'qituvchi</div>
                  <div className="font-bold text-green-400">Tasdiqladi</div>
                  <div className="text-xs text-gray-500 mt-1">12-Iyun, 14:30</div>
                </div>
              </div>
              
              <div className="relative z-10 flex items-center md:flex-col gap-4 md:gap-3 px-4 md:px-0 bg-gray-900/50 md:bg-transparent rounded-xl p-2 md:p-0">
                <div className="w-12 h-12 rounded-full bg-gray-800 border overflow-hidden border-indigo-500 flex items-center justify-center ring-4 ring-gray-900 shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-left md:text-center">
                  <div className="text-sm text-gray-400 font-medium tracking-wide">Kafedra mudiri</div>
                  <div className="font-bold text-indigo-300">Kutilmoqda</div>
                  <div className="text-xs text-indigo-500/70 mt-1">Ko'rib chiqilmoqda</div>
                </div>
              </div>

              <div className="relative z-10 flex items-center md:flex-col gap-4 md:gap-3 pr-4 md:pr-0">
                <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center ring-4 ring-gray-900 shrink-0">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-left md:text-center">
                  <div className="text-sm text-gray-500 font-medium tracking-wide">Dekan</div>
                  <div className="font-bold text-gray-600">Navbatda</div>
                  <div className="text-xs text-gray-600 mt-1">Navbat kutilmoqda</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'detailed' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Bajarilgan ishlar reestri
            </h3>
            <div className="flex gap-2">
              <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow">
                <option>Barcha yo'nalishlar</option>
                <option>O'quv ishlari</option>
                <option>O'quv-uslubiy</option>
                <option>Ilmiy ishlari</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">T/r</th>
                  <th className="px-6 py-4">Yo'nalish</th>
                  <th className="px-6 py-4">Ish mavzusi / nomi</th>
                  <th className="px-6 py-4">Soat</th>
                  <th className="px-6 py-4">Sana / Muddat</th>
                  <th className="px-6 py-4 text-center">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {detailedTasks.map((task, index) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        task.type === "O'quv" ? 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800/30 dark:text-indigo-400' :
                        task.type === "O'quv-uslubiy" ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800/30 dark:text-blue-400' :
                        task.type === "Ilmiy" ? 'bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800/30 dark:text-purple-400' :
                        'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/30 dark:border-green-800/30 dark:text-green-400'
                      }`}>
                        {task.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-bold">{task.hours} s</td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {task.date}</td>
                    <td className="px-6 py-4 text-center text-sm">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        task.status === "Bajarildi" ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400'
                      }`}>
                        {task.status === "Bajarildi" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-center">
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Barchasini ko'rish &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* Formal Document Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-4 sm:p-8 font-serif text-black dark:text-white mt-8">
        <h2 className="text-center font-bold text-lg mb-6 italic uppercase">5. PROFESSOR-O'QITUVCHINING O'QUV YILI DAVOMIDA BAJARGAN ISHLARI</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black dark:border-white text-center text-sm md:text-base mb-8 min-w-[800px]">
            <thead>
              <tr>
                <th rowSpan={2} className="border border-black dark:border-white p-3 font-bold align-middle">FAOLIYAT TURLARI</th>
                <th rowSpan={2} className="border border-black dark:border-white p-3 font-bold align-middle">O'QUV YUKLAMA,<br/>SOATDA</th>
                <th colSpan={3} className="border border-black dark:border-white p-3 font-bold align-middle whitespace-nowrap">REJALASHTIRGAN ISH TURLARI SONIGA NISBATAN ANIQLANADI</th>
              </tr>
              <tr>
                <th className="border border-black dark:border-white p-3 font-bold align-middle whitespace-nowrap w-[20%]">O'QUV-USLUBIY<br/>ISHLAR</th>
                <th className="border border-black dark:border-white p-3 font-bold align-middle whitespace-nowrap w-[20%]">ILMIY-TADQIQOT<br/>ISHLARI</th>
                <th className="border border-black dark:border-white p-3 font-bold align-middle whitespace-nowrap w-[20%]">"USTOZ-SHOGIRD"<br/>ISHLARI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black dark:border-white p-3 font-bold text-center">REJA</td>
                <td className="border border-black dark:border-white p-3 font-bold">521</td>
                <td className="border border-black dark:border-white p-3 font-bold">1</td>
                <td className="border border-black dark:border-white p-3 font-bold">3</td>
                <td className="border border-black dark:border-white p-3 font-bold">2</td>
              </tr>
              <tr>
                <td className="border border-black dark:border-white p-3 font-bold text-center">HAQIQAT</td>
                <td className="border border-black dark:border-white p-3"></td>
                <td className="border border-black dark:border-white p-3"></td>
                <td className="border border-black dark:border-white p-3"></td>
                <td className="border border-black dark:border-white p-3"></td>
              </tr>
              <tr>
                <td className="border border-black dark:border-white p-3 font-bold text-center">FARQLANISHI, foizda</td>
                <td className="border border-black dark:border-white p-3"></td>
                <td className="border border-black dark:border-white p-3"></td>
                <td className="border border-black dark:border-white p-3"></td>
                <td className="border border-black dark:border-white p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-6 mt-8">
          <div>
            <div className="flex items-end mb-4">
              <span className="font-bold whitespace-nowrap mr-2 text-lg">Kafedra yig'ilishining xulosasi</span>
              <div className="flex-1 border-b border-black dark:border-white w-full h-5"></div>
            </div>
            <div className="border-b border-black dark:border-white w-full h-8"></div>
            <div className="border-b border-black dark:border-white w-full h-8"></div>
            <div className="border-b border-black dark:border-white w-full h-8"></div>
          </div>

          <div className="pt-4">
            <div className="flex items-end mb-4">
              <span className="font-bold whitespace-nowrap mr-2 text-lg">Fakultet kengashi qarori</span>
              <div className="flex-1 border-b border-black dark:border-white w-full h-5"></div>
            </div>
            <div className="border-b border-black dark:border-white w-full h-8"></div>
            <div className="border-b border-black dark:border-white w-full h-8"></div>
            <div className="border-b border-black dark:border-white w-full h-8"></div>
            <div className="border-b border-black dark:border-white w-full h-8"></div>
          </div>

          <div className="pt-8 space-y-6 ml-8 md:ml-16 max-w-xl">
            <div className="flex items-end">
              <span className="font-bold whitespace-nowrap w-56 text-lg">Professor-o'qituvchi</span>
              <div className="flex-1 border-b border-black dark:border-white"></div>
            </div>
            <div className="flex items-end">
              <span className="font-bold whitespace-nowrap w-56 text-lg">Kafedra mudiri</span>
              <div className="flex-1 border-b border-black dark:border-white"></div>
            </div>
            <div className="flex items-end">
              <span className="font-bold whitespace-nowrap w-56 text-lg">Fakultet dekani</span>
              <div className="flex-1 border-b border-black dark:border-white"></div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
