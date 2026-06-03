# E-PEDAGOG LOYIHASI BO'YICHA TO'LIQ QO'LLANMA VA HIMOYA UCHUN MATN

Tuzuvchi: Dastur muallifi
Sana: Joriy yil

---

## 1. LOYIHA MAQSADI VA DOLZARBLIGI
**E-Pedagog** tizimi — oliy ta'lim muassasalarida faoliyat yurituvchi professor-o'qituvchilarning yil davomida olib boradigan barcha ishlarini (o'quv, ilmiy, uslubiy, ustoz-shogird) yagona platformada yig'ish, avtomatlashtirish, hisoblash va tasdiqlash uchun mo'ljallangan kompleks raqamli yechimdir. Ushbu raqamlashtirish qog'oz sarfini qisqartiradi, byurokratiyani kamaytiradi va ta'lim sifatini tahlil qilish imkonini beradi.

## 2. QO'LLANILGAN TEXNOLOGIYALAR VA DASTURLASH TILLARI STAGI (Tech Stack)

Loyiha eng so'nggi zamonaviy Web-texnologiyalar yordamida yozilgan ("Single Page Application" - SPA arxitekturasida):

*   **Asosiy tillar:** TypeScript (qat'iy tiplangan JavaScript kengaytmasi), HTML5, CSS3.
*   **Frontend Framework:** React 18+ (Foydalanuvchi interfeysini qurish uchun eng kuchli kutubxona). Vite orqali yig'ilgan (Build qilingan).
*   **Stilizatsiya / Dizayn:** Tailwind CSS (Responsive - ya'ni har qanday moslamaga moslashuvchan, tezkor utility-class dizayn).
*   **Backend va Ma'lumotlar Bazasi:** Supabase (PostgreSQL relyatsion ma'lumotlar bazasi, to'liq avtorizatsiya va fayllar saqlash uchun Cloud Storage funksiyasi bilan).
*   **Eksport Modullari:** `jspdf` (PDF chop etish) va `xlsx` (Excel'ga ko'chirish).
*   **UI Mikro-modullar:** Ikonkalar uchun `lucide-react`, grafik animatsiyalar uchun `framer-motion`, xabarnomalar uchun `react-hot-toast`.

## 3. ASOSIY MODULLAR VA DASTUR TUZILMASI (Architecture)

Dastur asosan React komponentlar va sahifalar (pages) dan iborat:
*   `src/pages` - Barcha asosiy sahifalar tizilligi. Misol uchun: `PedagogDashboard.tsx` (O'qituvchi bosh paneli), `ScientificWork.tsx` (Ilmiy ishlar uchun elektron jadval).
*   `src/components` - Ko'p marotaba ishlatiladigan interfeys elementlari (Sidebar, Navbar, Inputlar).
*   `src/lib` - Ma'lumotlar bazasiga ulanish uchun zarur bo'lgan konfiguratsiya `supabase.ts`.

## 4. DASTUR IMKONIYATLARI VA FUNKSIYALARI

Dastur huquqlarga (rollarga) bo'lingan holda maxsus interfeys taqdim etadi:
1.  **Rolli Kirish:** Avtorizatsiya moduli professor-o'qituvchi, mudir (tasdiqlovchi) yoki o'quv bo'limi (tahrirlovchi) kabi rollarni farqlaydi.
2.  **O'quv yuki hisobi:** Kuzgi va bahorgi semestrlariga bo'lingan batafsil akademik o'quv soatlarini kiritish va jamlash funksiyasi (`AcademicWork`), har bir soat avtomat hisob-kitob bo'ladi.
3.  **Ilmiy, Metodik va "Ustoz-shogird" jadvallari:** O'qituvchilar o'zlarining ilmiy maqolalari, nashrlari hamda olib borayotgan to'garaklarini kiritishi, unga tasdiq sifatida fayllar (diplom, sertifikat pdf/rasmlari) yuklashi mumkin.
4.  **Tarix va Nazorat:** "O'zgarishlar tarixi" (History) orqali kiritilgan ball/soatlarni kim qachon o'zgartirganini monitoring qilish funksiyasi qo'shilgan (shaffoflik).
5.  **Shaxsiy qaydlar va Chat:** Foydalanuvchilar o'z ishlarini rejalashtirishi uchun TODO qaydlar daftarchasi hamda ma'muriyat bilan tezkor Live Chat ilovaga o'rnatilgan.

## 5. FOYDALANISH QO'LLANMASI (User Guide)

Bu tizimdan foydalanish nihoyatda oson:
*   **1-qadam:** O'qituvchi o'z login va paroli bilan tizimga kiradi.
*   **2-qadam:** Chap tomondagi menyudan o'ziga kerakli faoliyat turini tanlaydi (Masalan: Ilmiy-tadqiqot ishlari).
*   **3-qadam:** Avtomatlashtirilgan elektron jadvaldan foydalanib o'z yutug'ini (maqolasi, kitobi reytingini) yozadi va "Qog'oz qisqichi -📎" tasvirini bosib yuklash oynasidan PDF hujjatni bazaga saqlaydi.
*   **4-qadam:** Sahifaning yuqori-o'ng qismidagi "Saqlash" tugmasini bosadi. Barcha ma'lumot Cloud tizimda arxivlanadi.
*   **5-qadam:** Ushbu yuklangan hujjarlar mudir/tasdiqlovchi ochiq sahifasida ko'rinadi va tasdiqlanib imzo qo'yiladi.

Yillik hisobotlar yig'ilganda "Chop etish" yoki "Yillik o'quv yuki" yorlig'i orqali birdaniga barcha yillik natija rasmiy qog'oz ko'rinishida print qilinadi.

---
Ushbu hujjat sizga kafedra mudirlari yoki diplom komissiyasiga loyihani himoya qilganda dasturiy ko'nikmalarni namoyish etishda asqotadi. Dastur to'liq web asosida, API arxitekturasi bilan istalgan zamonaviy serverga joylanib ishlay oladi.
