import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Save, Loader2, AlertCircle, 
  Trash2, Columns, Rows, CheckCircle2, X,
  Pencil, RotateCcw, Paperclip, ExternalLink, FileText, Printer
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

type FileData = {
  text: string;
  file_url: string;
  file_name: string;
};

type CellData = string | FileData;

const DEFAULT_TEMPLATE: CellData[][] = [
  ["№", "Bajarilgan ishlar", "Muddat (reja)", "Muddat (haqiqat)", "O'tkazish joyi", "Ish hajmi sonda (reja)", "Ish hajmi sonda (haqiqat)", "Rejadan tashqari ishlar"],
  ["1", "2", "3", "4", "5", "6", "7", "8"],
  ["1", "", "", "", "", "", "", ""]
];

export default function MentorWork() {
  const { t } = useLanguage();
  const [grid, setGrid] = useState<CellData[][]>(DEFAULT_TEMPLATE);
  const [savedData, setSavedData] = useState<CellData[][]>(DEFAULT_TEMPLATE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCell, setUploadingCell] = useState<{row: number, col: number} | null>(null);
  const [deletingCell, setDeletingCell] = useState<{row: number, col: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mentor_works')
        .select('table_data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.table_data) {
        const tableData = data.table_data as CellData[][];
        setGrid(tableData);
        setSavedData(tableData);
        setIsEditing(false);
      } else {
        setGrid(DEFAULT_TEMPLATE);
        setSavedData(DEFAULT_TEMPLATE);
        setIsEditing(true);
      }
    } catch (err: any) {
      console.error('Error fetching mentor work:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

      const { error } = await supabase
        .from('mentor_works')
        .upsert({
          user_id: user.id,
          table_data: grid,
          updated_at: new Date().toISOString(),
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

  const handleCancel = () => {
    setGrid(savedData);
    setIsEditing(false);
    setError(null);
  };

  const handleReset = () => {
    if (confirm('Jadvalni boshlang\'ich holatga qaytarmoqchimisiz? Barcha kiritilgan ma\'lumotlar o\'chib ketadi.')) {
      setGrid(DEFAULT_TEMPLATE);
    }
  };

  const isHaqiqatColumn = (colIndex: number) => {
    const header = grid[0][colIndex];
    if (typeof header !== 'string') return false;
    return header.toLowerCase().includes('haqiqat');
  };

  const handleFileUpload = async (rowIndex: number, colIndex: number, file: File) => {
    setUploadingCell({ row: rowIndex, col: colIndex });
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher_files')
        .getPublicUrl(filePath);

      const currentCell = grid[rowIndex][colIndex];
      const currentText = typeof currentCell === 'string' ? currentCell : currentCell.text;

      updateCell(rowIndex, colIndex, {
        text: currentText,
        file_url: publicUrl,
        file_name: file.name
      });
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError('Fayl yuklashda xatolik yuz berdi: ' + err.message);
    } finally {
      setUploadingCell(null);
    }
  };

  const handleDeleteFile = async (rowIndex: number, colIndex: number) => {
    const cell = grid[rowIndex][colIndex];
    if (typeof cell === 'string' || !cell.file_url) return;

    if (!confirm('Faylni o\'chirishni tasdiqlaysizmi?')) return;

    setDeletingCell({ row: rowIndex, col: colIndex });
    setError(null);

    try {
      // Extract file path from URL
      const parts = cell.file_url.split('/public/teacher_files/');
      if (parts.length < 2) throw new Error('Fayl yo\'lini aniqlab bo\'lmadi');
      
      const filePath = parts[1];

      const { error: deleteError } = await supabase.storage
        .from('teacher_files')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Revert cell to just text
      updateCell(rowIndex, colIndex, cell.text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError('Faylni o\'chirishda xatolik: ' + err.message);
    } finally {
      setDeletingCell(null);
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: CellData) => {
    const newGrid = [...grid];
    newGrid[rowIndex] = [...newGrid[rowIndex]];
    newGrid[rowIndex][colIndex] = value;
    setGrid(newGrid);
  };

  const updateCellText = (rowIndex: number, colIndex: number, text: string) => {
    const currentCell = grid[rowIndex][colIndex];
    if (typeof currentCell === 'object' && currentCell !== null) {
      updateCell(rowIndex, colIndex, { ...currentCell, text });
    } else {
      updateCell(rowIndex, colIndex, text);
    }
  };

  const addRow = () => {
    const colCount = grid[0].length;
    const newRow = Array(colCount).fill('');
    // Auto-increment the first cell if it's a number
    const lastRowIndex = grid.length - 1;
    const lastNo = parseInt(grid[lastRowIndex][0]);
    if (!isNaN(lastNo)) {
      newRow[0] = (lastNo + 1).toString();
    }
    setGrid([...grid, newRow]);
  };

  const addColumn = () => {
    const newGrid = grid.map(row => [...row, '']);
    setGrid(newGrid);
  };

  const removeRow = (index: number) => {
    if (grid.length <= 2) return; // Keep headers
    if (index < 2) return; // Don't remove headers
    const newGrid = grid.filter((_, i) => i !== index);
    setGrid(newGrid);
  };

  const removeColumn = (index: number) => {
    if (grid[0].length <= 1) return;
    const newGrid = grid.map(row => row.filter((_, i) => i !== index));
    setGrid(newGrid);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('masterApprentice')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Ustoz-shogird ishlarini boshqarish jadvali.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 print-hidden">
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
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              <Pencil className="w-4 h-4" />
              Tahrirlash
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition-all shadow-sm"
                title="Jadvalni boshlang'ich holatga qaytarish"
              >
                <Trash2 className="w-4 h-4" />
                Tozalash
              </button>
              <button
                onClick={addRow}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <Rows className="w-4 h-4" />
                Qator qo'shish
              </button>
              <button
                onClick={addColumn}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <Columns className="w-4 h-4" />
                Ustun qo'shish
              </button>
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto relative z-0">
          <table className="w-full border-collapse min-w-[1200px]">
            <thead>
              {/* Main Header Row */}
              <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 sticky top-0 z-20">
                {grid[0].map((cell, colIndex) => (
                  <th 
                    key={colIndex} 
                    className={`border border-gray-300 dark:border-gray-600 p-0 relative group min-w-[120px] ${
                      colIndex === 0 ? 'sticky left-0 z-30 bg-gray-100 dark:bg-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                    }`}
                    style={{ width: colIndex === 0 ? '50px' : 'auto' }}
                  >
                    <div className="flex flex-col h-full">
                      {isEditing ? (
                        <>
                          <textarea
                            value={cell as string}
                            onChange={(e) => updateCell(0, colIndex, e.target.value)}
                            placeholder="Sarlavha"
                            rows={2}
                            className="w-full px-2 py-3 bg-transparent font-bold text-gray-800 dark:text-gray-200 text-xs text-center uppercase tracking-wider outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                          />
                          <button
                            onClick={() => removeColumn(colIndex)}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 text-white rounded-full shadow-lg transition-all hover:scale-110 z-20"
                            title="Ustunni o'chirish"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full min-h-[60px] px-2 py-3 flex items-center justify-center font-bold text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider text-center">
                          {cell as string}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {isEditing && <th className="w-12 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 sticky top-0 right-0 z-20"></th>}
              </tr>
              {/* Numbering Row */}
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b-2 border-gray-300 dark:border-gray-600 sticky top-[60px] z-20">
                {grid[1].map((cell, colIndex) => (
                  <th 
                    key={colIndex} 
                    className={`border border-gray-300 dark:border-gray-600 p-0 ${
                      colIndex === 0 ? 'sticky left-0 z-30 bg-gray-50 dark:bg-gray-800/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                    }`}
                  >
                    {isEditing ? (
                      <input
                        value={cell as string}
                        onChange={(e) => updateCell(1, colIndex, e.target.value)}
                        className="w-full h-8 px-2 bg-transparent text-gray-500 dark:text-gray-400 text-xs text-center outline-none focus:bg-white dark:focus:bg-gray-700 transition-all"
                      />
                    ) : (
                      <div className="w-full h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-medium">
                        {cell as string}
                      </div>
                    )}
                  </th>
                ))}
                {isEditing && <th className="w-12 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 sticky top-[60px] right-0 z-20"></th>}
              </tr>
            </thead>
            <tbody>
              {grid.slice(2).map((row, rowIndex) => (
                <tr key={rowIndex + 2} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`border border-gray-200 dark:border-gray-700 p-0 ${
                        colIndex === 0 ? 'sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                      }`}
                    >
                      {isEditing ? (
                        <div className="relative group/cell flex items-center">
                          <textarea
                            value={typeof cell === 'string' ? cell : cell.text}
                            onChange={(e) => updateCellText(rowIndex + 2, colIndex, e.target.value)}
                            rows={1}
                            className="w-full min-h-[40px] px-3 py-2 bg-transparent text-gray-700 dark:text-gray-300 text-sm outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                          />
                          {isHaqiqatColumn(colIndex) && (
                            <div className="flex items-center gap-1 pr-2">
                              {uploadingCell?.row === rowIndex + 2 && uploadingCell?.col === colIndex ? (
                                <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                              ) : (
                                <label className="cursor-pointer p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors text-indigo-600 dark:text-indigo-400">
                                  <Paperclip className="w-4 h-4" />
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(rowIndex + 2, colIndex, file);
                                    }}
                                  />
                                </label>
                              )}
                              {typeof cell === 'object' && cell !== null && (
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium max-w-[80px] truncate" title={cell.file_name}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span className="truncate">{cell.file_name}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteFile(rowIndex + 2, colIndex)}
                                    disabled={deletingCell?.row === rowIndex + 2 && deletingCell?.col === colIndex}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md text-red-500 dark:text-red-400 transition-colors disabled:opacity-50"
                                    title="Faylni o'chirish"
                                  >
                                    {deletingCell?.row === rowIndex + 2 && deletingCell?.col === colIndex ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <X className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full min-h-[40px] px-3 py-2 flex items-center justify-between gap-2 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                          <span>{typeof cell === 'string' ? cell : cell.text}</span>
                          {typeof cell === 'object' && cell !== null && cell.file_url && (
                            <a 
                              href={`${cell.file_url}?download=`} 
                              className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all text-xs font-medium"
                            >
                              <FileText className="w-3 h-3" />
                              Fayl
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  {isEditing && (
                    <td className="border border-gray-200 dark:border-gray-700 p-0 text-center bg-gray-50 dark:bg-gray-800/50 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                      <button
                        onClick={() => removeRow(rowIndex + 2)}
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

      <div className="mt-6 flex items-center gap-4 text-sm text-gray-400 italic">
        <AlertCircle className="w-4 h-4" />
        <span>Jadval katakchalarini to'g'ridan-to'g'ri tahrirlashingiz mumkin. O'zgarishlarni saqlashni unutmang.</span>
      </div>
    </div>
  );
}
