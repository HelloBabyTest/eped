import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Save, Loader2, AlertCircle, 
  Trash2, Columns, Rows, CheckCircle2, X,
  Pencil, RotateCcw, Printer, FileCheck, FileX, ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_TEMPLATE = [
  ["№", "Fan nomi", "Guruh(lar)", "Kurs", "Talabalar soni", "Ma'ruza", "Amaliy", "Haqiqatda (Fayl)"],
  ["1", "", "", "", "", "", "", ""]
];

type SemesterData = {
  kuzgi: string[][];
  bahorgi: string[][];
};

interface WorkProps {
  targetUserId?: string;
}

export default function AcademicWork({ targetUserId }: WorkProps) {
  const { t } = useLanguage();
  const [grid, setGrid] = useState<SemesterData>({ kuzgi: DEFAULT_TEMPLATE, bahorgi: DEFAULT_TEMPLATE });
  const [savedData, setSavedData] = useState<SemesterData>({ kuzgi: DEFAULT_TEMPLATE, bahorgi: DEFAULT_TEMPLATE });
  const [activeSemester, setActiveSemester] = useState<'kuzgi' | 'bahorgi'>('kuzgi');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string>('pedagog');
  const [workStatus, setWorkStatus] = useState<string>('pending');

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) setUserRole(profile.role);

      const queryUserId = targetUserId || user.id;

      const { data, error } = await supabase
        .from('academic_works')
        .select('table_data, status')
        .eq('user_id', queryUserId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        if (data.status) setWorkStatus(data.status);
        if (data.table_data) {
          const rawData = data.table_data;
          let formattedData: SemesterData;
          if (Array.isArray(rawData)) {
            formattedData = { kuzgi: rawData as string[][], bahorgi: DEFAULT_TEMPLATE };
          } else {
            formattedData = rawData as SemesterData;
          }
          setGrid(formattedData);
          setSavedData(formattedData);
          setIsEditing(false);
        }
      } else {
        const initialData = { kuzgi: DEFAULT_TEMPLATE, bahorgi: DEFAULT_TEMPLATE };
        setGrid(initialData);
        setSavedData(initialData);
        setIsEditing(true);
      }
    } catch (err: any) {
      console.error('Error fetching academic work:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const queryUserId = targetUserId || user.id;

      const { error } = await supabase
        .from('academic_works')
        .upsert({
          user_id: queryUserId,
          table_data: grid,
          updated_at: new Date().toISOString(),
          last_modified_by: user.id
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setSavedData(grid);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const queryUserId = targetUserId || (await supabase.auth.getUser()).data.user?.id;
      const { error } = await supabase
        .from('academic_works')
        .update({ status: newStatus })
        .eq('user_id', queryUserId);
      if (error) throw error;
      setWorkStatus(newStatus);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setGrid(savedData);
    setIsEditing(false);
    setError(null);
  };

  const handleReset = () => {
    if (confirm('Jadvalni boshlang\'ich holatga qaytarmoqchimisiz? Barcha kiritilgan ma\'lumotlar o\'chib ketadi.')) {
      setGrid(prev => ({
        ...prev,
        [activeSemester]: DEFAULT_TEMPLATE
      }));
    }
  };

  const canEditStructure = userRole === 'admin';
  const canAddRows = userRole === 'admin' || userRole === 'operator';
  const canEditCells = userRole === 'admin' || userRole === 'operator' || userRole === 'pedagog';
  const isApprover = userRole === 'admin' || userRole === 'approver';

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    // Restrict header and first column for teachers/operators
    if (userRole !== 'admin') {
      if (rowIndex === 0) return; // Header lock
      if (colIndex === 0) return; // First col lock
    }

    setGrid(prev => {
      const currentSemesterGrid = [...prev[activeSemester]];
      currentSemesterGrid[rowIndex] = [...currentSemesterGrid[rowIndex]];
      currentSemesterGrid[rowIndex][colIndex] = value;
      return { ...prev, [activeSemester]: currentSemesterGrid };
    });
  };

  const addRow = () => {
    if (!canAddRows) return;
    setGrid(prev => {
      const currentSemesterGrid = [...prev[activeSemester]];
      const colCount = currentSemesterGrid[0].length;
      const newRow = Array(colCount).fill('');
      
      // Auto-increment the first cell if it's a number
      const lastRowIndex = currentSemesterGrid.length - 1;
      const lastNo = parseInt(currentSemesterGrid[lastRowIndex][0]);
      if (!isNaN(lastNo)) {
        newRow[0] = (lastNo + 1).toString();
      }
      
      return {
        ...prev,
        [activeSemester]: [...currentSemesterGrid, newRow]
      };
    });
  };

  const addColumn = () => {
    if (!canEditStructure) return;
    setGrid(prev => {
      const currentSemesterGrid = prev[activeSemester].map(row => [...row, '']);
      return {
        ...prev,
        [activeSemester]: currentSemesterGrid
      };
    });
  };

  const removeRow = (index: number) => {
    if (!canAddRows) return;
    setGrid(prev => {
      const currentSemesterGrid = prev[activeSemester];
      if (currentSemesterGrid.length <= 1) return prev; // Keep at least header
      if (index === 0) return prev; // Don't remove header
      
      const newGrid = currentSemesterGrid.filter((_, i) => i !== index);
      return {
        ...prev,
        [activeSemester]: newGrid
      };
    });
  };

  const removeColumn = (index: number) => {
    if (!canEditStructure) return;
    setGrid(prev => {
      const currentSemesterGrid = prev[activeSemester];
      if (currentSemesterGrid[0].length <= 1) return prev;
      
      const newGrid = currentSemesterGrid.map(row => row.filter((_, i) => i !== index));
      return {
        ...prev,
        [activeSemester]: newGrid
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const currentGrid = grid[activeSemester];

  return (
    <div className="max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('academicWork')}</h1>
            {workStatus === 'approved' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                TASDIQLANGAN
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">O'quv yuklamalarini boshqarish jadvali.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 print-hidden">
          {isApprover && workStatus === 'pending' && (
             <button
              onClick={() => handleStatusChange('approved')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tasdiqlash
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Chop qilish
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              disabled={workStatus === 'approved' && userRole !== 'admin'}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
            >
              <Pencil className="w-4 h-4" />
              Tahrirlash
            </button>
          ) : (
            <>
              {canEditStructure && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Tozalash
                </button>
              )}
              {canAddRows && (
                <button
                  onClick={addRow}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                >
                  <Rows className="w-4 h-4" />
                  Qator qo'shish
                </button>
              )}
              {canEditStructure && (
                <button
                  onClick={addColumn}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                >
                  <Columns className="w-4 h-4" />
                  Ustun qo'shish
                </button>
              )}
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('save')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Semester Selection Tabs */}
      <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveSemester('kuzgi')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeSemester === 'kuzgi'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Kuzgi semestr
        </button>
        <button
          onClick={() => setActiveSemester('bahorgi')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeSemester === 'bahorgi'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Bahorgi semestr
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-5 py-3.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl shadow-2xl shadow-green-200/50 dark:shadow-none w-auto max-w-[95vw] md:max-w-md"
          >
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-800/50 p-1.5 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-300 flex-1 whitespace-normal break-words leading-relaxed">
              Ma'lumotlar muvaffaqiyatli saqlandi!
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="flex-shrink-0 p-1.5 hover:bg-green-100 dark:hover:bg-green-800/50 rounded-xl transition-all text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
        <div className="overflow-x-auto relative z-0 print:overflow-visible">
          <table className="w-full border-collapse min-w-[1000px] print:min-w-0 print:w-full print:text-[11px] table-fixed">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 print:bg-gray-100 print:text-black">
                {currentGrid[0] && currentGrid[0].map((cell, colIndex) => (
                  <th 
                    key={colIndex} 
                    className={`border border-gray-300 dark:border-gray-600 p-0 relative group ${colIndex === 0 ? 'w-[50px] print:w-[30px]' : ''} ${
                      colIndex === 0 ? 'sticky left-0 z-20 bg-gray-100 dark:bg-gray-700 print:static print:bg-transparent shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none' : ''
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      {isEditing && (userRole === 'admin' || colIndex !== 0) ? (
                        <>
                          <input
                            value={cell}
                            onChange={(e) => updateCell(0, colIndex, e.target.value)}
                            disabled={userRole !== 'admin'}
                            placeholder="Sarlavha"
                            className={`w-full h-12 px-2 bg-transparent font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm text-center uppercase tracking-wider outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500/20 transition-all ${userRole !== 'admin' ? 'cursor-not-allowed opacity-80' : ''}`}
                          />
                          {userRole === 'admin' && (
                            <button
                              onClick={() => removeColumn(colIndex)}
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 text-white rounded-full shadow-lg transition-all hover:scale-110 z-20"
                              title="Ustunni o'chirish"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-12 px-2 flex items-center justify-center font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase tracking-wider">
                          {cell}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {isEditing && <th className="w-12 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"></th>}
              </tr>
            </thead>
            <tbody>
              {currentGrid.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex + 1} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                  {row.map((cell, colIndex) => {
                    const isLastCol = colIndex === row.length - 1;
                    const hasFile = cell && cell.trim().length > 0;
                    
                    return (
                      <td 
                        key={colIndex} 
                        className={`border border-gray-200 dark:border-gray-700 p-0 print:border-gray-400 print:text-black ${
                          colIndex === 0 ? 'sticky left-0 z-10 bg-white dark:bg-gray-800 print:static print:bg-transparent group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none' : ''
                        }`}
                      >
                        <div className="relative flex items-center h-10 px-3">
                          {isLastCol && !isEditing && (
                            <div className={`mr-2 w-3 h-3 rounded-full shrink-0 ${hasFile ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                          )}
                          
                          {isEditing && (userRole === 'admin' || colIndex !== 0) ? (
                            <input
                              value={cell}
                              onChange={(e) => updateCell(rowIndex + 1, colIndex, e.target.value)}
                              className="w-full bg-transparent text-gray-700 dark:text-gray-300 text-sm outline-none focus:bg-white dark:focus:bg-gray-700 transition-all font-medium"
                            />
                          ) : (
                            <div className={`w-full flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium ${isLastCol ? (hasFile ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-500 italic') : ''}`}>
                              {isLastCol && !cell ? 'Fayl yo\'q' : cell}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {isEditing && (
                    <td className="border border-gray-200 dark:border-gray-700 p-0 text-center bg-gray-50 dark:bg-gray-800/50 group-hover:bg-red-50 dark:group-hover:bg-red-900/30 transition-colors">
                      <button
                        onClick={() => removeRow(rowIndex + 1)}
                        className="w-full h-10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Qatorni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500 italic">
        <AlertCircle className="w-4 h-4" />
        <span>Jadval katakchalarini to'g'ridan-to'g'ri tahrirlashingiz mumkin. O'zgarishlarni saqlashni unutmang.</span>
      </div>
    </div>
  );
}
