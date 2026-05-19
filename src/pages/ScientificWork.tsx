import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Save, Loader2, AlertCircle, 
  Trash2, Columns, Rows, CheckCircle2, X,
  Pencil, RotateCcw, Paperclip, ExternalLink, FileText, Upload,
  Lock, Unlock, Printer
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

type UploadedItem = {
  id: string;
  topic: string;
  location: string;
  date: string;
  file_url: string;
  file_name: string;
};

type FileData = {
  text: string;
  file_url: string;
  file_name: string;
};

type CellData = string | FileData | {
  type: 'uploads';
  items: UploadedItem[];
};

const DEFAULT_TEMPLATE: CellData[][] = [
  ["№", "Bajariladigan ishlar", "Muddat (reja)", "Muddat (haqiqat)", "Ijro (Respublika)", "Ijro (Xalqaro)", "Hajmi (reja)", "Hajmi (haqiqat)", "Rejadan tashqari ishlar"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "", "", "", "", "", "0", "", ""]
];

export default function ScientificWork({ adminUserId, isTasdiqlovchi }: { adminUserId?: string, isTasdiqlovchi?: boolean }) {
  const { t } = useLanguage();
  const [grid, setGrid] = useState<CellData[][]>(DEFAULT_TEMPLATE);
  const [savedData, setSavedData] = useState<CellData[][]>(DEFAULT_TEMPLATE);
  const [allowedCells, setAllowedCells] = useState<Record<string, boolean>>({});
  const [savedAllowedCells, setSavedAllowedCells] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Upload modal state
  const [uploadModal, setUploadModal] = useState<{row: number, col: number, maxCount: number} | null>(null);
  const [newItem, setNewItem] = useState({ topic: '', location: '', date: '', file: null as File | null });
  const [isUploading, setIsUploading] = useState(false);

  const [isApproved, setIsApproved] = useState(false);
  useEffect(() => {
    const fetchAppr = async () => {
      let uid = adminUserId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) uid = user.id;
      }
      if (uid) {
        setIsApproved(localStorage.getItem('approved_scientific_' + uid) === 'true');
      }
    };
    fetchAppr();
  }, [adminUserId]);

  const toggleApproval = () => {
      if (!adminUserId) return;
      const newVal = !isApproved;
      setIsApproved(newVal);
      localStorage.setItem('approved_scientific_' + adminUserId, newVal ? 'true' : 'false');
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const targetUserId = adminUserId || user.id;

      const { data, error } = await supabase
        .from('scientific_works')
        .select('table_data')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.table_data) {
        const tableData = data.table_data as any; // any to handle both formats
        if (Array.isArray(tableData)) {
          setGrid(tableData);
          setSavedData(tableData);
          setAllowedCells({});
          setSavedAllowedCells({});
        } else {
          setGrid(tableData.grid || DEFAULT_TEMPLATE);
          setSavedData(tableData.grid || DEFAULT_TEMPLATE);
          setAllowedCells(tableData.allowedCells || {});
          setSavedAllowedCells(tableData.allowedCells || {});
        }
        setIsEditing(false);
      } else {
        setGrid(DEFAULT_TEMPLATE);
        setSavedData(DEFAULT_TEMPLATE);
        setAllowedCells({});
        setSavedAllowedCells({});
        setIsEditing(true);
      }
    } catch (err: any) {
      console.error('Error fetching scientific work:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminUserId]);

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

      const targetUserId = adminUserId || user.id;

      const { error } = await supabase
        .from('scientific_works')
        .upsert({
          user_id: targetUserId,
          table_data: { grid, allowedCells },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setSavedData(grid);
      setSavedAllowedCells(allowedCells);
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
    setAllowedCells(savedAllowedCells);
    setIsEditing(false);
    setError(null);
  };

  const handleReset = () => {
    if (confirm('Jadvalni boshlang\'ich holatga qaytarmoqchimisiz? Barcha kiritilgan ma\'lumotlar o\'chib ketadi.')) {
      setGrid(DEFAULT_TEMPLATE);
      setAllowedCells({});
    }
  };

  const isHaqiqatColumn = (colIndex: number) => {
    const header = grid[0][colIndex];
    if (typeof header !== 'string') return false;
    return header.toLowerCase().includes('haqiqat');
  };

  const isRejaColumn = (colIndex: number) => {
    const header = grid[0][colIndex];
    if (typeof header !== 'string') return false;
    return header.toLowerCase().includes('reja') && !header.toLowerCase().includes('tashqari');
  };

  const togglePermission = (rowIndex: number, colIndex: number) => {
    const key = `${rowIndex}_${colIndex}`;
    setAllowedCells(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getRejaCount = (rowIndex: number, colIndex: number): number => {
    let rejaColIndex = -1;
    for (let c = colIndex - 1; c >= 0; c--) {
        const header = grid[0][c];
        if (typeof header === 'string' && header.toLowerCase().includes('reja')) {
            rejaColIndex = c;
            break;
        }
    }
    if (rejaColIndex === -1) return 0;
    
    const rejaCell = grid[rowIndex][rejaColIndex];
    if (typeof rejaCell === 'string') {
        const num = parseInt(rejaCell);
        return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const updateCell = (rowIndex: number, colIndex: number, value: CellData) => {
    const newGrid = [...grid];
    newGrid[rowIndex] = [...newGrid[rowIndex]];
    newGrid[rowIndex][colIndex] = value;
    setGrid(newGrid);
  };

  const updateCellText = (rowIndex: number, colIndex: number, text: string) => {
    const currentCell = grid[rowIndex][colIndex];
    if (typeof currentCell === 'object' && currentCell !== null && 'file_url' in currentCell && !('type' in currentCell)) {
      updateCell(rowIndex, colIndex, { ...currentCell, text });
    } else {
      updateCell(rowIndex, colIndex, text);
    }
  };

  const addRow = () => {
    const colCount = grid[0].length;
    const newRow = Array(colCount).fill('');
    const lastRowIndex = grid.length - 1;
    const lastNo = parseInt(grid[lastRowIndex][0] as string);
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
    if (grid.length <= 2) return;
    if (index < 2) return;
    const newGrid = grid.filter((_, i) => i !== index);
    setGrid(newGrid);
  };

  const removeColumn = (index: number) => {
    if (grid[0].length <= 1) return;
    const newGrid = grid.map(row => row.filter((_, i) => i !== index));
    setGrid(newGrid);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModal || !newItem.file) return;

    setIsUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const targetUserId = adminUserId || user.id;

      const fileExt = newItem.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${targetUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher_files')
        .upload(filePath, newItem.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher_files')
        .getPublicUrl(filePath);

      const uploadedItem: UploadedItem = {
        id: Math.random().toString(36).substring(2),
        topic: newItem.topic,
        location: newItem.location,
        date: newItem.date,
        file_url: publicUrl,
        file_name: newItem.file.name
      };

      const currentCell = grid[uploadModal.row][uploadModal.col];
      let items: UploadedItem[] = [];
      
      if (typeof currentCell === 'object' && currentCell !== null && 'type' in currentCell && currentCell.type === 'uploads') {
        items = [...currentCell.items];
      }
      
      items.push(uploadedItem);

      updateCell(uploadModal.row, uploadModal.col, {
        type: 'uploads',
        items
      });

      setNewItem({ topic: '', location: '', date: '', file: null });

      // Agar barcha fayllar yuklangan bo'lsa modalni yopamiz
      if (items.length >= uploadModal.maxCount) {
        setUploadModal(null);
      }

    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError('Fayl yuklashda xatolik yuz berdi: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (rowIndex: number, colIndex: number, itemId: string, fileUrl: string) => {
    if (!confirm("Haqiqatan ham ushbu ma'lumotni o'chirmoqchimisiz?")) return;
    try {
      const pathParts = fileUrl.split('/teacher_files/');
      if (pathParts.length >= 2) {
        const filePath = decodeURIComponent(pathParts[1]);
        await supabase.storage.from('teacher_files').remove([filePath]);
      }

      const currentCell = grid[rowIndex][colIndex];
      if (typeof currentCell === 'object' && currentCell !== null && 'type' in currentCell && currentCell.type === 'uploads') {
        const newItems = currentCell.items.filter(item => item.id !== itemId);
        if (newItems.length === 0) {
          updateCell(rowIndex, colIndex, '');
        } else {
          updateCell(rowIndex, colIndex, { type: 'uploads', items: newItems });
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Row and Column Totals
  const calculateTotals = () => {
    const totals = Array(grid[0].length).fill(0);
    for (let r = 2; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (isRejaColumn(c)) {
          const val = parseInt(grid[r][c] as string);
          if (!isNaN(val)) totals[c] += val;
        } else if (isHaqiqatColumn(c)) {
          const cell = grid[r][c];
          if (typeof cell === 'object' && cell !== null && 'type' in cell && cell.type === 'uploads') {
            totals[c] += cell.items.length;
          }
        }
      }
    }
    return totals;
  };

  const totals = calculateTotals();

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
            <h1 className="text-3xl font-bold text-gray-900">{t('scientificWork')}</h1>
            {isApproved && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-lg flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Tasdiqlandi
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">Ilmiy-tadqiqot ishlarini boshqarish jadvali.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
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
                      {isEditing && adminUserId ? (
                        <>
                          <textarea
                            value={cell as string}
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
                          {cell as string}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {isEditing && adminUserId && <th className="w-12 border border-gray-300 bg-gray-100 sticky top-0 right-0 z-20"></th>}
              </tr>
              
              <tr className="bg-gray-50 border-b-2 border-gray-300 sticky top-[60px] z-20">
                {grid[1].map((cell, colIndex) => (
                  <th 
                    key={colIndex} 
                    className={`border border-gray-300 p-0 ${
                      colIndex === 0 ? 'sticky left-0 z-30 bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                    }`}
                  >
                    {isEditing && adminUserId ? (
                      <input
                        value={cell as string}
                        onChange={(e) => updateCell(1, colIndex, e.target.value)}
                        className="w-full h-8 px-2 bg-transparent text-gray-500 text-xs text-center outline-none focus:bg-white transition-all"
                      />
                    ) : (
                      <div className="w-full h-8 flex items-center justify-center text-gray-500 text-xs font-medium">
                        {cell as string}
                      </div>
                    )}
                  </th>
                ))}
                {isEditing && adminUserId && <th className="w-12 border border-gray-300 bg-gray-50 sticky top-[60px] right-0 z-20"></th>}
              </tr>
            </thead>
            <tbody>
              {grid.slice(2).map((row, rowIndex) => (
                <tr key={rowIndex + 2} className="hover:bg-indigo-50/30 transition-colors group">
                  {row.map((cell, colIndex) => {
                     const isHaqiqat = isHaqiqatColumn(colIndex);
                     const isReja = isRejaColumn(colIndex);
                     const rejaCount = isHaqiqat ? getRejaCount(rowIndex + 2, colIndex) : 0;
                     
                     let uploadedCount = 0;
                     if (typeof cell === 'object' && cell !== null && 'type' in cell && cell.type === 'uploads') {
                       uploadedCount = cell.items.length;
                     }

                     let badgeColor = "bg-gray-100 text-gray-600";
                     if (isHaqiqat && rejaCount > 0) {
                        if (uploadedCount === 0) badgeColor = "bg-red-100 text-red-700";
                        else if (uploadedCount < rejaCount) badgeColor = "bg-amber-100 text-amber-700";
                        else badgeColor = "bg-green-100 text-green-700";
                     }

                     const canEditTableStructure = isEditing && adminUserId;
                     const isPedagogOrTahrirlovchiEditing = isEditing;
                     
                     // O'qituvchi faqat ruxsat bo'lsa (yoki isEditing holatida haqiqatni) to'ldiradi
                     // Lekin shart bo'yicha: Tahrirlovchi tomonidan ruxsat berilganlarigina
                     // Bu yerda o'qituvchi o'zgartira olishi uchun isEditing yoqiladi, lekin u faqat haqiqatga fayl yuklay oladi
                     return (
                      <td 
                        key={colIndex} 
                        className={`border border-gray-200 p-0 ${
                          colIndex === 0 ? 'sticky left-0 z-10 bg-white group-hover:bg-indigo-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                        }`}
                      >
                        {isEditing ? (
                          <div className="relative group/cell flex items-center min-h-[40px]">
                            {isEditing && adminUserId && (
                              <button
                                title="Ruxsatni o'zgartirish"
                                onClick={() => togglePermission(rowIndex + 2, colIndex)}
                                className={`absolute top-1 right-1 p-1 rounded transition-colors z-20 shadow-sm ${
                                  allowedCells[`${rowIndex + 2}_${colIndex}`] 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-500 hover:bg-red-200'
                                }`}
                              >
                                {allowedCells[`${rowIndex + 2}_${colIndex}`] ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              </button>
                            )}
                            
                            {/* Ruxsat etilgan foydalanuvchi faqat Text larni tahrirlashi mumkin agar adminUserId bo'lsa yoki admin bo'lmasa o'sha ustun ruxsat etilgan bo'lsa */}
                            {(!adminUserId && !isHaqiqat && !allowedCells[`${rowIndex + 2}_${colIndex}`]) ? (
                               <div className="w-full min-h-[40px] px-3 py-2 flex text-gray-400 text-sm italic bg-gray-50">
                                 {typeof cell === 'string' ? cell : (typeof cell === 'object' && 'text' in (cell as any) ? (cell as any).text : '')}
                               </div>
                            ) : (
                              !isHaqiqat && (
                                <textarea
                                  value={typeof cell === 'string' ? cell : (typeof cell === 'object' && 'text' in cell ? cell.text : '')}
                                  onChange={(e) => updateCellText(rowIndex + 2, colIndex, e.target.value)}
                                  rows={1}
                                  className={`w-full min-h-[40px] px-3 py-2 bg-transparent text-gray-700 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${adminUserId ? 'pr-8' : ''}`}
                                />
                              )
                            )}

                            {isHaqiqat && (
                               <div className="w-full p-2 flex flex-col gap-2">
                                 <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${badgeColor}`}>
                                      {uploadedCount} / {rejaCount || '0'}
                                    </span>
                                    {(rejaCount > 0 && uploadedCount < rejaCount && (adminUserId || allowedCells[`${rowIndex + 2}_${colIndex}`])) && (
                                      <button 
                                        onClick={() => setUploadModal({ row: rowIndex + 2, col: colIndex, maxCount: rejaCount })}
                                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition ${adminUserId ? 'mr-6' : ''}`}
                                      >
                                        <Plus className="w-3 h-3" /> Qo'shish
                                      </button>
                                    )}
                                 </div>
                                 {typeof cell === 'object' && 'type' in cell && cell.type === 'uploads' && (
                                    <div className="flex flex-col gap-1 mt-1">
                                      {cell.items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-1.5 rounded border border-gray-100 group/item">
                                           <a href={item.file_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline truncate max-w-[120px]" title={item.topic}>
                                             {item.topic || 'Fayl'}
                                           </a>
                                           {(adminUserId || allowedCells[`${rowIndex + 2}_${colIndex}`]) && (
                                             <button onClick={() => handleDeleteItem(rowIndex + 2, colIndex, item.id, item.file_url)} className="text-red-400 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition">
                                                <X className="w-3 h-3" />
                                             </button>
                                           )}
                                        </div>
                                      ))}
                                    </div>
                                 )}
                               </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full min-h-[40px] px-3 py-2 flex flex-col gap-2 justify-center text-gray-700 text-sm whitespace-pre-wrap">
                            {isHaqiqat ? (
                               <div className="flex flex-col gap-1">
                                 <span className={`px-2 py-1 text-xs font-bold rounded-md w-fit ${badgeColor}`}>
                                    {uploadedCount} / {rejaCount || '0'}
                                 </span>
                                 {typeof cell === 'object' && 'type' in cell && cell.type === 'uploads' && (
                                    <div className="flex flex-col gap-1 mt-1">
                                      {cell.items.map(item => (
                                        <a key={item.id} href={item.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline bg-indigo-50/50 p-1 rounded">
                                           <FileText className="w-3 h-3" /> {item.topic || 'Fayl'}
                                        </a>
                                      ))}
                                    </div>
                                 )}
                               </div>
                            ) : (
                              <span>{typeof cell === 'string' ? cell : (typeof cell === 'object' && 'text' in cell ? cell.text : '')}</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  
                  {isEditing && adminUserId && (
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
              
              {/* Totals Row */}
              <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                <td className="border border-gray-300 px-3 py-3 text-center sticky left-0 z-10 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Jami</td>
                {grid[0].slice(1).map((_, cIndex) => {
                  const colIndex = cIndex + 1;
                  const isReja = isRejaColumn(colIndex);
                  const isHaqiqat = isHaqiqatColumn(colIndex);
                  
                  return (
                     <td key={colIndex} className="border border-gray-300 px-3 py-3 text-center text-sm md:text-base text-indigo-900">
                        {(isReja || isHaqiqat) ? totals[colIndex] : ''}
                     </td>
                  );
                })}
                {isEditing && adminUserId && <td className="border border-gray-300 bg-gray-100"></td>}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>O'qituvchilar faqat tahrirlovchi tomonidan ruxsat berilgan katakchalarga o'zgartirish kiritishlari va hujjat yuklashlari mumkin.</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
           <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">0 / 4</span> Kiritilmagan
           <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-bold">2 / 4</span> Chala
           <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">4 / 4</span> Bajarilgan
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg border border-gray-100 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-gray-900">Hujjat biriktirish</h3>
                 <button onClick={() => setUploadModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <form onSubmit={handleAddItem} className="space-y-4">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Maruza mavzusi *</label>
                   <input required value={newItem.topic} onChange={e => setNewItem({...newItem, topic: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Mavzuni kiriting" />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Qayerda chiqish qilgan</label>
                   <input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Joy nomini kiriting" />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Chiqish sanasi</label>
                   <input type="date" value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Asoslovchi hujjat (PDF, Word, Rasm) *</label>
                   <input required type="file" onChange={e => setNewItem({...newItem, file: e.target.files?.[0] || null})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                 </div>

                 <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setUploadModal(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
                     Bekor qilish
                   </button>
                   <button disabled={isUploading || !newItem.file || !newItem.topic} type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-200">
                     {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                     Saqlash
                   </button>
                 </div>
               </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
