import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Calendar, Users, FileText, TrendingUp, TrendingDown, CheckCircle, Clock, Printer, ShieldCheck, Mail, CheckCircle2, BookOpen, FlaskConical, MessageSquare, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

const scheduleData = [
  { time: '08:00 - 09:20', class: '101-guruh', subject: 'Oliy matematika', room: 'Auditoriya 101' },
  { time: '09:30 - 10:50', class: '102-guruh', subject: 'Oliy matematika', room: 'Auditoriya 102' },
  { time: '11:00 - 12:20', class: '201-guruh', subject: 'Fizika', room: 'Auditoriya 205' },
  { time: '12:30 - 13:50', class: '301-guruh', subject: 'IAKT', room: 'Auditoriya 301' },
];

const studentsData = [
  { id: 1, name: 'Aliyev Vali', grade: '101-guruh', average: 85, attendance: '98%' },
  { id: 2, name: 'Karimova Aziza', grade: '101-guruh', average: 92, attendance: '100%' },
  { id: 3, name: 'Umarov Jasur', grade: '201-guruh', average: 78, attendance: '95%' },
  { id: 4, name: 'Toshmatova Laylo', grade: '301-guruh', average: 88, attendance: '92%' },
];

const reportsData = [
  { id: 1, title: 'Oktabr oyi o\'zlashtirish hisoboti', date: '2023-11-01', status: 'Tasdiqlangan' },
  { id: 2, title: 'I chorak yakuniy hisoboti', date: '2023-11-05', status: 'Kutilmoqda' },
  { id: 3, title: 'Ochiq dars bayonnomasi', date: '2023-11-10', status: 'Jarayonda' },
];

const performanceData = [
  { name: 'Sentabr', ortalama_baho: 75, davomat: 95 },
  { name: 'Oktabr', ortalama_baho: 82, davomat: 96 },
  { name: 'Noyabr', ortalama_baho: 85, davomat: 93 },
  { name: 'Dekabr', ortalama_baho: 88, davomat: 97 },
];

// Demo data for the Summary section based on other sections theoretically
const yearlySummaryData = [
  { id: 1, label: "O'quv yuklama (soatda)", plan: 850, actual: 420 },
  { id: 2, label: "O'quv-uslubiy ishlar", plan: 150, actual: 120 },
  { id: 3, label: "Ilmiy-tadqiqot ishlari", plan: 200, actual: 150 },
  { id: 4, label: "Ustoz-shogird ishlari", plan: 100, actual: 80 },
];

