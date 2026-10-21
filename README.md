# DA-1701 Absorber AI (Loyixa-SGCC)

Amin bilan gazni tozalash absorberi DA-1701 (separator FA-1702, sovitgichlar EA-1706 A/B/C) uchun operator trenajyori va AI erta ogohlantirish tizimi.

## Imkoniyatlar
- **Kimyoviy tozalash modeli** — CO₂/H₂S yutilishi (NTU), amin yuklanishi, issiqlik balansi, AI17001 analizatori; DCS ekraniga kalibrlangan.
- **SIS / ESD** — 6 ta SIF, 2oo3 / 1oo2 ovoz berish, fail-close XV, latch, RESET, bypass, first-out, PFDavg/SIL.
- **AI** — Isolation Forest + kNN + sabab tashxisi, raqamli egizak qoldiqlari.
- **Vizualizatsiya** — DCS uslubidagi mnemosxema (tun/kun), trendlar, jurnal, qayta ko‘rish.
- **3D** — Sho‘rtan GKM miqyosidagi sxematik majmua va batafsil DA-1701 bloki.
- **Til** — UZ / RU / EN; **Anonim / Haqiqiy** (parol bilan shifrlangan teglar).

## Ishga tushirish
- Brauzerda: `index.html` yoki `npm run build` → `dist/DA-1701-Absorber-AI.html` (internetsiz).
- Windows: Releases → `DA-1701-Absorber-AI-Setup-<versiya>.exe`.
- Testlar: `npm test`, `npm run e2e`.

Hisobot: [`docs/DA-1701_Hisobot.pdf`](docs/DA-1701_Hisobot.pdf). Asl yuklangan fayl: `source/`.
