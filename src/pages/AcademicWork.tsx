import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, Loader2, AlertCircle, 
  Trash2, Rows, CheckCircle2, X,
  Pencil, RotateCcw, Columns, Lock, Unlock, Printer, FileUp, History
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

const COLS_COUNT = 28;
const DEFAULT_TEMPLATE = [Array(COLS_COUNT).fill("")];

type SemesterData = {
  kuzgi: string[][];
  bahorgi: string[][];
  kuzgiLocked?: Record<string, boolean>;
  bahorgiLocked?: Record<string, boolean>;
  kuzgiExtraCols?: string[];
  bahorgiExtraCols?: string[];
  teacherAllowsEdit?: boolean;
  historyLogs?: { date: string, semester: string, row: number, col: number, oldVal: string, newVal: string }[];
};

const initialData: SemesterData = { 
  kuzgi: DEFAULT_TEMPLATE, 
  bahorgi: DEFAULT_TEMPLATE,
  kuzgiLocked: {},
  bahorgiLocked: {},
  kuzgiExtraCols: [],
  bahorgiExtraCols: [],
  teacherAllowsEdit: false,
  historyLogs: []
};

const fixData = (data: any[]): string[][] => {
  if (!Array.isArray(data) || data.length === 0) return [Array(COLS_COUNT).fill("")];
  const firstCell = String(data[0]?.[0] || '');
  let rows = (firstCell.includes('№') || firstCell.toLowerCase() === 'no' || firstCell.toLowerCase() === 'no.') ? data.slice(1) : data;
  if (rows.length === 0) return [Array(COLS_COUNT).fill("")];
  return rows.map(row => {
    const newRow = Array(COLS_COUNT).fill('');
    if (Array.isArray(row)) {
      row.forEach((cell, i) => { if (i < COLS_COUNT) newRow[i] = cell });
    }
    
    // Automatically calculate Hammasi on load
    let sumR = 0;
    let sumH = 0;
    for (let i = 6; i <= 24; i += 2) {
      sumR += parseFloat(newRow[i]) || 0;
    }
    for (let i = 7; i <= 25; i += 2) {
      sumH += parseFloat(newRow[i]) || 0;
    }
    newRow[26] = sumR > 0 ? sumR.toString() : '';
    newRow[27] = sumH > 0 ? sumH.toString() : '';

    return newRow;
  });
};

