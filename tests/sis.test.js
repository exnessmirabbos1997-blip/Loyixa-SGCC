const test = require('node:test'), assert = require('node:assert');
const { load, MODEL } = require('./load');
const W = load(MODEL);
const run = (fault, sec, pre) => { const m = new W.AmineModel(); if (pre) pre(m); m.setFault(fault); m.advance(sec); return m; };

test('normal ishda SIS trip yo‘q, barcha XV ochiq', () => {
  const m = run('normal', 900);
  assert.strictEqual(m.sis.tripped().length, 0);
  assert.ok(Object.values(m.sis.xv).every(v => v === 100));
});

test('SIF-01: LC17003 ochiq qotsa XV17003 yopiladi va blow-by bo‘lmaydi', () => {
  const m = run('stuckOpen', 900);
  assert.ok(m.sis.tripped().includes('SIF-01')); assert.strictEqual(m.sis.firstOut, 'SIF-01');
  assert.strictEqual(m.sis.xv.XV17003, 0); assert.strictEqual(m.sis.blowby, 0);
});

test('SIF-01 bypass qilinsa — blow-by xavfi qayd etiladi', () => {
  const m = run('stuckOpen', 900, m => m.sisBypass('SIF-01', true));
  assert.ok(m.sis.blowby > 0); assert.ok(m.events.some(e => e.id === 'BLOWBY'));
});

test('SIF-02: LC17003 yopiq qotsa amin kirishi to‘xtaydi, amin gaz bilan chiqib ketmaydi', () => {
  const m = run('stuckClosed', 900);
  assert.ok(m.sis.tripped().includes('SIF-02')); assert.strictEqual(m.sis.xv.XV17002, 0); assert.strictEqual(m.sis.carry, 0);
});

test('SIF-05: chiqish yopilsa bosim oshadi → ESD-1, keyin bosim tushadi', () => {
  const m = run('outBlocked', 600);
  assert.ok(m.sis.tripped().includes('SIF-05')); assert.ok(m.sis.esdActive());
  assert.ok(m.s.press < 4200, 'P=' + m.s.press); assert.ok(m.s.g < .01);
});

test('SIS DCS dan mustaqil: LC17003 signali yo‘q bo‘lsa ham SIF-01 ishlaydi', () => {
  const m = new W.AmineModel(); m.setFault('sensor'); m.setAuto('rich', false); m.setCommand('rich', 100); m.advance(900);
  assert.ok(m.sis.tripped().includes('SIF-01'));
});

test('2oo3: bitta kanal BAD — degradatsiya (1oo2), ikkita kanal BAD — trip (fail-safe)', () => {
  const m = new W.AmineModel(); m.sisChannel('LT17054A', 'bad'); m.advance(30); assert.strictEqual(m.sis.tripped().length, 0);
  m.sisChannel('LT17054B', 'bad'); m.advance(30); assert.ok(m.sis.tripped().includes('SIF-01'));
});

test('RESET sabab yo‘qolmaguncha rad etiladi, keyin tiklanadi', () => {
  const m = new W.AmineModel(); m.sisESD(); m.advance(20); assert.ok(m.sis.esdActive());
  m.sisReset(); m.advance(1); assert.ok(!m.sis.esdActive());
  const n = new W.AmineModel(); n.setFault('outBlocked'); n.advance(60); assert.ok(n.sis.esdActive());
  // bosim hali yuqori bo'lgan lahzada RESET — rad etiladi
  const r = new W.AmineModel(); r.setFault('outBlocked'); for (let i = 0; i < 400 && !r.sis.tripped().length; i++) r.advance(.1);
  assert.ok(r.sisReset().still.includes('SIF-05'));
});

test('PFDavg va SIL hisoblanadi', () => {
  for (const f of W.AmineSIS.SIF) { const p = W.AmineSIS.pfd(f); if (!p) continue; assert.ok(p.total > 0 && p.total < .1); assert.ok(p.sil >= 1); }
});
