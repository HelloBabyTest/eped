import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { History, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function GlobalHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tables = ['academic_works', 'methodical_works', 'scientific_works', 'mentor_works'];
      let allLogs: any[] = [];

      for (const table of tables) {
        const { data } = await supabase
          .from(table)
          .select('table_data')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.table_data) {
          const rawData = data.table_data as any;
          if (rawData.historyLogs && Array.isArray(rawData.historyLogs)) {
            // Append table source to logs
            const mappedLogs = rawData.historyLogs.map((log: any) => ({
              ...log,
              sourceTable: table
            }));
            allLogs = [...allLogs, ...mappedLogs];
          }
        }
      }

      // Sort globally by date descending
      allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLogs(allLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getTableName = (table: string) => {
    switch (table) {
      case 'academic_works': return 'O\'quv ishlari';
      case 'methodical_works': return 'O\'quv-uslubiy ishlari';
      case 'scientific_works': return 'Ilmiy ishlar';
      case 'mentor_works': return 'Ustoz-shogird ishlari';
      default: return table;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <History className="w-8 h-8 text-indigo-600" />
          O'zgarishlar tarixi (Umumiy)
        </h1>
        <button onClick={fetchHistory} className="p-2 bg-white rounded-xl shadow border border-gray-200 text-gray-600 hover:text-indigo-600 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center text-gray-500 text-lg">
          Hozircha o'zgarishlar tarixi bo'sh.
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-4">
            {logs.map((log, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx} 
                className="p-5 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 items-center">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg">
                      {getTableName(log.sourceTable)}
                    </span>
                    <span className="px-3 py-1 bg-white text-gray-600 font-bold text-xs shadow-sm rounded-lg">
                      Qator: {log.row + 1}
                    </span>
                    {log.semester && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-bold text-xs rounded-lg">
                        {log.semester === 'kuzgi' ? 'Kuzgi' : 'Bahorgi'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-500">
                    {new Date(log.date).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-800 text-sm font-medium mb-3">
                  Ustun o'zgartirildi (Haqiqatda).
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-red-100/50 text-red-700 rounded-xl text-sm font-bold border border-red-200/50 line-through">
                    {log.oldVal || '0'}
                  </div>
                  <span className="text-gray-400 font-bold">→</span>
                  <div className="px-4 py-2 bg-green-100/50 text-green-700 rounded-xl text-sm font-bold border border-green-200/50">
                    {log.newVal || '0'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
