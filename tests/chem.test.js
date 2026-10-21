const test = require('node:test'), assert = require('node:assert');
const { load } = require('./load');
const W = load(['amine-network.js', 'amine-chem.js', 'amine-model.js']);
const settle = (o, sec = 900) => { const c = new W.AmineChem(); for (let i = 0; i < sec * 10; i++) c.step(o, .1); return c; };
const NOM = { g: 100, lean: 100, Ti: 30.92, fault: 'normal' };

test('nominal nuqta DCS ekraniga mos (TI17005 56,5; TI17006 60,6; AI17001 ≈ 560)', () => {
  const c = settle(NOM), s = c.snapshot('normal');
  assert.ok(Math.abs(c.x.To - 56.5) < .2, 'To=' + c.x.To);
  assert.ok(Math.abs(c.x.Tr - 60.6) < .3, 'Tr=' + c.x.Tr);
  assert.ok(Math.abs(s.ai - 560.6) < 15, 'AI=' + s.ai);
  assert.ok(s.a > .2 && s.a < .35, 'alpha=' + s.a);
});

test('amin sarfi kamaysa CO₂ yutilishi monoton pasayadi, yuklanish oshadi', () => {
  const c = new W.AmineChem(); let prevRem = Infinity, prevA = 0;
  for (const L of [130, 100, 75, 50, 30, 18, 10]) {
    const t = c.solve({ ...NOM, lean: L });
    assert.ok(t.rem <= prevRem + 1e-9, 'lean ' + L); assert.ok(t.a >= prevA - 1e-9, 'lean ' + L);
    prevRem = t.rem; prevA = t.a;
  }
});

test('gaz yuklamasi oshsa tozalangan gazda CO₂ oshadi', () => {
  const c = new W.AmineChem(); let prev = 0;
  for (const g of [40, 80, 100, 130, 160]) { const t = c.solve({ ...NOM, g }); assert.ok(t.co2 > prev, 'g ' + g); prev = t.co2; }
});

test('kimyoviy nosozliklar gaz sifatini yomonlashtiradi', () => {
  const base = settle(NOM).snapshot('normal').co2;
  for (const f of ['leanLoad', 'foam', 'dilution', 'feedCO2']) {
    const s = settle({ ...NOM, fault: f }).snapshot(f);
    assert.ok(s.co2 > base * 1.5, f + ': ' + s.co2);
  }
});

test('analizator nosozligida o‘lchov NaN, model hisobi davom etadi', () => {
  const m = new W.AmineModel(); m.setFault('analyzer'); m.advance(60);
  assert.strictEqual(m.s.ai, null); assert.ok(m.s.co2 > 0); assert.ok(m.alarmStates.BAD_AI);
});

test('raqamli egizak normal ishda o‘lchovga mos, kimyoviy nosozlikda farq qiladi', () => {
  const a = new W.AmineModel(); a.advance(600); assert.ok(Math.abs(Math.log10(a.s.ai / a.s.aiExp)) < .01);
  const b = new W.AmineModel(); b.setFault('leanLoad'); b.advance(600); assert.ok(Math.log10(b.s.ai / b.s.aiExp) > .2);
});

test('nol oqimlarda son barqaror (NaN yo‘q)', () => {
  const c = new W.AmineChem();
  for (const o of [{ ...NOM, g: 0 }, { ...NOM, lean: 0 }, { ...NOM, g: 0, lean: 0 }]) { for (let i = 0; i < 3000; i++) c.step(o, .1); for (const v of Object.values(c.x)) assert.ok(v === null || Number.isFinite(v)); }
});
