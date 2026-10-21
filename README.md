# Loyixa-SGCC — DA-1701 (Absorber A-1) amin bilan gaz tozalash simulyatori

Asos: `source/Zavod_jarayoni_DA-1701_Ananim_v1.html` (foydalanuvchi yuklagan, o'zgartirilmagan, 4,8 MB, bitta fayl, internetsiz ishlaydi).

## Hozirgi holat (o'rganish natijasi)
- Texnologiya: tabiiy gaz → sovitgich EA-1706 A/B/C → separator FA-1702 → absorber DA-1701 (amin + yuvish bo'limi) → tozalangan gaz.
- Rejimlar: **Anonim** (standart, Obyekt-1 / A-1 / S-1 nomlari) va **Haqiqiy** (parol bilan, AES-256-GCM + PBKDF2; haqiqiy teglar shifrlangan holda faylda).
- Bo'limlar: Umumiy ko'rinish, Mnemosxema, 3D, Trendlar, Diagnostika (AI indeks, sabab tashxisi, sath prognozi), Hodisani qayta ko'rish, Hodisalar jurnali (ACK, CSV), Ssenariylarni sinash, Ma'lumotlar va P&ID, Matematik model, Boshqaruv/sozlamalar.
- Model: 3 sath konturi (DA-1701, FA-1702, yuvish) P/PID bilan, 10 klapan, 14 nosozlik ssenariysi, tajriba blokirovkasi (lab latch), signal sifati (BAD/GOOD).
- AI: Isolation Forest (16 belgi) + nosozlik imzosiga softmax tashxis + sath prognozi.
- Brauzerda ochilganda xato yo'q (Chromium sinovi).

## Aniqlangan kamchiliklar
1. Til tanlagich (UZ/RU/EN) amin rejimida yashirin.
2. Kod bitta fayl ichida (28 skript bloki) — manba fayllarga ajratilmagan, test yo'q, .exe yo'q.
3. Fayl ichida quritgich ilovasining qoldiqlari bor (eski sozlamalar, quritgich matematik formulalari, `Quritgich` nomi).
4. Kimyoviy tozalash (H2S/CO2 yutilishi, amin yuklanishi, tozalangan gaz sifati) modellanmagan — hozir faqat gidravlika, sath va harorat.
5. SIS/ESD C&E matritsasi yo'q (kondensat loyihasidagidek).
6. Haqiqiy teglar paroli xavfsizligi: parol faylga yozilmasligi, repo private bo'lishi kerak.
