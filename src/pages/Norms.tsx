import React from 'react';
import { motion } from 'motion/react';
import { Printer } from 'lucide-react';

const normsData = [
  {
    "id": 1,
    "lavozimi": "Kafedra mudiri",
    "jami": "500-550",
    "auditoriya": "250",
    "xorijiy": "180",
    "uslubiy": "Darslik, o'quv qo'llanma, (yakkamualliflik yoki hammualliflikda kamida 1 ta), uslubiy qo'llanma 1 ta yaratish va nashr etish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    "ilmiy": "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Tashkilotlarda ma'ruzalar qilish, ommaviy axborot vositalarida (kamida bir marotaba) chiqishlar qilish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    "id": 2,
    "lavozimi": "Professor (akademik)",
    "jami": "500-550",
    "auditoriya": "150",
    "xorijiy": "120",
    "uslubiy": "Darslik, o'quv qo'llanma, (yakkamualliflik yoki hammualliflikda kamida 2 ta), uslubiy qo'llanma 1 ta yaratish va nashr etish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    "ilmiy": "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Tashkilotlarda ma'ruzalar qilish, ommaviy axborot vositalarida (kamida bir marotaba) chiqishlar qilish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    "id": 3,
    "lavozimi": "Professor (fan doktori)",
    "jami": "500-550",
    "auditoriya": "250",
    "xorijiy": "180",
    "uslubiy": "Darslik, o'quv qo'llanma, (yakkamualliflik yoki hammualliflikda kamida 2 ta), uslubiy qo'llanma 1 ta yaratish va nashr etish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    "ilmiy": "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Tashkilotlarda ma'ruzalar qilish, ommaviy axborot vositalarida (kamida bir marotaba) chiqishlar qilish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    "id": 4,
    "lavozimi": "Dotsent (fan doktori)",
    "jami": "500-550",
    "auditoriya": "300",
    "xorijiy": "200",
    "uslubiy": "Darslik, o'quv qo'llanma, uslubiy qo'llanma (yakkamualliflik yoki hammualliflikda kamida 2 ta fandan) yaratish va nashr etish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    "ilmiy": "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Talabaning shaxsiy va akademik yutuqlarini rivojlantirish maqsadida (kamida ikki marotaba) uchrashuvlar o'tkazish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    "id": 5,
    "lavozimi": "Professor (fan nomzodi (PhD))",
    "jami": "500-550",
    "auditoriya": "300",
    "xorijiy": "200",
    "uslubiy": "O'quv qo'llanma, uslubiy qo'llanma (yakkamualliflik yoki hammualliflikda kamida 2 ta fandan) yaratish va nashr etish, 1ta fanning o'quv-kontentini ishlab chiqish, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    "ilmiy": "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Talabaning shaxsiy va akademik yutuqlarini rivojlantirish maqsadida (kamida ikki marotaba) uchrashuvlar o'tkazish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    "id": 6,
    "lavozimi": "Professor (ilmiy darajasiz)",
    "jami": "500-550",
    "auditoriya": "350",
    "xorijiy": "250",
    "uslubiy": "O'quv qo'llanma, uslubiy qo'llanma (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan yaratish va nashr etish, fanning o'quv kontentini tayyorlash, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    "ilmiy": "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Talabaning shaxsiy va akademik yutuqlarini rivojlantirish maqsadida (kamida ikki marotaba) uchrashuvlar o'tkazish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    "id": 7,
    "lavozimi": "Dotsent (fan nomzodi (PhD))",
    "jami": "500-550",
    "auditoriya": "350",
    "xorijiy": "250",
    "uslubiy": "O'quv qo'llanma, uslubiy qo'llanma (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan yaratish va nashr etish, fanning o'quv kontentini tayyorlash, 1 ta fan o'quv dasturi (sillabus) ishlab chiqish;",
    "ilmiy": "Scopus, Web of science ilmiy-texnik ma'lumotlar bazasiga kiritilgan jurnallarda kamida 1 ta (hammualliflikda bo'lsa 2 ta) ilmiy maqola chop etish; Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola chop etish; kamida bir ilmiy loyihada yoki ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Talabaning shaxsiy va akademik yutuqlarini rivojlantirish maqsadida (kamida ikki marotaba) uchrashuvlar o'tkazish; Talabalarni O'zbekiston Respublikasi Prezidentining davlat stipendiyalariga, davlat stipendiyalariga, xalqaro va respublika olimpiadalari, tanlovlari, musobaqalariga tayyorlash (kamida 1 talaba ishtirokini ta'minlash);"
  },
  {
    "id": 8,
    "lavozimi": "Dotsent (ilmiy darajasiz)",
    "jami": "500-550",
    "auditoriya": "400",
    "xorijiy": "270",
    "uslubiy": "Tarqatma o'quv materiallari, elektron o'quv dasturlar va video mashg'ulotlar (yakkamualliflikda kamida 1 ta fan doirasida), fanning o'quv kontentini (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan) tayyorlash;",
    "ilmiy": "Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola, xalqaro va Respublika ilmiy anjumanlari to'plamida 2 ta ilmiy tezis chop etish, ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Talabalarning ota-onalari bilan ishlash; Bitiruvchilarning ishini, shu jumladan, vaqtni monitoring qilish (kamida 5 nafar talaba); Sport, madaniy-ma'rifiy va ijodiy tadbirlarni (kamida ikki marotaba) tashkil etish va o'tkazish."
  },
  {
    "id": 9,
    "lavozimi": "Katta o'qituvchi (fan nomzodi (PhD))",
    "jami": "500-550",
    "auditoriya": "400",
    "xorijiy": "270",
    "uslubiy": "Tarqatma o'quv materiallari, elektron o'quv dasturlar va video mashg'ulotlar (yakkamualliflikda kamida 1 ta fan doirasida), fanning o'quv kontentini (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan) tayyorlash;",
    "ilmiy": "Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola, xalqaro va Respublika ilmiy anjumanlari to'plamida 2 ta ilmiy tezis chop etish, ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish yoki xirsh indeksiga ega bo'lishi.",
    "ustoz_shogird": "Talabalarning ota-onalari bilan ishlash; Bitiruvchilarning ishini, shu jumladan, vaqtni monitoring qilish (kamida 5 nafar talaba); Sport, madaniy-ma'rifiy va ijodiy tadbirlarni (kamida ikki marotaba) tashkil etish va o'tkazish."
  },
  {
    "id": 10,
    "lavozimi": "Katta o'qituvchi (ilmiy darajasiz)",
    "jami": "500-550",
    "auditoriya": "420",
    "xorijiy": "300",
    "uslubiy": "Tarqatma o'quv materiallari, elektron o'quv dasturlar va video mashg'ulotlar (yakkamualliflikda kamida 1 ta fan doirasida), fanning o'quv kontentini (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan) tayyorlash;",
    "ilmiy": "Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 2 ta ilmiy maqola, xalqaro va Respublika ilmiy anjumanlari to'plamida 2 ta ilmiy tezis chop etish, ilmiy faoliyat natijalarini tijoratlashtirishda ishtirok etish.",
    "ustoz_shogird": "Talabalarning ota-onalari bilan ishlash; Bitiruvchilarning ishini, shu jumladan, vaqtni monitoring qilish (kamida 5 nafar talaba); Sport, madaniy-ma'rifiy va ijodiy tadbirlarni (kamida ikki marotaba) tashkil etish va o'tkazish."
  },
  {
    "id": 11,
    "lavozimi": "Assistent",
    "jami": "500-550",
    "auditoriya": "450",
    "xorijiy": "320",
    "uslubiy": "Fanning o'quv kontentini ishlab chiqish va fanning elektron modul papkasini yaratish, fanlar bo'yicha nazorat savollari (test, masalalar va boshqa), oraliq va yakuniy baholashlar uchun topshiriqlarni (yakkamualliflik yoki hammualliflikda kamida 1 ta fandan) yaratish va nashr etish.",
    "ilmiy": "Oliy attestasiya komissiyasi ro'yxatidagi jurnallarda kamida 1 ta ilmiy maqola, xalqaro va Respublika ilmiy anjumanlari to'plamida 2 ta ilmiy tezis chop etish;",
    "ustoz_shogird": "Talabalarning ota-onalari bilan ishlash; Bitiruvchilarning ishini, shu jumladan, vaqtni monitoring qilish (kamida 5 nafar talaba); Sport, madaniy-ma'rifiy va ijodiy tadbirlarni (kamida ikki marotaba) tashkil etish va o'tkazish."
  }
];

