// Butun ilovani BITTA HTML faylga yig'adi (CSS va barcha JS ichiga joylanadi; internetsiz ishlaydi).
//   node tools/build-single.js → dist/DA-1701-Absorber-AI.html
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const safeJs = s => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
let html = read('index.html');
html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, f) => '<style>\n' + read(f) + '</style>');
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, f) => '<script>\n' + safeJs(read(f)) + '</script>');
html = html.replace("script-src 'self'", "script-src 'unsafe-inline'");
if (/<script src=|<link rel="stylesheet"/.test(html)) throw new Error('tashqi fayl havolasi qoldi');
const dir = path.join(root, 'dist'); fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, 'DA-1701-Absorber-AI.html');
fs.writeFileSync(file, html);
console.log(file, (Buffer.byteLength(html) / 1e6).toFixed(2) + ' MB');
