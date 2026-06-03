import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Save, Loader2, AlertCircle, 
  Trash2, Columns, Rows, CheckCircle2, X,
  Pencil, RotateCcw, Paperclip, ExternalLink, FileText, Printer, History
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

type FileData = {
  text: string;
  file_url: string;
  file_name: string;
  metadata?: any;
};

type CellData = string | FileData;

const DEFAULT_TEMPLATE: CellData[][] = [
  ["№", "Bajariladigan ishlar", "Muddat (reja)", "Muddat (haqiqat)", "Reja hajmi (bosma taboq)", "Reja hajmi (sonda)", "Haqiqat (bosma taboq)", "Haqiqat (sonda)", "Rejadan tashqari (bosma taboq)", "Rejadan tashqari (sonda)"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  ["1", "", "", "", "", "", "", "", "", ""]
];

export default function MethodicalWork({ adminUserId, isTasdiqlovchi }: { adminUserId?: string, isTasdiqlovchi?: boolean }) {
  const { t } = useLanguage();

  const cachedData = (() => {
    const userId = adminUserId || localStorage.getItem('current_user_id') || '';
    if (!userId) return null;
    const cache = localStorage.getItem('cache_methodical_work_' + userId);
    if (cache) {
      try { return JSON.parse(cache); } catch (_) { return null; }
    }
    return null;
  })();

  const [grid, setGrid] = useState<CellData[][]>(cachedData?.grid || cachedData || DEFAULT_TEMPLATE);
  const [savedData, setSavedData] = useState<CellData[][]>(cachedData?.grid || cachedData || DEFAULT_TEMPLATE);
  const [historyLogs, setHistoryLogs] = useState<any[]>(cachedData?.historyLogs || []);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(!cachedData);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [uploadingCell, setUploadingCell] = useState<{row: number, col: number} | null>(null);
  const [deletingCell, setDeletingCell] = useState<{row: number, col: number} | null>(null);
  const [uploadModalData, setUploadModalData] = useState<{row: number, col: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isApproved, setIsApproved] = useState(false);
  useEffect(() => {
    const fetchAppr = async () => {
      let uid = adminUserId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) uid = user.id;
      }
      if (uid) {
        setIsApproved(localStorage.getItem('approved_methodical_' + uid) === 'true');
      }
    };
    fetchAppr();
  }, [adminUserId]);

  const toggleApproval = () => {
      if (!adminUserId) return;
      const newVal = !isApproved;
      setIsApproved(newVal);
      localStorage.setItem('approved_methodical_' + adminUserId, newVal ? 'true' : 'false');
  };

  const fetchData = useCallback(async () => {
    try {
      let targetUserId = adminUserId;
      if (!targetUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        targetUserId = session.user.id;
      }

      const { data, error } = await supabase
        .from('methodical_works')
        .select('table_data')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.table_data) {
        const rawData = data.table_data as any;
        let loadedGrid = DEFAULT_TEMPLATE;
        let loadedLogs: any[] = [];
        if (Array.isArray(rawData)) {
          loadedGrid = rawData;
        } else {
          loadedGrid = rawData.grid || DEFAULT_TEMPLATE;
          loadedLogs = rawData.historyLogs || [];
        }
        setGrid(loadedGrid);
        setSavedData(loadedGrid);
        setHistoryLogs(loadedLogs);
        setIsEditing(false);
        localStorage.setItem('cache_methodical_work_' + targetUserId, JSON.stringify({ grid: loadedGrid, historyLogs: loadedLogs }));
      } else {
        setGrid(DEFAULT_TEMPLATE);
        setSavedData(DEFAULT_TEMPLATE);
        setHistoryLogs([]);
        setIsEditing(true);
        localStorage.setItem('cache_methodical_work_' + targetUserId, JSON.stringify({ grid: DEFAULT_TEMPLATE, historyLogs: [] }));
      }
    } catch (err: any) {
      console.error('Error fetching methodical work:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (JSON.stringify(grid) === JSON.stringify(savedData)) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const targetUserId = adminUserId || user.id;

      const { error } = await supabase
        .from('methodical_works')
        .upsert({
          user_id: targetUserId,
          table_data: { grid, historyLogs },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setSavedData(grid);
      setIsEditing(false);
      localStorage.setItem('cache_methodical_work_' + targetUserId, JSON.stringify({ grid, historyLogs }));
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

  const handleFileUpload = async (rowIndex: number, colIndex: number, file: File, metadata: any) => {
    setUploadingCell({ row: rowIndex, col: colIndex });
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const targetUserId = adminUserId || user.id;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${targetUserId}/${fileName}`;

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
        text: metadata?.maqola_mavzusi || currentText,
        file_url: publicUrl,
        file_name: file.name,
        metadata
      });
      setUploadModalData(null);
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
      // Extract relative file path from URL (everything after the bucket name)
      const pathParts = cell.file_url.split('/teacher_files/');
      if (pathParts.length < 2) throw new Error('Fayl yo\'lini aniqlab bo\'lmadi');
      
      // Decode the path to handle special characters/spaces correctly
      const filePath = decodeURIComponent(pathParts[1]);

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
    let finalValue = text;
    const currentCell = grid[rowIndex][colIndex];
    const oldVal = typeof currentCell === 'object' ? currentCell.text : currentCell;
    const newGrid = [...grid];
    newGrid[rowIndex] = [...newGrid[rowIndex]];

    if (typeof currentCell === 'object' && currentCell !== null) {
      newGrid[rowIndex][colIndex] = { ...currentCell, text: finalValue };
    } else {
      newGrid[rowIndex][colIndex] = finalValue;
    }
    setGrid(newGrid);

    if (!adminUserId && isHaqiqatColumn(colIndex) && oldVal !== finalValue) {
      setHistoryLogs(prev => [
        {
          date: new Date().toISOString(),
          row: rowIndex - 2, // exclude headers
          col: colIndex,
          oldVal,
          newVal: finalValue
        },
        ...prev
      ].slice(0, 50));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textareas = Array.from(document.querySelectorAll('textarea:not([readOnly])')) as HTMLTextAreaElement[];
      const index = textareas.indexOf(e.currentTarget);
      if (index > -1 && index + 1 < textareas.length) {
        textareas[index + 1].focus();
      }
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{t('methodicalWork')}</h1>
            {isApproved && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-lg flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Tasdiqlandi
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">O'quv-uslubiy ishlarni boshqarish jadvali.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {!adminUserId && (
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm print:hidden"
            >
              <History className="w-4 h-4" />
              Tarix
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm print:hidden"
            >
              <Printer className="w-4 h-4" />
              Chop etish
            </button>
          )}

          {isTasdiqlovchi && (
             <button
               onClick={toggleApproval}
               className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-sm ${isApproved ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.3)]'}`}
             >
               {isApproved ? (
                 <>
                   <X className="w-4 h-4" />
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

          {!isTasdiqlovchi && !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Pencil className="w-4 h-4" />
              Tahrirlash
            </button>
          ) : !isTasdiqlovchi ? (
            <>
              {adminUserId && (
                <>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-sm"
                    title="Jadvalni boshlang'ich holatga qaytarish"
                  >
                    <Trash2 className="w-4 h-4" />
                    Tozalash
                  </button>
                  <button
                    onClick={addRow}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Rows className="w-4 h-4" />
                    Qator qo'shish
                  </button>
                  <button
                    onClick={addColumn}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Columns className="w-4 h-4" />
                    Ustun qo'shish
                  </button>
                </>
              )}
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('save')}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-5 py-3.5 bg-green-50 border border-green-200 rounded-2xl shadow-2xl shadow-green-200/50 w-auto max-w-[95vw] md:max-w-md"
          >
            <div className="flex-shrink-0 bg-green-100 p-1.5 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-green-900 flex-1 whitespace-normal break-words leading-relaxed">
              Ma'lumotlar muvaffaqiyatli saqlandi!
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="flex-shrink-0 p-1.5 hover:bg-green-100 rounded-xl transition-all text-green-600 hover:text-green-800"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto relative z-0">
          <table className="w-full border-collapse min-w-[1500px]">
            <thead>
              {/* Main Header Row */}
              <tr className="bg-gray-100 border-b border-gray-300 sticky top-0 z-20">
                {grid[0].map((cell, colIndex) => (
                  <th 
                    key={colIndex} 
                    className={`border border-gray-300 p-0 relative group min-w-[120px] ${
                      colIndex === 0 ? 'sticky left-0 z-30 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                    }`}
                    style={{ width: colIndex === 0 ? '50px' : 'auto' }}
                  >
                    <div className="flex flex-col h-full">
                      {isEditing ? (
                        <>
                          <textarea
                            value={cell}
                            onChange={(e) => updateCell(0, colIndex, e.target.value)}
                            placeholder="Sarlavha"
                            rows={2}
                            className="w-full px-2 py-3 bg-transparent font-bold text-gray-800 text-xs text-center uppercase tracking-wider outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
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
                        <div className="w-full min-h-[60px] px-2 py-3 flex items-center justify-center font-bold text-gray-800 text-xs uppercase tracking-wider text-center">
                          {cell}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {isEditing && <th className="w-12 border border-gray-300 bg-gray-100 sticky top-0 right-0 z-20"></th>}
              </tr>
              {/* Numbering Row */}
              <tr className="bg-gray-50 border-b-2 border-gray-300 sticky top-[60px] z-20">
                {grid[1].map((cell, colIndex) => (
                  <th 
                    key={colIndex} 
                    className={`border border-gray-300 p-0 ${
                      colIndex === 0 ? 'sticky left-0 z-30 bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                    }`}
                  >
                    {isEditing ? (
                      <input
                        value={cell}
                        onChange={(e) => updateCell(1, colIndex, e.target.value)}
                        className="w-full h-8 px-2 bg-transparent text-gray-500 text-xs text-center outline-none focus:bg-white transition-all"
                      />
                    ) : (
                      <div className="w-full h-8 flex items-center justify-center text-gray-500 text-xs font-medium">
                        {cell}
                      </div>
                    )}
                  </th>
                ))}
                {isEditing && <th className="w-12 border border-gray-300 bg-gray-50 sticky top-[60px] right-0 z-20"></th>}
              </tr>
            </thead>
            <tbody>
              {grid.slice(2).map((row, rowIndex) => (
                <tr key={rowIndex + 2} className="hover:bg-indigo-50/30 transition-colors group">
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`border border-gray-200 p-0 ${
                        colIndex === 0 ? 'sticky left-0 z-10 bg-white group-hover:bg-indigo-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                      }`}
                    >
                      {isEditing ? (
                        <div className="relative group/cell flex items-center">
                          <textarea
                            value={typeof cell === 'string' ? cell : cell.text}
                            onChange={(e) => updateCellText(rowIndex + 2, colIndex, e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            className="w-full min-h-[40px] px-3 py-2 bg-transparent text-gray-700 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                          />
                          {isHaqiqatColumn(colIndex) && (
                            <div className="flex items-center gap-1 pr-2">
                              {uploadingCell?.row === rowIndex + 2 && uploadingCell?.col === colIndex ? (
                                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setUploadModalData({ row: rowIndex + 2, col: colIndex })}
                                  className="cursor-pointer p-1 hover:bg-indigo-100 rounded-md transition-colors text-indigo-600 flex items-center justify-center"
                                  title="Ma'lumot va fayl yuklash"
                                >
                                  <Paperclip className="w-4 h-4" />
                                </button>
                              )}
                              {typeof cell === 'object' && cell !== null && (
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium max-w-[80px] truncate" title={cell.file_name}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span className="truncate">{cell.file_name}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteFile(rowIndex + 2, colIndex)}
                                    disabled={deletingCell?.row === rowIndex + 2 && deletingCell?.col === colIndex}
                                    className="p-1 hover:bg-red-100 rounded-md text-red-500 transition-colors disabled:opacity-50"
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
                        <div className="w-full min-h-[40px] px-3 py-2 flex items-center justify-between gap-2 text-gray-700 text-sm whitespace-pre-wrap">
                          <span>{typeof cell === 'string' ? cell : cell.text}</span>
                          {typeof cell === 'object' && cell !== null && cell.file_url && (
                            <button 
                              onClick={async (e) => {
                                e.preventDefault();
                                const { handleFileDownload } = await import('../lib/downloadHelper');
                                handleFileDownload(cell.file_url as string, cell.file_name);
                              }}
                              className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-all text-xs font-medium"
                            >
                              <FileText className="w-3 h-3" />
                              Fayl
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  {isEditing && (
                    <td className="border border-gray-200 p-0 text-center bg-gray-50 group-hover:bg-red-50 transition-colors">
                      <button
                        onClick={() => removeRow(rowIndex + 2)}
                        className="w-full h-10 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
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

      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg border border-gray-100 flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  O'zgarishlar tarixi
                </h3>
                <button onClick={() => setShowHistory(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-3">
                {(!historyLogs || historyLogs.length === 0) ? (
                  <div className="text-center p-8 text-gray-400 italic">O'zgarishlar tarixi bo'sh</div>
                ) : (
                  historyLogs.map((log, idx) => (
                    <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col gap-2 relative">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded shadow-sm">Qator: {log.row + 1}</span>
                        <span className="text-xs font-semibold text-gray-400">{new Date(log.date).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Ustun o'zgartirildi (Haqiqatda).
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold line-through">{log.oldVal || '0'}</span>
                        <span className="text-gray-400 text-xs">→</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{log.newVal || '0'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadModalData && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl border border-gray-100 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Ma'lumot va fayl yuklash</h3>
                <button onClick={() => setUploadModalData(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const data = new FormData(form);
                  const file = data.get('fayl') as File;
                  const meta = {
                    maqola_mavzusi: data.get('maqola_mavzusi'),
                    mualliflar_soni: data.get('mualliflar_soni'),
                    hammualliflar: data.get('hammualliflar'),
                    jurnal_nomi: data.get('jurnal_nomi'),
                    chop_etilgan_sana: data.get('chop_etilgan_sana'),
                    maqola_betlari: data.get('maqola_betlari'),
                    internet_manzili: data.get('internet_manzili'),
                  };
                  if (file && file.size > 0) {
                     handleFileUpload(uploadModalData.row, uploadModalData.col, file, meta);
                  } else {
                     alert("Iltimos fayl tanlang!");
                  }
                }}
                className="p-6 overflow-y-auto space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maqola mavzusi *</label>
                  <input required name="maqola_mavzusi" type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mualliflar soni</label>
                    <input name="mualliflar_soni" type="number" defaultValue={1} min={1} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mualliflar</label>
                    <input name="hammualliflar" type="text" placeholder="F.I.SH." className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurnal (yoki to'plam) nomi va soni</label>
                  <input name="jurnal_nomi" type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chop etilgan sana</label>
                    <input name="chop_etilgan_sana" type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maqola betlari</label>
                    <input name="maqola_betlari" type="text" placeholder="Masalan: 12-15" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maqolaning Internet sahifasi manzili</label>
                  <input name="internet_manzili" type="url" placeholder="https://" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asoslovchi hujjat *</label>
                  <input required name="fayl" type="file" accept=".pdf,.doc,.docx" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  <p className="text-xs text-gray-500 mt-1">Faqat .pdf, .doc, .docx formatlari</p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={uploadingCell !== null} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center">
                    {uploadingCell !== null ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Saqlash
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