export default function Norms() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-end mb-4 print-hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Chop qilish
          </button>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-center text-gray-900 dark:text-white mb-10 leading-relaxed uppercase">
          Toshkent davlat iqtisodiyot universiteti professor-o‘qituvchilar faoliyatining auditoriya o‘quv yuklamasi hamda o‘quv-uslubiy, ilmiy-tadqiqot va «ustoz-shogird» tusdagi ishlari bo‘yicha soatlar hajmi hisoblanmaydigan ish turlari ME’YORLARI
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th rowSpan={2} className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  №
                </th>
                <th rowSpan={2} className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300 min-w-[200px]">
                  Professor-o'qituvchi lavozimi, unvoni
                </th>
                <th colSpan={3} className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  O'quv ishlari (minimal)
                </th>
                <th colSpan={3} className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  Soatlar hajmi hisoblanmaydigan ish turlari me'yorlari, sonda
                </th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  Jami
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  Auditoriya soatlari
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  Shu jumladan, xorijiy o'qituvchiga
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  o'quv-uslubiy
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  ilmiy-tadqiqot
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  «ustoz-shogird»
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {normsData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-4 text-center text-gray-900 dark:text-white font-medium">
                    {item.id}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-4 text-gray-900 dark:text-white font-bold">
                    {item.lavozimi}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-4 text-center text-gray-600 dark:text-gray-300">
                    {item.jami}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-4 text-center text-gray-600 dark:text-gray-300">
                    {item.auditoriya}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-4 text-center text-gray-600 dark:text-gray-300">
                    {item.xorijiy}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-4 text-gray-600 dark:text-gray-300 text-xs leading-relaxed min-w-[250px]">
                    {item.uslubiy}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-4 text-gray-600 dark:text-gray-300 text-xs leading-relaxed min-w-[300px]">
                    {item.ilmiy}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-4 text-gray-600 dark:text-gray-300 text-xs leading-relaxed min-w-[250px]">
                    {item.ustoz_shogird}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Universitet Kengashining 2025 yil 26 avgustdagi 1/4-sonli qaroriga muvofiq keltirildi.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
