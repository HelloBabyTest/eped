import React, { useState, useEffect } from 'react';
import { Scale, Edit2, Save, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Position {
  id: number;
  position: string;
  total: string;
  auditory: string;
  foreign: string;
  methodical: string;
  scientific: string;
  mentor: string;
}

const DEFAULT_POSITIONS: Position[] = [
  {
    id: 1,
    position: "Kafedra mudiri",
    total: "500-550",
    auditory: "250",
    foreign: "180",
    methodical: "Darslik, o'quv qo'llanma (yakkamualliflik yoki hammualliflikda kamida 1 ta), uslubiy qo'llanma 1 ta yaratish va nashr etish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    scientific: "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Tashkilotlarda ma'ruzalar qilish, ommaviy axborot vositalarida (kamida bir marotaba) chiqishlar qilish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    id: 2,
    position: "Professor (akademik)",
    total: "500-550",
    auditory: "150",
    foreign: "120",
    methodical: "Darslik, o'quv qo'llanma (yakkamualliflik yoki hammualliflikda kamida 2 ta), uslubiy qo'llanma 1 ta yaratish va nashr etish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    scientific: "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Tashkilotlarda ma'ruzalar qilish, ommaviy axborot vositalarida (kamida bir marotaba) chiqishlar qilish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    id: 3,
    position: "Professor (fan doktori)",
    total: "500-550",
    auditory: "250",
    foreign: "180",
    methodical: "Darslik, o'quv qo'llanma (yakkamualliflik yoki hammualliflikda kamida 2 ta), uslubiy qo'llanma 1 ta yaratish va nashr etish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    scientific: "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Tashkilotlarda ma'ruzalar qilish, ommaviy axborot vositalarida (kamida bir marotaba) chiqishlar qilish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    id: 4,
    position: "Dotsent (fan doktori)",
    total: "500-550",
    auditory: "300",
    foreign: "200",
    methodical: "Darslik, o'quv qo'llanma, uslubiy qo'llanma (yakkamualliflik yoki hammualliflikda kamida 2 ta fandan) yaratish va nashr etish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    scientific: "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Talabaning shaxsiy va akademik yutuqlarini rivojlantirish maqsadida (kamida ikki marotaba) uchrashuvlar o'tkazish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    id: 5,
    position: "Professor (fan nomzodi (PhD))",
    total: "500-550",
    auditory: "300",
    foreign: "200",
    methodical: "O'quv qo'llanma, uslubiy qo'llanma (yakkamualliflik yoki hammualliflikda kamida 2 ta fandan) yaratish va nashr etish, 1ta fanning o'quv kontentini ishlab chiqish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    scientific: "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Talabaning shaxsiy va akademik yutuqlarini rivojlantirish maqsadida (kamida ikki marotaba) uchrashuvlar o'tkazish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    id: 6,
    position: "Professor (ilmiy darajasiz)",
    total: "500-550",
    auditory: "350",
    foreign: "250",
    methodical: "O'quv qo'llanma, uslubiy qo'llanma (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan yaratish va nashr etish, fanning o'quv kontentini tayyorlash, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    scientific: "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Talabaning shaxsiy va akademik yutuqlarini rivojlantirish maqsadida (kamida ikki marotaba) uchrashuvlar o'tkazish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    id: 7,
    position: "Dotsent (fan nomzodi (PhD))",
    total: "500-550",
    auditory: "350",
    foreign: "250",
    methodical: "O'quv qo'llanma, uslubiy qo'llanma (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan yaratish va nashr etish, fanning o'quv kontentini tayyorlash, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    scientific: "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Talabaning shaxsiy va akademik yutuqlarini rivojlantirish maqsadida (kamida ikki marotaba) uchrashuvlar o'tkazish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    id: 8,
    position: "Dotsent (ilmiy darajasiz)",
    total: "500-550",
    auditory: "400",
    foreign: "270",
    methodical: "Tarqatma o'quv materiallari, elektron o'quv dasturlar va video mashg'ulotlar (yakkamualliflikda kamida 1 ta fan doirasida), fanning o'quv kontentini (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan) tayyorlash;",
    scientific: "Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola, xalqaro va Respublika ilmiy anjumanlari to'plamida 2 ta ilmiy tezis chop etish, ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Talabalarning ota-onalari bilan ishlash; Bitiruvchilarning ishini, shu jumladan, vaqtni monitoring qilish (kamida 5 nafar talaba); Sport, madaniy-ma'rifiy va ijodiy tadbirlarni (kamida ikki marotaba) tashkil etish va o'tkazish."
  },
  {
    id: 9,
    position: "Katta o'qituvchi (fan nomzodi (PhD))",
    total: "500-550",
    auditory: "400",
    foreign: "270",
    methodical: "Tarqatma o'quv materiallari, elektron o'quv dasturlar va video mashg'ulotlar (yakkamualliflikda kamida 1 ta fan doirasida), fanning o'quv kontentini (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan) tayyorlash;",
    scientific: "Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola, xalqaro va Respublika ilmiy anjumanlari to'plamida 2 ta ilmiy tezis chop etish, ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    mentor: "Talabalarning ota-onalari bilan ishlash; Bitiruvchilarning ishini, shu jumladan, vaqtni monitoring qilish (kamida 5 nafar talaba); Sport, madaniy-ma'rifiy va ijodiy tadbirlarni (kamida ikki marotaba) tashkil etish va o'tkazish."
  },
  {
    id: 10,
    position: "Katta o'qituvchi (ilmiy darajasiz)",
    total: "500-550",
    auditory: "420",
    foreign: "300",
    methodical: "Tarqatma o'quv materiallari, elektron o'quv dasturlar va video mashg'ulotlar (yakkamualliflikda kamida 1 ta fan doirasida), fanning o'quv kontentini (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan) tayyorlash;",
    scientific: "Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola, xalqaro va Respublika ilmiy anjumanlari to'plamida 2 ta ilmiy tezis chop etish, ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish.",
    mentor: "Talabalarning ota-onalari bilan ishlash; Bitiruvchilarning ishini, shu jumladan, vaqtni monitoring qilish (kamida 5 nafar talaba); Sport, madaniy-ma'rifiy va ijodiy tadbirlarni (kamida ikki marotaba) tashkil etish va o'tkazish."
  },
  {
    id: 11,
    position: "Assistent",
    total: "500-550",
    auditory: "450",
    foreign: "320",
    methodical: "Fanning o'quv kontentini ishlab chiqish va fanning elektron modul papkasini yaratish, fanlar bo'yicha nazorat savollari (test, masalalar va boshqa), oraliq va yakuniy baholashlar uchun topshiriqlarni (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan)yaratish va nashr etish.",
    scientific: "Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 1 ta ilmiy maqola, xalqaro va Respublika ilmiy anjumanlari to'plamida 2 ta ilmiy tezis chop etish;",
    mentor: "Talabalarning ota-onalari bilan ishlash; Bitiruvchilarning ishini, shu jumladan, vaqtni monitoring qilish (kamida 5 nafar talaba); Sport, madaniy-ma'rifiy va ijodiy tadbirlarni (kamida ikki marotaba) tashkil etish va o'tkazish."
  }
];

export default function Norms({ adminUserId }: { adminUserId?: string }) {
  const [positions, setPositions] = useState<Position[]>(DEFAULT_POSITIONS);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile && ['admin', 'tahrirlovchi', 'rahbariyat'].includes(profile.role)) {
          setCanEdit(true);
        }
      }
    };

    const fetchNorms = async () => {
      try {
        const { data, error } = await supabase
          .from('university_norms')
          .select('norms_data')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.norms_data) {
          setPositions(data.norms_data);
        }
      } catch (err) {
        console.error('Error fetching norms:', err);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
    fetchNorms();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('university_norms')
        .insert({ norms_data: positions, updated_at: new Date().toISOString() });

      if (error) throw error;
      setIsEditing(false);
      alert('Me\'yorlar muvaffaqiyatli saqlandi!');
    } catch (err: any) {
      alert('Xatolik yuz berdi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updatePosition = (id: number, field: keyof Position, value: string) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addRow = () => {
    const nextId = Math.max(...positions.map(p => p.id), 0) + 1;
    setPositions([...positions, {
      id: nextId,
      position: "",
      total: "",
      auditory: "",
      foreign: "",
      methodical: "",
      scientific: "",
      mentor: ""
    }]);
  };

  const deleteRow = (id: number) => {
    if (confirm('Ushbu qatorni o\'chirmoqchimisiz?')) {
      setPositions(positions.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Scale className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Toshkent davlat iqtisodiyot universiteti professor-o'qituvchilar faoliyatining auditoriya o'quv yuklamasi hamda o'quv-uslubiy, ilmiy-tadqiqot va «ustoz-shogird» tusdagi ishlari bo'yicha soatlar hajmi hisoblanmaydigan ish turlari
            </h1>
          </div>
          
          {canEdit && (
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Saqlash
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    <X className="w-4 h-4" />
                    Bekor qilish
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  <Edit2 className="w-4 h-4" />
                  Tahrirlash
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 relative">
        <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-800/50">
              <th rowSpan={2} className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-12 align-middle">
                №
              </th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-60 align-middle">
                Professor-o'qituvchi lavozimi, unvoni
              </th>
              <th colSpan={3} className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center">
                O'quv ishlari (minimal)
              </th>
              <th colSpan={3} className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center">
                Soatlar hajmi hisoblanmaydigan ish turlari me'yorlari, sonda
              </th>
              {isEditing && (
                <th rowSpan={2} className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-12 align-middle">
                  <Trash2 className="w-4 h-4 mx-auto" />
                </th>
              )}
            </tr>
            <tr className="bg-gray-50/80 dark:bg-gray-800/50">
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-24">
                Jami
              </th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-24">
                Auditoriya soatlari
              </th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-32">
                Shu jumladan, xorijiy o'qituvchiga
              </th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-1/4">
                o'quv-uslubiy
              </th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-1/4">
                ilmiy-tadqiqot
              </th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-center w-1/4">
                «ustoz-shogird»
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900">
            {positions.map((pos, index) => (
              <tr key={pos.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 text-center font-medium text-gray-900 dark:text-gray-100 align-middle">
                  {index + 1}
                </td>
                <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100 align-middle">
                  {isEditing ? (
                    <textarea 
                      value={pos.position} 
                      onChange={(e) => updatePosition(pos.id, 'position', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded p-1 resize-none text-center"
                      rows={2}
                    />
                  ) : (
                    <div className="text-center">
                      {pos.id >= 2 && pos.id <= 10 ? (
                        <span>
                          {pos.position.split('(')[0]}
                          {pos.position.includes('(') && (
                            <><br/><span className="italic font-normal">({pos.position.split('(')[1]}</span></>
                          )}
                        </span>
                      ) : pos.position}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300 align-middle">
                  {isEditing ? (
                    <input 
                      value={pos.total} 
                      onChange={(e) => updatePosition(pos.id, 'total', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded p-1 text-center"
                    />
                  ) : pos.total}
                </td>
                <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300 align-middle font-medium">
                  {isEditing ? (
                    <input 
                      value={pos.auditory} 
                      onChange={(e) => updatePosition(pos.id, 'auditory', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded p-1 text-center"
                    />
                  ) : pos.auditory}
                </td>
                <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300 align-middle">
                  {isEditing ? (
                    <input 
                      value={pos.foreign} 
                      onChange={(e) => updatePosition(pos.id, 'foreign', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded p-1 text-center"
                    />
                  ) : pos.foreign}
                </td>
                <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 align-top leading-relaxed text-xs">
                  {isEditing ? (
                    <textarea 
                      value={pos.methodical} 
                      onChange={(e) => updatePosition(pos.id, 'methodical', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded p-1 resize-y min-h-[80px]"
                    />
                  ) : pos.methodical}
                </td>
                <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 align-top leading-relaxed text-xs">
                  {isEditing ? (
                    <textarea 
                      value={pos.scientific} 
                      onChange={(e) => updatePosition(pos.id, 'scientific', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded p-1 resize-y min-h-[80px]"
                    />
                  ) : pos.scientific}
                </td>
                <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 align-top leading-relaxed text-xs">
                  {isEditing ? (
                    <textarea 
                      value={pos.mentor} 
                      onChange={(e) => updatePosition(pos.id, 'mentor', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded p-1 resize-y min-h-[80px]"
                    />
                  ) : pos.mentor}
                </td>
                {isEditing && (
                  <td className="px-4 py-4 border border-gray-200 dark:border-gray-700 text-center align-middle">
                    <button onClick={() => deleteRow(pos.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {isEditing && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center sticky left-0 right-0">
             <button
               onClick={addRow}
               className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-md"
             >
               <Plus className="w-4 h-4" />
               Yangi qator qo'shish
             </button>
          </div>
        )}
      </div>
      <div className="text-sm font-bold italic mt-4 text-gray-800 dark:text-gray-200 text-right pr-4">
        Universitet Kengashining 2025 yil 26 avgustdagi 1/4-sonli qaroriga muvofiq keltirildi.
      </div>
    </div>
  );
}
