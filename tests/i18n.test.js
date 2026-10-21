const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'i18n-dict.js'), 'utf8'), ctx);
const D = ctx.window.I18N_DICT;

test('lug‘at: har bir yozuvda UZ, RU, EN bor va takror kalit yo‘q', () => {
  assert.ok(D.length > 600);
  const seen = new Set();
  for (const r of D) { assert.strictEqual(r.length, 3); assert.ok(r[0] && r[1] && r[2], r[0]); assert.ok(!seen.has(r[0]), 'takror: ' + r[0]); seen.add(r[0]); }
});

test('lug‘at: teg (⟨T⟩) va son (⟨#⟩) o‘rinlari tarjimalarda saqlangan', () => {
  const n = (s, p) => s.split(p).length - 1;
  for (const [uz, ru, en] of D) for (const t of [ru, en]) {
    assert.strictEqual(n(t, '⟨T⟩'), n(uz, '⟨T⟩'), uz); assert.strictEqual(n(t, '⟨#⟩'), n(uz, '⟨#⟩'), uz);
  }
});

test('asosiy bo‘lim nomlari tarjima qilingan', () => {
  const m = new Map(D.map(r => [r[0], r]));
  for (const k of ['Umumiy ko‘rinish', 'Mnemosxema', 'Trendlar', 'Diagnostika', 'SIS / ESD blokirovka', 'Hodisalar jurnali', 'Matematik model', 'Boshqaruv va sozlamalar'])
    assert.ok(m.has(k), k);
});
