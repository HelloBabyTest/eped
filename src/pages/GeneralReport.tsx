import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Printer, CheckCircle2, ShieldCheck, Download, 
  Award, QrCode, ClipboardCheck, ArrowLeft, Loader2,
  Calendar, Lock, Users, FlaskConical, Library, GraduationCap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ApprovalsData {
  teacherApproved: boolean;
  teacherApprovedDate?: string;
  teacherApprovedName?: string;
  kafedraApproved: boolean;
  kafedraApprovedDate?: string;
  kafedraApprovedName?: string;
  dekanApproved: boolean;
  dekanApprovedDate?: string;
  dekanApprovedName?: string;
}

export default function GeneralReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyParam = searchParams.get('verify');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileRole, setProfileRole] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Table states
  const [academicData, setAcademicData] = useState<any>(null);
  const [methodicalGrid, setMethodicalGrid] = useState<any[]>([]);
  const [scientificGrid, setScientificGrid] = useState<any[]>([]);
  const [mentorGrid, setMentorGrid] = useState<any[]>([]);

  // Approvals
  const [approvals, setApprovals] = useState<ApprovalsData>({
    teacherApproved: false,
    kafedraApproved: false,
    dekanApproved: false
  });

  const [savingApprovals, setSavingApprovals] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        // Get logged in user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !verifyParam) {
          navigate('/login');
          return;
        }

        if (session) {
          setCurrentUser(session.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            setProfileRole(profile.role);
          }
        }

        // Target user is either verify parameter or the logged in user
        const uid = verifyParam || session?.user?.id;
        if (!uid) return;

        setTargetUserId(uid);

        // Fetch target teacher professional info
        const { data: teacherProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single();
        if (teacherProf) {
          setTeacherProfile(teacherProf);
        }

        // Load tables
        // 1. Academic Works
        const { data: ac } = await supabase.from('academic_works').select('table_data').eq('user_id', uid).maybeSingle();
        if (ac?.table_data) {
          setAcademicData(ac.table_data);
        }

        // 2. Methodical Works
        const { data: me } = await supabase.from('methodical_works').select('table_data').eq('user_id', uid).maybeSingle();
        if (me?.table_data) {
          const raw = me.table_data as any;
          setMethodicalGrid(Array.isArray(raw) ? raw : (raw.grid || []));
        }

        // 3. Scientific Works
        const { data: sc } = await supabase.from('scientific_works').select('table_data').eq('user_id', uid).maybeSingle();
        if (sc?.table_data) {
          const raw = sc.table_data as any;
          setScientificGrid(Array.isArray(raw) ? raw : (raw.grid || []));
        }

        // 4. Mentor Works
        const { data: mn } = await supabase.from('mentor_works').select('table_data').eq('user_id', uid).maybeSingle();
        if (mn?.table_data) {
          const raw = mn.table_data as any;
          setMentorGrid(Array.isArray(raw) ? raw : (raw.grid || []));
        }

        // Fetch approvals from personal_notes with title 'APPROVALS_DATA'
        const { data: apprNote } = await supabase
          .from('personal_notes')
          .select('*')
          .eq('user_id', uid)
          .eq('title', 'APPROVALS_DATA')
          .maybeSingle();

        if (apprNote?.content) {
          try {
            const parsed = JSON.parse(apprNote.content);
            setApprovals({
              teacherApproved: parsed.teacherApproved || false,
              teacherApprovedDate: parsed.teacherApprovedDate || '',
              teacherApprovedName: parsed.teacherApprovedName || '',
              kafedraApproved: parsed.kafedraApproved || false,
              kafedraApprovedDate: parsed.kafedraApprovedDate || '',
              kafedraApprovedName: parsed.kafedraApprovedName || '',
              dekanApproved: parsed.dekanApproved || false,
              dekanApprovedDate: parsed.dekanApprovedDate || '',
              dekanApprovedName: parsed.dekanApprovedName || ''
            });

            // Write locks back to localStorage so other pages respect it instantly
            localStorage.setItem(`approved_yearly_${uid}`, parsed.teacherApproved ? 'true' : 'false');
            localStorage.setItem(`approved_academic_${uid}`, parsed.teacherApproved ? 'true' : 'false');
            localStorage.setItem(`approved_methodical_${uid}`, parsed.teacherApproved ? 'true' : 'false');
            localStorage.setItem(`approved_scientific_${uid}`, parsed.teacherApproved ? 'true' : 'false');
            localStorage.setItem(`approved_mentor_${uid}`, parsed.teacherApproved ? 'true' : 'false');
          } catch (_) {}
        }
      } catch (err) {
        console.error("Error loaded report details:", err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [verifyParam, navigate]);

  const handleToggleApproval = async (type: 'teacher' | 'kafedra' | 'dekan') => {
    if (!currentUser || verifyParam) return; // Verified view is read only

    setSavingApprovals(true);
    try {
      const nowStr = new Date().toLocaleString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      const currentUserName = currentUser.email?.split('@')[0] || 'Foydalanuvchi';

      let updatedApprovals = { ...approvals };

      if (type === 'teacher') {
        updatedApprovals.teacherApproved = !approvals.teacherApproved;
        updatedApprovals.teacherApprovedDate = updatedApprovals.teacherApproved ? nowStr : '';
        updatedApprovals.teacherApprovedName = updatedApprovals.teacherApproved ? (teacherProfile?.full_name || currentUserName) : '';
      } else if (type === 'kafedra') {
        updatedApprovals.kafedraApproved = !approvals.kafedraApproved;
        updatedApprovals.kafedraApprovedDate = updatedApprovals.kafedraApproved ? nowStr : '';
        updatedApprovals.kafedraApprovedName = updatedApprovals.kafedraApproved ? (currentUser?.email || 'Kafedra Mudiri') : '';
      } else if (type === 'dekan') {
        updatedApprovals.dekanApproved = !approvals.dekanApproved;
        updatedApprovals.dekanApprovedDate = updatedApprovals.dekanApproved ? nowStr : '';
        updatedApprovals.dekanApprovedName = updatedApprovals.dekanApproved ? (currentUser?.email || 'Dekan') : '';
      }

      setApprovals(updatedApprovals);

      // Write locks to localStorage for instant client logic feedback
      localStorage.setItem(`approved_yearly_${targetUserId}`, updatedApprovals.teacherApproved ? 'true' : 'false');
      localStorage.setItem(`approved_academic_${targetUserId}`, updatedApprovals.teacherApproved ? 'true' : 'false');
      localStorage.setItem(`approved_methodical_${targetUserId}`, updatedApprovals.teacherApproved ? 'true' : 'false');
      localStorage.setItem(`approved_scientific_${targetUserId}`, updatedApprovals.teacherApproved ? 'true' : 'false');
      localStorage.setItem(`approved_mentor_${targetUserId}`, updatedApprovals.teacherApproved ? 'true' : 'false');

      // Sync with DB
      const { data: existing } = await supabase
        .from('personal_notes')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('title', 'APPROVALS_DATA')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('personal_notes')
          .update({
            content: JSON.stringify(updatedApprovals),
            created_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('personal_notes')
          .insert({
            user_id: targetUserId,
            title: 'APPROVALS_DATA',
            content: JSON.stringify(updatedApprovals)
          });
      }
    } catch (e) {
      console.error("Error setting approval status:", e);
    } finally {
      setSavingApprovals(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">Mas'uliyat hisoboti yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Verification url for the QR code
  const verificationUrl = `${window.location.origin}/dashboard/pedagog/general-report?verify=${targetUserId}`;

  // Helper values for academic table
  const renderAcademicTable = () => {
    if (!academicData) return <p className="text-gray-400 italic p-4 text-center">O'quv yuklama ma'lumotlari kiritilmagan</p>;
    
    // Kuzgi / Bahorgi rows
    const kuzgi = Array.isArray(academicData.kuzgi) ? academicData.kuzgi : [];
    const bahorgi = Array.isArray(academicData.bahorgi) ? academicData.bahorgi : [];
    const activeRows = [...kuzgi, ...bahorgi].filter(row => Array.isArray(row) && row[1]?.trim() !== '');

    if (!activeRows.length) return <p className="text-gray-400 italic p-4 text-center">Faol yuklama mavjud emas</p>;

    const academicHeaders = [
      "Fan nomi", "Guruh(lar)", "Kurs", "Talabalar", "Akadem guruh",
      "Ma'ruza (r/h)", "Amaliy (r/h)", "BMI va MD (r/h)", "Malakaviy amaliyot (r/h)",
      "Kurs ishi (r/h)", "Oraliq/yakuniy (r/h)", "Maslahatchilik (r/h)", "Ochiq dars (r/h)",
      "Qoralamalar (r/h)", "Sirtqi (r/h)", "Hammasi (r/h)"
    ];

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <th className="p-2 border border-gray-200 text-center font-bold">№</th>
              {academicHeaders.map((h, i) => (
                <th key={i} className="p-2 border border-gray-200 text-center font-bold text-gray-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeRows.map((row, idx) => {
              if (!Array.isArray(row)) return null;
              return (
                <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="p-2 border border-gray-200 text-center font-semibold text-gray-600">{idx + 1}</td>
                  <td className="p-2 border border-gray-200 font-medium text-gray-900 max-w-[200px] truncate">{row[1]}</td>
                  <td className="p-2 border border-gray-200 text-gray-600">{row[2]}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[3]}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[4]}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[5]}</td>
                  {/* Pair hours columns (r/h) */}
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[6] || 0} / {row[7] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[8] || 0} / {row[9] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[10] || 0} / {row[11] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[12] || 0} / {row[13] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[14] || 0} / {row[15] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[16] || 0} / {row[17] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[18] || 0} / {row[19] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[20] || 0} / {row[21] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[22] || 0} / {row[23] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{row[24] || 0} / {row[25] || 0}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono font-bold text-indigo-600">{row[26] || 0} / {row[27] || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderOtherTable = (title: string, grid: any[], icon: React.ReactNode) => {
    if (!grid || grid.length <= 1) {
      return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mb-2">{icon}</div>
          <p className="text-gray-400 italic text-sm">{title} bo'yicha ma'lumot kiritilmagan</p>
        </div>
      );
    }

    const headers = grid[0];
    const rows = grid.slice(1).filter(row => Array.isArray(row) && row[1]?.trim() !== '');

    if (!rows.length) {
      return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mb-2">{icon}</div>
          <p className="text-gray-400 italic text-sm">{title} bo'yicha faol yuklama kiritilmagan</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
              {headers.map((h: any, i: number) => {
                const headerText = typeof h === 'string' ? h : (h?.text || '');
                return (
                  <th key={i} className="p-2 border border-gray-200 text-center font-bold text-gray-700 whitespace-nowrap">
                    {headerText}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex} className="hover:bg-gray-50 border-b border-gray-100">
                {row.map((cell: any, colIndex: number) => {
                  const cellText = typeof cell === 'string' ? cell : (cell?.text || '');
                  return (
                    <td 
                      key={colIndex} 
                      className={`p-2 border border-gray-200 text-gray-800 ${
                        colIndex === 0 ? 'text-center font-semibold bg-gray-50/50' : 
                        colIndex === 1 ? 'font-medium max-w-[300px] truncate' : ''
                      }`}
                    >
                      {cellText}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Determine if all parties signed
  const isDocumentFullySigned = approvals.teacherApproved && approvals.kafedraApproved && approvals.dekanApproved;

  // Determine permissions based on roles
  const canTeacherSign = (profileRole === 'pedagog' || profileRole === 'admin') && !verifyParam;
  const canKafedraSign = (profileRole === 'tahrirlovchi' || profileRole === 'admin' || profileRole === 'tasdiqlovchi' || profileRole === 'rahbariyat') && !verifyParam;
  const canDekanSign = (profileRole === 'tasdiqlovchi' || profileRole === 'admin' || profileRole === 'rahbariyat') && !verifyParam;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* Verification notice if viewing via link */}
      {verifyParam && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-400 p-6 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse print:hidden">
          <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="font-extrabold text-lg">HUJJAT HAQIQIYLIGI TASDIQLANDI!</h4>
            <p className="text-sm opacity-90 mt-1">Ushbu dasturiy hisobot E-Pedagog elektron platformasida tekshirildi va uning haqiqiyligi tasdiqlandi.</p>
          </div>
        </div>
      )}

      {/* Screen Headers */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            {verifyParam && (
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Bosh sahifa
              </button>
            )}
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">UMUMIY HISOBOT VA HUJJAT PASPORTI</h1>
            {isDocumentFullySigned && (
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-bold rounded-lg flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Tasdiqlandi
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">Professor-oʻqituvchining yillik ish rejalari boʻyicha yakuniy, elektron tasdiqlangan pasporti</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm"
          >
            <Printer className="w-4 h-4" /> Chop etish / PDF ko'rinishi
          </button>
        </div>
      </div>

      {/* Printable State Document Container */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden p-8 sm:p-12 print:p-0 print:border-none print:shadow-none font-serif text-black dark:text-white">
        
        {/* Verification stamp showing on print if approved */}
        {isDocumentFullySigned && (
          <div className="hidden print:flex items-center gap-2 border-2 border-emerald-600 text-emerald-600 p-2.5 rounded-lg w-fit mb-4 absolute right-12 top-12 transform rotate-12">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold text-xs tracking-wider">E-PEDAGOG TASDIQLANDI</span>
          </div>
        )}

        {/* State Crest / University Header */}
        <div className="text-center space-y-3 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8 relative">
          <h2 className="text-2xl font-bold tracking-normal uppercase">O'zbekiston Respublikasi Oliy Ta'lim, Fan va Innovatsiyalar Vazirligi</h2>
          <h3 className="text-xl font-bold italic tracking-wide">{teacherProfile?.department || "Fakultet va Kafedra majmuasi"}</h3>
          <h1 className="text-2xl font-extrabold uppercase bg-gray-50 dark:bg-gray-850 py-3 mt-4 border-y border-gray-200 dark:border-gray-800">
            PROFESSOR-O'QITUVCHINING YILLIK FAOLIYAT PASPORTI
          </h1>
          <div className="flex justify-between items-center text-sm font-sans text-gray-500 pt-4 px-4">
            <div>Foydalanuvchi: <span className="font-bold text-gray-800 dark:text-gray-200">{teacherProfile?.full_name || 'Aniqlanmagan'}</span></div>
            <div>Email: <span className="font-bold text-gray-800 dark:text-gray-200">{teacherProfile?.email || "Noma'lum"}</span></div>
            <div>Sana: <span className="font-bold text-gray-800 dark:text-gray-200">{new Date().toLocaleDateString('uz-UZ')}</span></div>
          </div>
        </div>

        {/* QR Code and Validation details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 mb-10 border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl">
          <div className="flex flex-col items-center justify-center p-3 border border-indigo-100 bg-white rounded-xl col-span-1 border-dashed">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=2e3192&data=${encodeURIComponent(verificationUrl)}`}
              alt="Hujjat QR kodi"
              referrerPolicy="no-referrer"
              className="w-28 h-28 mix-blend-multiply"
            />
            <span className="text-[10px] text-indigo-600 font-bold tracking-tight uppercase mt-2 font-sans text-center">E-Pedagog QR Kod</span>
          </div>
          <div className="md:col-span-3 flex flex-col justify-center space-y-2">
            <h4 className="font-bold text-indigo-950 dark:text-indigo-300 text-lg flex items-center gap-1.5 font-sans">
              <QrCode className="w-5 h-5 text-indigo-600" />
              Elektron hujjat haqiqiyligini tekshirish
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-sans leading-relaxed">
              Ushbu hujjat elektron imzo va boshqaruv tizimidan oʻtgan. QR kodni mobil telefon kamerasi yoki QR skaner orqali skanerlang hamda havola orqali hujjatning haqiqiyligini tekshiring.
            </p>
            <div className="pt-2">
              <a 
                href={verificationUrl}
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-indigo-600 hover:text-indigo-800 font-sans font-bold hover:underline break-all"
              >
                {verificationUrl}
              </a>
            </div>
          </div>
        </div>

        {/* 4 Block Tables Display */}
        <div className="space-y-12">
          
          {/* Section 1: Academic Work Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wide border-b border-black pb-2 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 print:hidden text-indigo-600" /> 
              1. O'QUV ISHLARI (SEMЕSTR BO'YICHA)
            </h3>
            {renderAcademicTable()}
          </div>

          {/* Section 2: Methodical Work */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wide border-b border-black pb-2 flex items-center gap-2">
              <Library className="w-5 h-5 print:hidden text-blue-600" /> 
              2. O'QUV-USLUBIY ISHLAR
            </h3>
            {renderOtherTable("O'quv-uslubiy ishlar", methodicalGrid, <Library className="w-5 h-5" />)}
          </div>

          {/* Section 3: Scientific Work */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wide border-b border-black pb-2 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 print:hidden text-purple-600" /> 
              3. ILMIY-TADQIQOT ISHLARI
            </h3>
            {renderOtherTable("Ilmiy-tadqiqot ishlari", scientificGrid, <FlaskConical className="w-5 h-5" />)}
          </div>

          {/* Section 4: Mentor Work */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wide border-b border-black pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 print:hidden text-green-600" /> 
              4. "USTOZ-SHOGIRD" TIZIMI BO'YICHA ISHLAR
            </h3>
            {renderOtherTable("\"Ustoz-shogird\" munosabatlari", mentorGrid, <Users className="w-5 h-5" />)}
          </div>

        </div>

        {/* Approvals Checkboxes and official verification panel */}
        <div className="mt-16 border-t-2 border-dashed border-gray-200 dark:border-gray-800 pt-10 space-y-8 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-normal font-sans text-center md:text-left mb-6">
            Hujjatni tasdiqlash va imzolash statusi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* Signature Block 1: Teacher/Pedagog */}
            <div className={`p-5 rounded-2xl border ${approvals.teacherApproved ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/10' : 'bg-gray-50 border-gray-200 dark:bg-gray-850'} flex flex-col justify-between`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">Professor-o'qituvchi</span>
                  {approvals.teacherApproved ? (
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded">TASDIQLANDI</span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] bg-gray-200 text-gray-650 font-bold rounded">KUTILMOQDA</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Pedagog o'zining barcha kiritgan ma'lumotlari haqiqiyligini va mehnat hisobotini shu tugma orqali tasdiqlaydi.</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {canTeacherSign ? (
                  <button
                    disabled={savingApprovals}
                    onClick={() => handleToggleApproval('teacher')}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                      approvals.teacherApproved 
                        ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {approvals.teacherApproved ? "Tasdiqni qaytarish" : "Tasdiqlash"}
                  </button>
                ) : (
                  <div className="text-xs text-gray-500 italic text-center h-8 flex items-center justify-center">
                    {approvals.teacherApproved ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved: {approvals.teacherApprovedName}
                      </span>
                    ) : (
                      "Tahrirlash huquqi yoki ruxsat yo'q"
                    )}
                  </div>
                )}
                {approvals.teacherApproved && (
                  <div className="text-[10px] text-gray-400 text-center mt-2">
                    Sana: {approvals.teacherApprovedDate}
                  </div>
                )}
              </div>
            </div>

            {/* Signature Block 2: Kafedra Mudiri (Editor) */}
            <div className={`p-5 rounded-2xl border ${approvals.kafedraApproved ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/10' : 'bg-gray-50 border-gray-200 dark:bg-gray-850'} flex flex-col justify-between`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">Kafedra mudiri (Tahrirlovchi)</span>
                  {approvals.kafedraApproved ? (
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded">TASDIQLANDI</span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] bg-gray-200 text-gray-650 font-bold rounded">KUTILMOQDA</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Mas'ul tahrirlovchi (kafedra mudiri) tomonidan ushbu qaydlar o'rganilib, to'g'ri deb baholanganligini tasdiqlash.</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {canKafedraSign ? (
                  <button
                    disabled={savingApprovals}
                    onClick={() => handleToggleApproval('kafedra')}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                      approvals.kafedraApproved 
                        ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {approvals.kafedraApproved ? "Tasdiqni qaytarish" : "Tasdiqlash"}
                  </button>
                ) : (
                  <div className="text-xs text-gray-500 italic text-center h-8 flex items-center justify-center">
                    {approvals.kafedraApproved ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved: {approvals.kafedraApprovedName}
                      </span>
                    ) : (
                      "Faqat tahrirlovchi a'zo tasdiqlaydi"
                    )}
                  </div>
                )}
                {approvals.kafedraApproved && (
                  <div className="text-[10px] text-gray-400 text-center mt-2">
                    Sana: {approvals.kafedraApprovedDate}
                  </div>
                )}
              </div>
            </div>

            {/* Signature Block 3: Fakultet Dekani (Verifier) */}
            <div className={`p-5 rounded-2xl border ${approvals.dekanApproved ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/10' : 'bg-gray-50 border-gray-200 dark:bg-gray-850'} flex flex-col justify-between`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">Fakultet dekani (Tasdiqlovchi)</span>
                  {approvals.dekanApproved ? (
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded">TASDIQLANDI</span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] bg-gray-200 text-gray-650 font-bold rounded">KUTILMOQDA</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Dekanat (tasdiqlovchi organ) o'qituvchining yillik ishlari va reja bajarilishini tekshirib yakuniy tasdiqlovchi imzo qo'yadi.</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {canDekanSign ? (
                  <button
                    disabled={savingApprovals}
                    onClick={() => handleToggleApproval('dekan')}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                      approvals.dekanApproved 
                        ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {approvals.dekanApproved ? "Tasdiqni qaytarish" : "Tasdiqlash"}
                  </button>
                ) : (
                  <div className="text-xs text-gray-500 italic text-center h-8 flex items-center justify-center">
                    {approvals.dekanApproved ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved: {approvals.dekanApprovedName}
                      </span>
                    ) : (
                      "Faqat dekan yoki administrator darsni tasdiqlaydi"
                    )}
                  </div>
                )}
                {approvals.dekanApproved && (
                  <div className="text-[10px] text-gray-400 text-center mt-2">
                    Sana: {approvals.dekanApprovedDate}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Official Signatures display for print */}
          <div className="hidden print:block pt-12 space-y-6 max-w-xl mx-auto border-t border-gray-300">
            <h4 className="font-bold text-center underline italic mb-4">RASMIY IMZOLAR VA TASDIQLASH BELGILARI:</h4>
            
            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-sm text-gray-800 w-64 uppercase">1. Professor-o'qituvchi:</span>
              <div className="flex-1 border-b border-black text-center relative font-sans text-xs">
                {approvals.teacherApproved ? (
                  <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {approvals.teacherApprovedName} (Sana: {approvals.teacherApprovedDate}) - Elektron imzolangan
                  </span>
                ) : (
                  <span className="text-gray-400 italic">________________ (Imzolanmagan)</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-sm text-gray-800 w-64 uppercase">2. Kafedra mudiri:</span>
              <div className="flex-1 border-b border-black text-center relative font-sans text-xs">
                {approvals.kafedraApproved ? (
                  <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {approvals.kafedraApprovedName} (Sana: {approvals.kafedraApprovedDate}) - Tasdiqlangan
                  </span>
                ) : (
                  <span className="text-gray-400 italic">________________ (Ko'rib chiqilmoqda)</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-sm text-gray-800 w-64 uppercase">3. Fakultet dekani:</span>
              <div className="flex-1 border-b border-black text-center relative font-sans text-xs">
                {approvals.dekanApproved ? (
                  <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {approvals.dekanApprovedName} (Sana: {approvals.dekanApprovedDate}) - Yakuniy tasdiqdildi
                  </span>
                ) : (
                  <span className="text-gray-400 italic">________________ (Kutilmoqda)</span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