export default function AcademicWork({ adminUserId, isDistributor }: { adminUserId?: string, isDistributor?: boolean }) {
  const { t } = useLanguage();

  const cachedData = (() => {
    const userId = adminUserId || localStorage.getItem('current_user_id') || '';
    if (!userId) return null;
    const cache = localStorage.getItem('cache_academic_work_' + userId);
    if (cache) {
      try { return JSON.parse(cache); } catch (_) { return null; }
    }
    return null;
  })();

  const [grid, setGrid] = useState<SemesterData>(cachedData || { kuzgi: DEFAULT_TEMPLATE, bahorgi: DEFAULT_TEMPLATE });
  const [savedData, setSavedData] = useState<SemesterData>(cachedData || { kuzgi: DEFAULT_TEMPLATE, bahorgi: DEFAULT_TEMPLATE });
  const [activeSemester, setActiveSemester] = useState<'kuzgi' | 'bahorgi'>('kuzgi');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(!cachedData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLockedByApproval, setIsLockedByApproval] = useState(false);
  
  const [openDropdown, setOpenDropdown] = useState<{r: number, c: number} | null>(null);
  const [availableGroups, setAvailableGroups] = useState<{id: string, name: string}[]>([]);
  
  const [distributeModalOpen, setDistributeModalOpen] = useState<number | null>(null);
  const [distributeTeachers, setDistributeTeachers] = useState<{id: string, full_name: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTeacher, setSearchTeacher] = useState('');

  useEffect(() => {
    if (adminUserId || isDistributor) {
       const globalGrps = localStorage.getItem('global_groups');
       if (globalGrps) {
           try { setAvailableGroups(JSON.parse(globalGrps)); } catch (e) {}
       }
    }
  }, [adminUserId, isDistributor]);

  useEffect(() => {
    if (isDistributor) {
      const fetchTeachers = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'pedagog')
          .order('full_name');
        if (data) setDistributeTeachers(data);
      };
      fetchTeachers();
    }
  }, [isDistributor]);

  const fetchData = useCallback(async () => {
    try {
      let targetUserId = adminUserId;
      if (!targetUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        targetUserId = session.user.id;
      }

      const { data, error } = await supabase
        .from('academic_works')
        .select('table_data')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.table_data) {
        const rawData = data.table_data;
        let formattedData: SemesterData;

        // Migration logic: check if data is old array format or new object format
        if (Array.isArray(rawData)) {
          formattedData = {
            kuzgi: fixData(rawData),
            bahorgi: DEFAULT_TEMPLATE,
            kuzgiLocked: {},
            bahorgiLocked: {},
            kuzgiExtraCols: [],
            bahorgiExtraCols: []
          };
        } else {
          formattedData = {
            kuzgi: fixData(rawData.kuzgi || []),
            bahorgi: fixData(rawData.bahorgi || []),
            kuzgiLocked: rawData.kuzgiLocked || {},
            bahorgiLocked: rawData.bahorgiLocked || {},
            kuzgiExtraCols: rawData.kuzgiExtraCols || [],
            bahorgiExtraCols: rawData.bahorgiExtraCols || [],
          };
        }

        setGrid(formattedData);
        setSavedData(formattedData);
        setIsEditing(false);
        localStorage.setItem('cache_academic_work_' + targetUserId, JSON.stringify(formattedData));
      } else {
        setGrid(initialData);
        setSavedData(initialData);
        setIsEditing(!!adminUserId);
        localStorage.setItem('cache_academic_work_' + targetUserId, JSON.stringify(initialData));
      }

      // Check approvals
      const { data: apprNote } = await supabase
        .from('personal_notes')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('title', 'APPROVALS_DATA')
        .maybeSingle();

      if (apprNote?.content) {
        try {
          const parsed = JSON.parse(apprNote.content);
          if (parsed.teacherApproved || parsed.kafedraApproved || parsed.dekanApproved) {
            setIsLockedByApproval(true);
          } else {
            setIsLockedByApproval(false);
          }
        } catch (_) {
          setIsLockedByApproval(false);
        }
      } else {
        setIsLockedByApproval(false);
      }
    } catch (err: any) {
      console.error('Error fetching academic work:', err);
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
        .from('academic_works')
        .upsert({
          user_id: targetUserId,
          table_data: grid,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setSavedData(grid);
      setIsEditing(false);
      localStorage.setItem('cache_academic_work_' + targetUserId, JSON.stringify(grid));
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
      setGrid(prev => ({
        ...prev,
        [activeSemester]: DEFAULT_TEMPLATE
      }));
    }
  };

  const [isDistributing, setIsDistributing] = useState(false);

  const distributeRowToTeacher = async (teacherId: string) => {
    if (distributeModalOpen === null) return;
    setIsDistributing(true);
    try {
      const rowIndex = distributeModalOpen;
      const rowToCopy = grid[activeSemester][rowIndex];

      // Fetch teacher's current table data
      const { data: teacherData, error: fetchErr } = await supabase
        .from('academic_works')
        .select('table_data')
        .eq('user_id', teacherId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      let formattedData: SemesterData;
      if (teacherData?.table_data) {
        const rawData = teacherData.table_data;
        if (Array.isArray(rawData)) {
          formattedData = {
            kuzgi: fixData(rawData),
            bahorgi: DEFAULT_TEMPLATE,
            kuzgiLocked: {}, bahorgiLocked: {}, kuzgiExtraCols: [], bahorgiExtraCols: []
          };
        } else {
          formattedData = {
            kuzgi: fixData(rawData.kuzgi || []),
            bahorgi: fixData(rawData.bahorgi || []),
            kuzgiLocked: rawData.kuzgiLocked || {},
            bahorgiLocked: rawData.bahorgiLocked || {},
            kuzgiExtraCols: rawData.kuzgiExtraCols || [],
            bahorgiExtraCols: rawData.bahorgiExtraCols || [],
          };
        }
      } else {
        formattedData = { ...initialData };
      }

      // Find the last NO. and add the new row
      const targetGrid = formattedData[activeSemester];
      const newRow = [...rowToCopy];
      
      const lastRowIndex = targetGrid.length - 1;
      const lastNo = parseInt(targetGrid[lastRowIndex]?.[0]);
      if (!isNaN(lastNo)) {
        newRow[0] = (lastNo + 1).toString();
      } else if (targetGrid.length === 1 && targetGrid[0].every(c => c === '')) {
        // if table is empty
        newRow[0] = "1";
        targetGrid.pop();
      } else {
         newRow[0] = (targetGrid.length + 1).toString();
      }

      formattedData[activeSemester] = [...targetGrid, newRow];

      // Update their table
      const { error: updateErr } = await supabase
        .from('academic_works')
        .upsert({
          user_id: teacherId,
          table_data: formattedData,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (updateErr) throw updateErr;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setDistributeModalOpen(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsDistributing(false);
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    if (colIndex === 26 || colIndex === 27) return;
    if (!adminUserId && colIndex === 2) return;
    const lockKey = `${activeSemester}Locked` as 'kuzgiLocked' | 'bahorgiLocked';
    const isLocked = grid[lockKey]?.[`${rowIndex}_${colIndex}`];
    const isHColumn = colIndex > 5 && colIndex < COLS_COUNT && colIndex % 2 === 1;
    if (!adminUserId && isLocked && !isHColumn) return;

    let finalValue = value;
    if (colIndex > 5 && colIndex < COLS_COUNT) {
       finalValue = finalValue.replace(/[^0-9.]/g, '');
       
       // Ensure 'h' (haqiqat) does not exceed 'r' (reja)
       if (!adminUserId && colIndex % 2 === 1 && finalValue !== '') {
         const currentRow = grid[activeSemester][rowIndex];
         const rValueStr = currentRow ? currentRow[colIndex - 1] : '0';
         const rValue = parseFloat(rValueStr) || 0;
         const hValue = parseFloat(finalValue) || 0;
         if (hValue > rValue) {
           finalValue = rValue.toString();
         }
       }
    }

    setGrid(prev => {
      const currentSemesterGrid = [...prev[activeSemester]];
      currentSemesterGrid[rowIndex] = [...currentSemesterGrid[rowIndex]];
      
      const oldVal = currentSemesterGrid[rowIndex][colIndex] || '';
      currentSemesterGrid[rowIndex][colIndex] = finalValue;
      
      // Automatically calculate "Hammasi" (Total) columns
      if (colIndex > 5 && colIndex < 26) {
        let sumR = 0;
        let sumH = 0;
        for (let i = 6; i <= 24; i += 2) {
          sumR += parseFloat(currentSemesterGrid[rowIndex][i]) || 0;
        }
        for (let i = 7; i <= 25; i += 2) {
          sumH += parseFloat(currentSemesterGrid[rowIndex][i]) || 0;
        }
        currentSemesterGrid[rowIndex][26] = sumR > 0 ? sumR.toString() : '';
        currentSemesterGrid[rowIndex][27] = sumH > 0 ? sumH.toString() : '';
      }

      let newLogs = prev.historyLogs || [];
      if (!adminUserId && isHColumn && oldVal !== finalValue) {
        newLogs = [{
          date: new Date().toISOString(),
          semester: activeSemester,
          row: rowIndex,
          col: colIndex,
          oldVal,
          newVal: finalValue
        }, ...newLogs].slice(0, 50);
      }

      return {
        ...prev,
        [activeSemester]: currentSemesterGrid,
        historyLogs: newLogs
      };
    });
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
    setGrid(prev => {
      const currentSemesterGrid = [...prev[activeSemester]];
      const extraColsCount = prev[`${activeSemester}ExtraCols` as 'kuzgiExtraCols' | 'bahorgiExtraCols']?.length || 0;
      const colCount = COLS_COUNT + extraColsCount;
      const newRow = Array(colCount).fill('');
      
      let nextNo = 1;
      const lastRowIndex = currentSemesterGrid.length - 1;
      if (lastRowIndex >= 0) {
        const lastNoStr = currentSemesterGrid[lastRowIndex]?.[0];
        const lastNo = parseInt(lastNoStr);
        if (!isNaN(lastNo)) {
           nextNo = lastNo + 1;
        } else {
           nextNo = currentSemesterGrid.length + 1;
        }
      }
      newRow[0] = nextNo.toString();
      
      return {
        ...prev,
        [activeSemester]: [...currentSemesterGrid, newRow]
      };
    });
  };

  const removeRow = (index: number) => {
    setGrid(prev => {
      const currentSemesterGrid = prev[activeSemester];
      if (currentSemesterGrid.length <= 1) return prev; 
      
      const newGrid = currentSemesterGrid.filter((_, i) => i !== index);
      return {
        ...prev,
        [activeSemester]: newGrid
      };
    });
  };

  const addColumn = () => {
    setGrid(prev => {
      const colKey = `${activeSemester}ExtraCols` as 'kuzgiExtraCols' | 'bahorgiExtraCols';
      const extraCols = [...(prev[colKey] || [])];
      extraCols.push(`Yangi ustun ${extraCols.length + 1}`);
      
      const currentSemesterGrid = prev[activeSemester].map(row => [...row, '']);
      
      return {
        ...prev,
        [colKey]: extraCols,
        [activeSemester]: currentSemesterGrid
      };
    });
  };

  const updateColumnName = (colIndex: number, newName: string) => {
    setGrid(prev => {
      const colKey = `${activeSemester}ExtraCols` as 'kuzgiExtraCols' | 'bahorgiExtraCols';
      const extraCols = [...(prev[colKey] || [])];
      extraCols[colIndex] = newName;
      return {
        ...prev,
        [colKey]: extraCols
      };
    });
  };

  const removeColumn = (colIndex: number) => {
    if (!confirm("Ushbu ustunni va undagi barcha ma'lumotlarni o'chirmoqchimisiz?")) return;
    setGrid(prev => {
      const colKey = `${activeSemester}ExtraCols` as 'kuzgiExtraCols' | 'bahorgiExtraCols';
      const extraCols = [...(prev[colKey] || [])];
      extraCols.splice(colIndex, 1);
      
      const absoluteColIndex = COLS_COUNT + colIndex;
      const currentSemesterGrid = prev[activeSemester].map(row => {
        const newRow = [...row];
        newRow.splice(absoluteColIndex, 1);
        return newRow;
      });
      
      return {
        ...prev,
        [colKey]: extraCols,
        [activeSemester]: currentSemesterGrid
      };
    });
  };

  const toggleCellLock = (rowIndex: number, colIndex: number) => {
    if (!adminUserId) return;
    setGrid(prev => {
      const lockKey = `${activeSemester}Locked` as 'kuzgiLocked' | 'bahorgiLocked';
      const locks = { ...(prev[lockKey] || {}) };
      const cellKey = `${rowIndex}_${colIndex}`;
      if (locks[cellKey]) {
        delete locks[cellKey];
      } else {
        locks[cellKey] = true;
      }
      return {
        ...prev,
        [lockKey]: locks
      };
    });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        if (data && data.length > 0) {
          if (window.confirm("Excel faylidagi ma'lumotlar ushbu ko'rinishda jadvalga qo'llanilsinmi? (Joriy semestr ma'lumotlari ustidan yoziladi)")) {
            // Re-apply length fix logic natively, keeping whatever was loaded plus empty columns if missing
            const rows = (String(data[0]?.[0] || '').includes('№') || String(data[0]?.[0] || '').toLowerCase() === 'no' || String(data[0]?.[0] || '').toLowerCase() === 'no.') ? data.slice(1) : data;
            const extraColsCount = grid[`${activeSemester}ExtraCols` as 'kuzgiExtraCols' | 'bahorgiExtraCols']?.length || 0;
            const targetColsCount = COLS_COUNT + extraColsCount;

            const newGrid = rows.map(row => {
              const newRow = Array(targetColsCount).fill('');
              if (Array.isArray(row)) {
                row.forEach((cell, i) => { if (i < targetColsCount && cell !== undefined && cell !== null) newRow[i] = String(cell) });
              }
              return newRow;
            });
            if (newGrid.length === 0) newGrid.push(Array(targetColsCount).fill(''));
            
            setGrid(prev => ({
               ...prev,
               [activeSemester]: newGrid
            }));
            setIsEditing(true);
          }
        } else {
          setError("Excel faylidan ma'lumot o'qib bo'lmadi yoki bo'sh.");
          setTimeout(() => setError(null), 3000);
        }
      } catch (err) {
        console.error(err);
        setError("Excel faylini tahlil qilishda xatolik yuz berdi.");
        setTimeout(() => setError(null), 3000);
      }
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const currentGrid = grid[activeSemester];
  const extraColumns = grid[`${activeSemester}ExtraCols` as 'kuzgiExtraCols' | 'bahorgiExtraCols'] || [];
  const lockedCells = grid[`${activeSemester}Locked` as 'kuzgiLocked' | 'bahorgiLocked'] || {};

  return (
    <div className="max-w-full overflow-x-hidden pb-12">
      {isLockedByApproval && !adminUserId && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-3 font-semibold text-sm shadow-sm print:hidden">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Ushbu o'quv ishi tasdiqlangan va yillik faoliyat hisobotingiz muhrlangan. Jadvallarni tahrirlash cheklangan.</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('academicWork')}</h1>
          <p className="text-gray-500 mt-1">O'quv yuklamalarini boshqarish jadvali.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isDistributor && (
            <label className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-all shadow-sm cursor-pointer print:hidden">
              <FileUp className="w-4 h-4" />
              Excel dan o'qish
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleExcelImport} 
                className="hidden" 
              />
            </label>
          )}
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
            <>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm print:hidden"
              >
                <Printer className="w-4 h-4" />
                Chop etish
              </button>
              {!(isLockedByApproval && !adminUserId) && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 print:hidden"
                >
                  <Pencil className="w-4 h-4" />
                  Tahrirlash
                </button>
              )}
            </>
          )}
          
          {isEditing && (
            <>
              {!adminUserId && (
                <button
                  onClick={() => setGrid(prev => ({ ...prev, teacherAllowsEdit: !prev.teacherAllowsEdit }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm print:hidden ${grid.teacherAllowsEdit ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  title="Tahrirlovchiga haqiqat ustunini tahrirlashga ruxsat berish"
                >
                  {grid.teacherAllowsEdit ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {grid.teacherAllowsEdit ? "Muharrirga ruxsat" : "Tahrir yopiq"}
                </button>
              )}
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
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-sm"
                    title="Yangi ustun qo'shish"
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
          )}
        </div>
      </div>

      {/* Semester Selection Tabs */}
      <div className="flex items-center p-1 bg-gray-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveSemester('kuzgi')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeSemester === 'kuzgi'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Kuzgi semestr
        </button>
        <button
          onClick={() => setActiveSemester('bahorgi')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeSemester === 'bahorgi'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto relative">
        <h2 className="text-center font-bold text-xl py-4 italic">1. O'QUV ISHLARI</h2>
        
        <table className="w-max border-collapse min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50 leading-tight">
              <th rowSpan={3} className="border border-black p-2 font-bold min-w-[40px] max-w-[60px] text-center bg-gray-50">№</th>
              <th rowSpan={3} className="border border-black p-2 font-bold min-w-[200px] max-w-[250px] text-center bg-gray-50">Fan nomi</th>
              <th rowSpan={3} className="border border-black p-2 font-bold min-w-[120px] max-w-[150px] text-center bg-gray-50">Guruh(lar)</th>
              <th rowSpan={3} className="border border-black p-1 text-center bg-gray-50 align-bottom h-[180px]">
                <div className="w-[30px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 font-bold max-h-[160px]">Kurs</div>
              </th>
              <th rowSpan={3} className="border border-black p-1 text-center bg-gray-50 align-bottom h-[180px]">
                <div className="w-[30px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 font-bold max-h-[160px]">Talabalar soni</div>
              </th>
              <th rowSpan={3} className="border border-black p-1 text-center bg-gray-50 align-bottom h-[180px]">
                <div className="w-[30px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 font-bold max-h-[160px]">Akademguruhlar soni</div>
              </th>
              <th colSpan={20} className="border border-black p-2 text-center font-bold bg-gray-50">Jami soatlar</th>
              <th rowSpan={2} colSpan={2} className="border border-black p-1 text-center bg-gray-50 align-bottom h-[180px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 font-bold max-h-[160px]">Hammasi</div>
              </th>
              {extraColumns.map((colName, idx) => (
                <th key={`extra-th-${idx}`} rowSpan={3} className="border border-black p-2 font-bold min-w-[120px] max-w-[200px] text-center bg-indigo-50/50 relative group">
                  {isEditing && adminUserId ? (
                    <>
                      <textarea
                        value={colName} 
                        onChange={(e) => updateColumnName(idx, e.target.value)} 
                        className="w-full h-full min-h-[60px] bg-transparent text-center outline-none border-b border-dashed border-indigo-300 focus:border-indigo-600 font-bold resize-none" 
                        placeholder="Yangi ustun nomi"
                      />
                      <button onClick={() => removeColumn(idx)} className="absolute -top-3 -right-3 bg-white border border-gray-200 text-red-600 shadow-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-50 hover:scale-110" title="Ustunni o'chirish">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    colName
                  )}
                </th>
              ))}
              {isDistributor && <th rowSpan={4} className="border border-black bg-indigo-50/50 min-w-[200px] text-center font-bold">O'qituvchiga<br/>Biriktirish</th>}
              {isEditing && adminUserId && <th rowSpan={4} className="w-12 border bg-gray-50"></th>}
            </tr>
            <tr className="bg-gray-50 leading-tight">
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Ma'ruza</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Amaliy (laboratoriya, semina)</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">BMI va MD</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Malakaviy amaliyot</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Kurs ishi va himoyasi</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Oraliq va yakuniy baholash, YADAK</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Tadqiqotchilarga ilmiy maslahatchilik qilish</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Ochiq dars va master klass o'tkazish</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Qayta tayyorlash va malaka oshirish</div>
              </th>
              <th colSpan={2} className="border border-black p-1 text-center font-bold align-bottom h-[200px]">
                <div className="w-[40px] mx-auto text-center [writing-mode:vertical-rl] rotate-180 max-h-[180px]">Sirtqi bo'lim talabalarining nazorat ishlariga taqriz yozish</div>
              </th>
            </tr>
            <tr className="bg-gray-50 leading-tight">
              {Array.from({ length: 11 }).map((_, i) => (
                <React.Fragment key={i}>
                  <th className="border border-black p-1.5 text-center font-bold w-[35px]">r</th>
                  <th className="border border-black p-1.5 text-center font-bold w-[35px]">h</th>
                </React.Fragment>
              ))}
            </tr>
            <tr className="bg-gray-100/80">
              <th colSpan={COLS_COUNT + extraColumns.length} className="border border-black p-2.5 text-center font-bold text-base tracking-widest uppercase bg-gray-100">
                {activeSemester === 'kuzgi' ? 'KUZGI SEMESTER' : 'BAHORGI SEMESTER'}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentGrid.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-indigo-50/30 transition-colors group/row">
                {Array.from({ length: COLS_COUNT + extraColumns.length }).map((_, colIndex) => {
                  const isLocked = lockedCells[`${rowIndex}_${colIndex}`];
                  const isHColumn = colIndex > 5 && colIndex < COLS_COUNT && colIndex % 2 === 1;
                  const isTeacherReadOnly = !adminUserId && !isHColumn;
                  const isAdminReadOnly = !!adminUserId && isHColumn && !grid.teacherAllowsEdit;
                  const isTotalColumn = colIndex === 26 || colIndex === 27;
                  const isReadOnly = isTotalColumn || isTeacherReadOnly || isAdminReadOnly;
                  return (
                    <td key={colIndex} className="border border-black p-0 h-full relative group/cell">
                      {isEditing ? (
                        <>
                          <textarea
                            value={row[colIndex] || ''}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            onKeyDown={handleKeyDown}
                            onClick={() => { if (adminUserId && colIndex === 2) setOpenDropdown({ r: rowIndex, c: colIndex }); }}
                            readOnly={isReadOnly}
                            className={`w-full h-full min-h-[44px] bg-transparent text-gray-800 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all ${isReadOnly ? 'bg-gray-100/80 text-gray-500 cursor-not-allowed' : (isLocked && adminUserId ? 'bg-red-50/30 text-gray-600' : '')} ${[0,3,4,5].includes(colIndex) || (colIndex > 5 && colIndex < COLS_COUNT) ? 'text-center' : 'px-2 py-1'}`}
                          />
                          {adminUserId && colIndex === 2 && openDropdown?.r === rowIndex && openDropdown?.c === colIndex && (
                              <div className="absolute top-[100%] left-0 z-[60] bg-white border border-gray-200 shadow-xl shadow-indigo-100 rounded-xl p-2 mt-1 max-h-60 overflow-y-auto min-w-[200px]">
                                <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b border-gray-100">
                                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Guruhlarni tanlang</span>
                                   <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Yopish">
                                     <X className="w-4 h-4" />
                                   </button>
                                </div>
                                {availableGroups.length === 0 ? (
                                   <div className="text-gray-400 text-xs italic p-2 text-center">Guruhlar mavjud emas</div>
                                ) : (
                                   <div className="flex flex-col gap-1">
                                      {availableGroups.map((g) => {
                                         const currentVal = row[colIndex] || '';
                                         const groupsArr = currentVal ? currentVal.split(',').map(s => s.trim()).filter(Boolean) : [];
                                         const isSelected = groupsArr.includes(g.name);
                                         return (
                                            <label key={g.id} className="flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors group/item relative">
                                               <input 
                                                  type="checkbox"
                                                  checked={isSelected}
                                                  onChange={() => {
                                                      let newVal = '';
                                                      if (isSelected) {
                                                          newVal = groupsArr.filter(x => x !== g.name).join(', ');
                                                      } else {
                                                          newVal = [...groupsArr, g.name].join(', ');
                                                      }
                                                      updateCell(rowIndex, 2, newVal);
                                                  }}
                                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-all cursor-pointer"
                                               />
                                               <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>{g.name}</span>
                                            </label>
                                         );
                                      })}
                                   </div>
                                )}
                              </div>
                          )}
                          {adminUserId && (
                             <button onClick={() => toggleCellLock(rowIndex, colIndex)} className={`absolute top-0 right-0 p-1 rounded-bl-md z-10 transition-opacity opacity-0 group-hover/cell:opacity-100 ${isLocked ? 'bg-red-100/90 text-red-600 hover:bg-red-200 shadow-sm' : 'bg-white/90 text-gray-400 hover:text-indigo-600 border-l border-b border-gray-200 shadow-sm'}`} title={isLocked ? "O'qituvchi o'zgartira olmaydi (Ochish uchun bosing)" : "Qulflash"}>
                               {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                             </button>
                          )}
                        </>
                      ) : (
                        <div className={`w-full h-full min-h-[44px] flex items-center text-gray-800 text-sm whitespace-pre-wrap ${[0,3,4,5].includes(colIndex) || (colIndex > 5 && colIndex < COLS_COUNT) ? 'justify-center' : 'px-2'}`}>
                          {row[colIndex]}
                        </div>
                      )}
                    </td>
                  );
                })}
                {isDistributor && (
                  <td className="border border-gray-200 p-2 text-center bg-indigo-50/20 relative min-w-[200px]">
                    <button
                      onClick={() => setDistributeModalOpen(rowIndex)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-bold transition-colors shadow-sm"
                    >
                      O'qituvchiga biriktirish
                    </button>
                  </td>
                )}
                {isEditing && adminUserId && (
                  <td className="border border-gray-200 p-0 text-center bg-gray-50 group-hover/row:bg-red-50 transition-colors relative w-12">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="w-full h-full min-h-[44px] absolute inset-0 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                      title="Qatorni o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            <tr className="bg-gray-50/80 font-bold border-t-2 border-black">
              <td colSpan={6} className="border border-black p-2 text-lg text-center tracking-wider">
                JAMI
              </td>
              {Array.from({ length: COLS_COUNT - 6 + extraColumns.length }).map((_, idx) => {
                const colIndex = idx + 6;
                let sum = 0;
                let hasNumber = false;
                currentGrid.forEach(row => {
                  const valStr = row[colIndex];
                  if (valStr && valStr.trim() !== '') {
                    const parsed = parseFloat(valStr.replace(/,/g, '.'));
                    if (!isNaN(parsed)) {
                      sum += parsed;
                      hasNumber = true;
                    }
                  }
                });
                return (
                  <td key={`total-${colIndex}`} className="border border-black p-2 text-center text-sm md:text-base h-[44px]">
                    {hasNumber && sum > 0 ? Number(sum.toFixed(2)) : ''}
                  </td>
                );
              })}
              {isDistributor && <td className="border border-gray-200 bg-gray-50/80"></td>}
              {isEditing && adminUserId && (
                <td className="border border-gray-200 bg-gray-50/80"></td>
              )}
            </tr>
            <tr className="bg-indigo-50/80 font-bold border-t-[3px] border-black text-gray-900">
              <td colSpan={6} className="border border-black p-2 text-lg text-center tracking-wider uppercase">
                HAMMASI
              </td>
              {Array.from({ length: COLS_COUNT - 6 + extraColumns.length }).map((_, idx) => {
                const colIndex = idx + 6;
                let sum = 0;
                let hasNumber = false;
                // Calculate from both semesters
                const allRows = [...(grid.kuzgi || []), ...(grid.bahorgi || [])];
                allRows.forEach(row => {
                  const valStr = row[colIndex];
                  if (valStr && valStr.trim() !== '') {
                    const parsed = parseFloat(valStr.replace(/,/g, '.'));
                    if (!isNaN(parsed)) {
                      sum += parsed;
                      hasNumber = true;
                    }
                  }
                });
                return (
                  <td key={`grand-total-${colIndex}`} className="border border-black p-2 text-center text-sm md:text-base h-[44px] bg-indigo-100/50">
                    {hasNumber && sum > 0 ? Number(sum.toFixed(2)) : ''}
                  </td>
                );
              })}
              {isDistributor && <td className="border border-gray-200 bg-indigo-50/80"></td>}
              {isEditing && adminUserId && (
                <td className="border border-gray-200 bg-indigo-50/80"></td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <Rows className="w-4 h-4 text-indigo-400" />
          <span>Jadval katakchalarini to'g'ridan-to'g'ri tahrirlashingiz mumkin. O'zgarishlarni saqlashni unutmang.</span>
        </div>
        {adminUserId && (
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-red-400" />
            <span>Tahrirlovchi rejimidagi qo'shimcha imkoniyat: kataklarni qulflash orqali o'qituvchining ma'lumot kiritishini cheklashingiz mumkin.</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {distributeModalOpen !== null && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">O'qituvchiga biriktirish</h3>
                <button onClick={() => setDistributeModalOpen(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="O'qituvchini qidiring..." 
                    value={searchTeacher}
                    onChange={(e) => setSearchTeacher(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {distributeTeachers
                    .filter(t => (t.full_name || '').toLowerCase().includes(searchTeacher.toLowerCase()))
                    .map(teacher => (
                      <div key={teacher.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
                        <div>
                          <div className="font-bold text-gray-900">{teacher.full_name || 'Ismsiz'}</div>
                          <div className="text-xs text-gray-500">ID: {teacher.id.slice(0,8)}</div>
                        </div>
                        <button
                          onClick={() => distributeRowToTeacher(teacher.id)}
                          disabled={isDistributing}
                          className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          Biriktirish
                        </button>
                      </div>
                    ))}
                  {distributeTeachers.length === 0 && (
                    <div className="text-center p-4 text-gray-500 text-sm">O'qituvchilar topilmadi</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
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
                {(!grid.historyLogs || grid.historyLogs.length === 0) ? (
                  <div className="text-center p-8 text-gray-400 italic">O'zgarishlar tarixi bo'sh</div>
                ) : (
                  grid.historyLogs.map((log, idx) => {
                     // Find column name
                     let colName = "Noma'lum ustun";
                     if (log.col > 5 && log.col < 26) {
                        colName = 'Haqiqat soati';
                     }
                     return (
                       <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col gap-2 relative">
                         <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded shadow-sm">Qator: {log.row + 1}</span>
                            <span className="text-xs font-semibold text-gray-400">{new Date(log.date).toLocaleString()}</span>
                         </div>
                         <div className="text-sm text-gray-700">
                            <strong>{log.semester === 'kuzgi' ? 'Kuzgi' : 'Bahorgi'} semester:</strong> {colName} qismi o'zgartirildi.
                         </div>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold line-through">{log.oldVal || '0'}</span>
                            <span className="text-gray-400 text-xs">→</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{log.newVal || '0'}</span>
                         </div>
                       </div>
                     );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
