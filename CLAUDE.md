# Loyixa-SGCC — DA-1701 Absorber AI

Amin bilan kislotali gazni tozalash absorberi DA-1701 (separator FA-1702, sovitgichlar EA-1706 A/B/C) uchun
operator trenajyori va AI erta ogohlantirish simulyatori. Muallif: dissertatsiya ishi (Mirabbos). Interfeys tili — o‘zbek (lotin), RU/EN tarjima.

## Tuzilma
- `index.html`, `css/style.css`, `js/*.js` — manba. Oddiy `<script src>` (bundler yo‘q), tartib `index.html` da.
- `js/amine-*.js` — amin ilovasi (model, AI, mnemosxema, 3D, ma’lumotlar). `js/scene3d.bundle.js` — three.js (`window.AmineThree`).
- 3D: `amine-scene3d.js` (amin bloki, yoritish rejimlari), `amine-complex3d.js` (majmua, bosh kirish), `amine-rooms3d.js` (DCS, ISR-1), `amine-fx3d.js` (avariya effektlari, ob-havo, dala odamlari, texnika).
- `amine-train.js` + `amine-train-dict.js` — «Mashq va avariyalar»: SIS ssenariylari, ekskursiya, demo, test, amaliy mashq, ovoz; o‘z RU/EN lug‘ati (`data-noi18n`).
- `source/` — foydalanuvchi yuklagan asl fayl (o‘zgartirilmaydi, faqat solishtirish uchun).
- `tools/build-single.js` → `dist/DA-1701-Absorber-AI.html` (bitta fayl, internetsiz).
- `electron/` + `package.json` build → Windows NSIS .exe (`.github/workflows/desktop.yml`, workflow_dispatch `tag`).

## Buyruqlar
- `npm test` — Node unit testlar (`tests/*.test.js`, model `tests/load.js` orqali vm’da yuklanadi).
- `npm run e2e` — Playwright smoke (`CHROMIUM_PATH=/opt/pw-browsers/chromium`).
- `npm run build` — bitta HTML.

## Qoidalar
- Haqiqiy teglar faqat shifrlangan holda (AES-256-GCM, PBKDF2). Parol yoki ochiq teg repoga yozilmaydi.
- Standart rejim — Anonim (Obyekt-1 / A-1 / S-1).
- Model parametrlari taxminiy: UI va hisobotda “o‘quv modeli, ishlab chiqarish tizimiga ulanmagan” deb ko‘rsatiladi.
- Har o‘zgarishdan keyin `npm test` va `npm run e2e` o‘tishi shart.
