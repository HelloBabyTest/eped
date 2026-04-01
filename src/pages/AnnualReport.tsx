import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, AlertCircle, CheckCircle, FileText, PenTool, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AnnualReport() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('annual_summaries')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Agar hisobot mavjud bo'lmasa, yangi obyekt yaratamiz
        setReport({
          user_id: user.id,
          summary_data: {
            academic: { plan: 0, actual: 0, percent: 0 },
            methodical: { plan: 0, actual: 0, percent: 0 },
            scientific: { plan: 0, actual: 0, percent: 0 },
            mentor: { plan: 0, actual: 0, percent: 0 }
          },
          department_conclusion: '',
          faculty_decision: ''
        });
      } else {
        setReport(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (section: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newSummaryData = { ...report.summary_data };
    newSummaryData[section][field] = numValue;
    
    // Foizni hisoblash
    if (newSummaryData[section].plan > 0) {
      newSummaryData[section].percent = Math.round((newSummaryData[section].actual / newSummaryData[section].plan) * 100);
    } else {
      newSummaryData[section].percent = 0;
    }

    setReport({ ...report, summary_data: newSummaryData });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('annual_summaries')
        .upsert(report, { onConflict: 'user_id' });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const sections = [
    { id: 'academic', label: 'O\'quv yuklama (soatda)' },
    { id: 'methodical', label: 'O\'quv-uslubiy ishlar' },
    { id: 'scientific', label: 'Ilmiy-tadqiqot ishlari' },
    { id: 'mentor', label: 'Ustoz-shogird ishlari' }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase">Professor-o'qituvchining o'quv yili davomida bajargan ishlari</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Yillik yakuniy hisobot va tahlillar</p>
      </div>

      <div className="space-y-8">
        {/* Statistics Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Yo'nalishlar</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Reja</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Haqiqat</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Farq (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{section.label}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={report.summary_data[section.id].plan}
                        onChange={(e) => handleDataChange(section.id, 'plan', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none text-center py-1 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={report.summary_data[section.id].actual}
                        onChange={(e) => handleDataChange(section.id, 'actual', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none text-center py-1 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${report.summary_data[section.id].percent >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        {report.summary_data[section.id].percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Kafedra yig'ilishining xulosasi
            </h3>
            <textarea
              value={report.department_conclusion}
              onChange={(e) => setReport({ ...report, department_conclusion: e.target.value })}
              className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="Xulosani kiriting..."
            />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Fakultet kengashi qarori
            </h3>
            <textarea
              value={report.faculty_decision}
              onChange={(e) => setReport({ ...report, faculty_decision: e.target.value })}
              className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="Qarorni kiriting..."
            />
          </div>
        </div>

        {/* Signatures Status */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
          <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-4">Tasdiqlash holati</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${report.teacher_signed_at ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-gray-600 dark:text-gray-400">O'qituvchi:</span>
              <span className="font-semibold dark:text-white">{report.teacher_signed_at ? 'Imzolangan' : 'Kutilmoqda'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${report.head_of_dept_signed_at ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-gray-600 dark:text-gray-400">Kafedra mudiri:</span>
              <span className="font-semibold dark:text-white">{report.head_of_dept_signed_at ? 'Tasdiqlangan' : 'Kutilmoqda'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${report.dean_signed_at ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-gray-600 dark:text-gray-400">Dekan:</span>
              <span className="font-semibold dark:text-white">{report.dean_signed_at ? 'Tasdiqlangan' : 'Kutilmoqda'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Hisobotni saqlash
          </button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-5 h-5" />
              Muvaffaqiyatli saqlandi!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