export default function PedagogDashboard() {
  const [departmentConclusion, setDepartmentConclusion] = useState("Kafedrada yil davomida bajarilgan ishlar qoniqarli deb topildi.");
  const [facultyDecision, setFacultyDecision] = useState("O'qituvchining yillik ishlari tasdiqlandi.");
  const [assignedGroups, setAssignedGroups] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchUserAndGroups = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const groupsJson = localStorage.getItem('teacher_groups_' + user.id);
        if (groupsJson) {
          try {
            setAssignedGroups(JSON.parse(groupsJson));
          } catch (e) {}
        }
      }
    };
    fetchUserAndGroups();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professor-o'qituvchi Boshqaruv Paneli</h1>
          <p className="mt-2 text-gray-600">
            Xush kelibsiz! Bugungi rejalaringiz va umumiy statistikangiz bilan tanishing (Demo rejim).
          </p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          Bugun: {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Barcha talabalar</p>
            <p className="text-2xl font-bold text-gray-900">124</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">O'rtacha o'zlashtirish</p>
            <p className="text-2xl font-bold text-gray-900">84.5%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Calendar className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Bugungi darslar</p>
            <p className="text-2xl font-bold text-gray-900">4 ta</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Kutilayotgan hisobotlar</p>
            <p className="text-2xl font-bold text-gray-900">2 ta</p>
          </div>
        </div>
      </div>

      {/* Assigned Groups Section */}
      {assignedGroups.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hidden-print mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Biriktirilgan guruhlar
          </h2>
          <div className="flex flex-wrap gap-3">
            {assignedGroups.map(g => (
              <div key={g.id} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 font-bold text-indigo-700 shadow-sm">
                {g.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFESSOR-O'QITUVCHINING O'QUV YILI DAVOMIDA BAJARGAN ISHLARI SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 my-8 relative overflow-hidden transition-colors">
        {/* Print Button */}
        <div className="absolute top-8 right-8 z-20">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-gray-700 dark:text-gray-200 font-semibold shadow-sm"
          >
            <Printer className="w-5 h-5" /> Chop qilish
          </button>
        </div>

        <div className="mb-10 max-w-2xl relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight mb-2">
            Professor-o'qituvchining o'quv yili davomida bajargan ishlari
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Yillik yakuniy hisobot va tahlillar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative z-10">
          {yearlySummaryData.map((item, index) => {
            const diffPerc = item.plan > 0 ? Math.round(((item.actual - item.plan) / item.plan) * 100) : 0;
            const percent = Math.min(100, Math.round((item.actual / item.plan) * 100));
            
            return (
              <motion.div 
                key={item.id}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl group-hover:scale-110 transition-transform">
                    {item.id === 1 && <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                    {item.id === 2 && <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                    {item.id === 3 && <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                    {item.id === 4 && <Users className="w-6 h-6 text-green-600 dark:text-green-400" />}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">FARQ</span>
                    <div className={`text-sm font-extrabold ${diffPerc >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1`}>
                      {diffPerc >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                      {diffPerc > 0 ? `+${diffPerc}%` : `${diffPerc}%`}
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 leading-tight">{item.label}</h3>
                
                <div className="mt-auto space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Haqiqat</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.actual} <span className="text-gray-400 dark:text-gray-500 font-normal">/ {item.plan}</span></span>
                  </div>
                  
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        item.id === 1 ? 'bg-indigo-500 dark:bg-indigo-400' : 
                        item.id === 2 ? 'bg-blue-500 dark:bg-blue-400' : 
                        item.id === 3 ? 'bg-purple-500 dark:bg-purple-400' : 
                        'bg-green-500 dark:bg-green-400'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 relative z-10">
          <div className="relative bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-3xl p-8 shadow-sm overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 transition-transform group-hover:scale-110 duration-500">
              <MessageSquare className="w-48 h-48 text-blue-600" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-2xl shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Kafedra yig'ilishi xulosasi</h3>
              </div>
              <div className="flex-1 bg-white/60 dark:bg-gray-900/50 backdrop-blur-md border border-white/40 dark:border-gray-700 p-5 rounded-2xl shadow-inner">
                <textarea 
                  readOnly
                  value={departmentConclusion}
                  className="w-full h-full min-h-[100px] bg-transparent border-none text-gray-700 dark:text-gray-300 text-base leading-relaxed resize-none focus:outline-none"
                  placeholder="Xulosani kiriting (Admin tomonidan to'ldiriladi)..."
                />
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-3xl p-8 shadow-sm overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 transition-transform group-hover:scale-110 duration-500">
              <Award className="w-48 h-48 text-purple-600" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 rounded-2xl shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fakultet kengashi qarori</h3>
              </div>
              <div className="flex-1 bg-white/60 dark:bg-gray-900/50 backdrop-blur-md border border-white/40 dark:border-gray-700 p-5 rounded-2xl shadow-inner">
                <textarea 
                  readOnly
                  value={facultyDecision}
                  className="w-full h-full min-h-[100px] bg-transparent border-none text-gray-700 dark:text-gray-300 text-base leading-relaxed resize-none focus:outline-none"
                  placeholder="Qarorni kiriting (Admin tomonidan to'ldiriladi)..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 text-white shadow-xl">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px]"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Hujjat holati</h3>
            <p className="text-2xl font-bold text-white">Tasdiqlash jarayoni</p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4 md:gap-12 flex-1 justify-end w-full md:w-auto">
            {/* Line connector for sm+ */}
            <div className="hidden sm:block absolute left-10 right-10 top-[20px] h-0.5 bg-gray-800 z-0"></div>

            <div className="relative z-10 flex items-center sm:flex-col gap-4 sm:gap-3 bg-gray-900 sm:bg-transparent pr-4 sm:pr-0">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)] ring-4 ring-gray-900 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left sm:text-center">
                <div className="text-sm text-gray-400 font-medium tracking-wide">O'qituvchi</div>
                <div className="font-bold text-green-400">Tasdiqladi</div>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center sm:flex-col gap-4 sm:gap-3 bg-gray-900 sm:bg-transparent px-4 sm:px-0">
              <div className="w-10 h-10 rounded-full bg-gray-800 border overflow-hidden border-gray-600 flex items-center justify-center ring-4 ring-gray-900 shrink-0 relative">
                <Clock className="w-5 h-5 text-gray-400 z-10" />
                <motion.div 
                  className="absolute inset-0 bg-indigo-500/20"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="text-left sm:text-center">
                <div className="text-sm text-gray-400 font-medium tracking-wide">Kafedra mudiri</div>
                <div className="font-bold text-gray-300">Kutilmoqda</div>
              </div>
            </div>

            <div className="relative z-10 flex items-center sm:flex-col gap-4 sm:gap-3 bg-gray-900 sm:bg-transparent pl-4 sm:pl-0">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center ring-4 ring-gray-900 shrink-0">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
              <div className="text-left sm:text-center">
                <div className="text-sm text-gray-500 font-medium tracking-wide">Dekan</div>
                <div className="font-bold text-gray-500">Kutilmoqda</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Schedule & Updates */}
        <div className="lg:col-span-1 space-y-8">
          {/* Dars Jadvali */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center"><Calendar className="w-5 h-5 mr-2 text-indigo-600" /> Bugungi Darslar</h2>
              <span className="text-indigo-600 text-sm font-medium cursor-pointer hover:underline">Barchasi</span>
            </div>
            <div className="space-y-4">
              {scheduleData.map((item, i) => (
                <div key={i} className="flex items-start p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center bg-gray-100 text-gray-700 rounded-lg p-2 w-16 shrink-0 mr-4">
                    <span className="text-xs font-semibold">{item.time.split(' - ')[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.subject}</h4>
                    <p className="text-sm text-gray-500">{item.class} • {item.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hisobotlar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center"><FileText className="w-5 h-5 mr-2 text-indigo-600" /> Oxirgi Hisobotlar</h2>
            </div>
            <div className="space-y-4">
              {reportsData.map((report) => (
                <div key={report.id} className="p-4 border border-gray-100 rounded-xl">
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{report.date}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      report.status === 'Tasdiqlangan' ? 'bg-green-100 text-green-700' :
                      report.status === 'Kutilmoqda' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Charts & Students */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Statistika Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-indigo-600" /> O'zlashtirish va Davomat Statistikasi</h2>
            <div className="h-72 w-full min-h-[1px] min-w-[1px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line yAxisId="left" type="monotone" name="O'rtacha baho" dataKey="ortalama_baho" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 8}} />
                  <Line yAxisId="right" type="monotone" name="Davomat (%)" dataKey="davomat" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Talabalar Ro'yxati */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-600" /> A'lochi Talabalar Top-4</h2>
              <button className="text-sm text-indigo-600 font-medium hover:underline">Barcha talabalar</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4 rounded-tl-xl">Talaba F.I.O</th>
                    <th className="py-3 px-4">Guruh</th>
                    <th className="py-3 px-4">O'rtacha baho</th>
                    <th className="py-3 px-4 rounded-tr-xl">Davomat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {studentsData.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 shrink-0">
                          {(student.name || 'T').charAt(0).toUpperCase()}
                        </div>
                        {student.name || 'Talaba'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.grade}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 mr-2">{student.average}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${student.average}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.attendance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
