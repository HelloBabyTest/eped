# E-PEDAGOG Loyihasining Papka va Fayllar Arxitekturasi

Ushbu hujjat E-Pedagog tizimining tuzilishi (strukturasi), har bir papka va muhim faylning aniq vazifasini va nega aynan shu tarzda joylashganini batafsil ko'rsatib o'tadi.

## 1. Asosiy Ildiz (Root) Fayllari
Bu qism dasturning sozlamalari va infratuzilmasi turadigan joydir.
- **`package.json`**: Loyihaga ulaingan barcha tashqi kutubxonalar (React, Tailwind, Supabase va boshqalar) ro'yxati va dasturni serverda ishga tushirish (build) skriptlari joylashgan fayl.
- **`vite.config.ts`**: Vite tezkor yig'uvchi (bundler) vositasining sozlamalari fayli. Dasturni brauzer tushunadigan holatga tezkor o'tkazib beradi.
- **`tailwind.config.js`**: Tailwind CSS (dizayn tizimi) uchun barcha rang, shrift va ko'rinish sozlamalari joylashgan fayl.

## 2. `/src` - Asosiy Dastur Papkasi (Source)
Bu papkada dastur mantiqi va ko'rinishining 100% qismi joylashgan. Loyiha kodini o'zgartirish asosan shu papkada bajariladi.
- **`main.tsx`**: Dastur boshlanadigan eng birinchi kirish nuqtasi. U React ilovasini oddiy HTML (index.html) ga ulab berish vazifasini bajaradi.
- **`App.tsx`**: Barcha marshrutlar (Routing - URL manzillar) ro'yxatga olingan fayl. "Yo'l ko'rsatuvchi xarita" vazifasini bajarib, linklarni kerakli sahifaga buradi.
- **`index.css`**: Global CSS uslublari yoziladigan va eng muhimi Tailwind uslublari yuklanadigan yagona CSS fayl.

## 3. `/src/pages` - Sahifalar Papkasi
Bu maxsus papkada saytning har bir mustaqil sahifasi (oynalari) alohida fayl ko'rinishida yozib chiqilgan:
- **`LandingPage.tsx`**: Dasturga Login qilishdan oldin ochiladigan chiroyli reklama va tanishtiruv sahifasi.
- **`LoginPage.tsx` & `RegisterPage.tsx`**: Tizimga xavfsiz elektron pochta orqali kirish (avtorizatsiya) va yangi akkaunt yaratish oynalari.
- **`PedagogDashboard.tsx`**: Oddiy o'qituvchi kirganda ochiladigan asosiy ish stoli (shaxsiy kabinet / dashboard). Reytinglar, ko'rsatkichlarni bir ko'rishda tahlil qiladi.
- **`AdminDashboard.tsx`, `TasdiqlovchiDashboard.tsx`, `TahrirlovchiDashboard.tsx`**: Mudirlar, bo'lim xodimlari yoki adminlar uchun ma'lumotlarni tahlil qilish, nazorat qilish va tasdiqlash imkonini beruvchi turli qiyofadagi panellar.
- **`AcademicWork.tsx`**: (O'quv ishlari) Semestrlar (Kuzgi/Bahorgi) kesimida auditoriya yuklamalari va soatlarini hisob-kitob qilish uchun ulkan vizual elektron jadval. 
- **`MethodicalWork.tsx`**: (O'quv-uslubiy ishlar) Turli o'quv qo'llanmalar, uslubiyotlar dalillarini kiritish sahifasi.
- **`ScientificWork.tsx`**: (Ilmiy ishlar) Maqolalar, to'plamlar yoki patentlarning nomlari va ularning PDF dalillari yuklanadigan oyna.
- **`MentorWork.tsx`**: ("Ustoz-shogird") Boshqa talabalarga qilingan doimiy rahbarlik yoki amaliyot ishlarini hisobga olish oynasi.
- **`YearlyWork.tsx`**: (Yillik, umumlashgan hisobot) To'rtala o'quv ishlari bo'yicha hisobotlarni jamlab beruvchi va **PDF ga eksport** qilib beruvchi rasmiy sahifa.
- **`GlobalHistory.tsx`**: Tizimda qilingan har bir harakatni (kim, qachon, qaysi soatni o'zgartirdi) kuzatib boruvchi nazoratchi audot (Log) oynasi.
- **`UserChat.tsx`**: Admin va pedagog o'rtasida bir-biri bilan real vaqtda yozishish uchun mo'ljallangan maxsus Chat moduli o'rnatilgan sahifa.
- **`PersonalNotes.tsx`**: O'qituvchi faqat o'zi uchun shaxsiy ish rasi va eslatmalarni (TODO list) boshqaradigan, kartochkalarga bo'lingan doska.
- **`Norms.tsx`**: Me'yoriy qoidalar, Nizom talablari, va ballar standartlari ro'yxatini chiqarib beradigan yordamchi oyna.

## 4. `/src/components` - Qayta Ishlatiluvchi Qismlar (Components)
Har bir sahifaga bitta kodni qayta-qayta yozmaslik uchun umumiy vizual bo'laklar ushbu papkaga olinadi.
- **`DashboardLayout.tsx`**: Tizimga kirgandan so'ng ekranni ikkiga bo'luvchi qolip (Layout). Chap taraf - **Menyu (Sidebar)** bloki bo'lsa, o'ng tarafda doimiy yuqori navbar (profil bilan) joylashadi. Barcha `/pages` sahifalari xuddi mana shu qolipning ichiga ochiladi.

## 5. `/src/lib` - Yordamchi va Xizmatlar Papkasi (Libraries)
- **`supabase.ts`**: Backend serverga (Supabase orqali bulutli PostgreSQL ma'lumotlar omboriga) ulanish uchun zarur Maxfiy Kalitlar (API Keys, URL) saqlanadigan maxsus xavfsizlik konfiguratsiyasi va integratsiya fayli. Database'ga har qanday ma'lumot yozish ana shu fayl orqali o'tadi.

## 6. `/src/contexts` - Global Holat Papkasi (State Context)
- **`LanguageContext.tsx`**: (Agar ishlatilsa) Tarjimalarni kontekst bo'ylab tarqatuvchi, sayt tilini oniy lahzada Uz/Ru/En holatlariga barcha sahifalarda bir paytda o'zgartirib bera oladigan mantiqiy global React boshqaruv bloki.

---

### Arxitekturaning Yutuqlari (Muhim Fokus):
1. **Modullilik (Izolyatsiya):** Ushbu papkalar arxitekturasi dasturni kelajakda kengaytirishni osonlashtiradi. `AcademicWork` sahifasidagi biror yangilanish `ScientificWork` moduli ishiga ta'sir yoki xalaqit qilmaydi (Bug'lar oldi olinadi).
2. **Kengayuvchanlik (Scalability):** Kerak bo'lsa, kelajakda yuzlab alohida yangi funkysialar ham aynan mana shu papkalar ichiga mukammal singib ketadi (tartibsizlik yaratmaydi).
3. **Qayta ishlatilish (Reusability):** `components` papkasining ahamiyati sababli dizayn prinsiplari hamma joyda bir xilda ishlaydi va loyiha yengil bo'ladi.
