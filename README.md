# Pedagog Kadrlarning Shaxsiy Ish Rejasini Avtomatlashtirilgan Axborot Tizimi

**Loyihaning rasmiy veb-sayti:** [e-pedagoguz.netlify.app](https://e-pedagoguz.netlify.app/)

Ushbu qiziqarli va katta loyiha oliy ta'lim muassasalarida faoliyat yurituvchi pedagog xodimlarning shaxsiy ish rejalarini shakllantirish, to'ldirish, qabul qilish hamda hisobotlarini tizimlashtirilgan elektron tarzda yuritish uchun ustida uzoq vaqt mehnat qilib yaratgan dasturiy ishimdir.  

Bungacha bo'lgan yillar davomida ortiqcha qog'ozbozlik va noqulayliklar o'qituvchilarimiz uchun ancha vaqt yo'qotishiga sabab bo'layotgan edi. Shuni hisobga olib, ushbu jarayonlarni kompyuter va internet orqali bajarib, monitoring sifatini oshirish va raqamli ta'lim tizimiga yordam berish asosiy maqsadim bo'ldi.

---

## 👨‍💻 Muallif haqida
Siz foydalanayotgan va ko'rib turgan loyiha (qamroviga ko'ra algoritmlar, interfeyslar, himoya qatlamlari) barchasi bitta muallif – **Otabek Choriyev** tomonidan yozib chiqilgan. Mualliflik huquqlari saqlanadi. Loyihamning asosiy rasmiy mavzusi ham: *"Pedagog kadrlarning shaxsiy ish rejasini avtomatlashtirilgan axborot tizimi dasturiy ta’minotini ishlab chiqish"* deb nomlanadi.

---

## 📊 Rol va imkoniyatlar (Tizim bo'yicha qo'llanma)

Men dasturda har bir ishtirokchi uchun (ulardan kelib chiquvchi huquqlarga binoan) quyidagi rollarni ajratganman:

| Foydalanuvchi roli | Dasturdagi huquqlari va vazifalari |
| :--- | :--- |
| **👨‍🏫 Pedagog xodim** | Ish rejaga kiritilishi kerak bo'lgan o'quv, ilmiy, uslubiy hamda ma'rifiy yuklamalarni qo'shadi, elektron formatda tasdiqqa yuboradi. Jarayonni kuzatib boradi. |
| **📝 Tahrirlovchi** | Taqdim qilingan amaliy va nazariy hisobotlar ro'yxatini tekshiradi, agar kamchiliklar bo'lsa izoh qoldirib, xodimga qaytarib beradi. |
| **✅ Tasdiqlovchi** | (Kafedra mudiri yoki ma'sul kishilar) Tekshiruvdan o'tgan ro'yxatlarni to'liq tasdiqlash yoki butunlay inkor qilish vakolatiga ega. |
| **🏢 Rahbariyat** | Oliygohdagi umumiy statistikalar, kafedralar qaysi o'rinda ekani hamda barcha iqtidorli o'qituvchilar ish unumdorligini interaktiv (Dashboard) yordamida kuzatib turadi. |
| **⚙️ Admin** | Sozlamalar: kafedralar qo'shish, ro'yxatdan o'tgan yangi foydalanuvchilar arizalarini o'rganib ularni tizimga (app) hal qilib kiritadi yoxud rad etadi. |

---

## 🚀 Qanday qilib o'zingizda muvaffaqiyatli ishga tushirasiz?

Ushbu dasturiy loyihani local muhitingizda ishlatib ko'rishingiz uchun shaxsan tayyorlagan yo'riqnomam bilan tanishing.

### ✅ Nimalar kerak bo'ladi?
*   Kompyuteringizda **Node.js** o'rnatilgan bo'lishi lozim (Iloji bo'lsa v18 yoki teparoq).
*   Va albatta **Git** dasturi.

### 1️⃣ Loyihani nusxalab olish
Terminalga kiring va quyidagi buyruq orqali loyihamni yuklab oling, so'ng jildini oching:

```bash
git clone https://github.com/Sizning-Username/loyihangiz-nomi.git
cd loyihangiz-nomi
```

### 2️⃣ Paketlarni o'rnatish
Mening kodimda ishlatilgan kutubxona va paket-tizimlarni bir urinishda o'rnatish uchun quyidagilarni tering:

```bash
npm install
```

### 3️⃣ Baza sozlamalari (Environment)
Kodlarim xavfsizlik maqsadida ma'lumotlar bazasi hisob ma'lumotlarisiz yuklangan. Bosh sahifada (root) `.env` faylini yaratasiz va quyidagilarni o'z kalitingiz bilan to'ldirasiz (Supabase ishlatsangiz):

```plaintext
VITE_SUPABASE_URL=SIZNING_URL_KODINGIZ
VITE_SUPABASE_ANON_KEY=SIZNING_ANONIM_KALITINGIZ
```

### 4️⃣ Kodingizni yurgizing!
Mana amallarni ham bajarib bo'ldik! Endi uni kompyuteringiz serverida ko'taramiz:

```bash
npm run dev
```
Dastur deyarli 1 soniyada tayyor bo'ladi. Terminal sizga qaysi local portni yurgizganini ko'rsatadi (odatda `http://localhost:3000`). Buni brauzerga yozsangiz ishlaydi. 

Hammangizga foydali bo'ladi deb yozib chiqdim! Kamchiliklar bo'lsa hisobga olmaysiz degan umiddaman. 😉
Otabek Choriyev. Qadr-qimmat bilan!
