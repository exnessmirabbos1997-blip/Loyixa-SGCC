const test = require('node:test'), assert = require('node:assert');
const { load, MODEL } = require('./load');
const W = load(MODEL);
const run = (fault, sec) => { const m = new W.AmineModel(); m.setFault(fault); m.advance(sec); return m; };

test('normal rejim barqaror: sathlar SP atrofida, xato yo‘q', () => {
  const m = run('normal', 600);
  assert.strictEqual(m.validate().join('; '), '');
  assert.ok(Math.abs(m.s.L - 45) < 2, 'L=' + m.s.L);
  assert.ok(Math.abs(m.s.K - 35) < 2, 'K=' + m.s.K);
  assert.strictEqual(Object.keys(m.alarmStates).length, 0);
});

test('har bir nosozlik ssenariysi 900 s davomida sonli barqaror', () => {
  for (const f of Object.keys(W.AmineConfig.FAULTS)) {
    const m = run(f, 900);
    assert.strictEqual(m.validate().join('; '), '', f);
  }
});

test('LC17003 yopiq qotsa absorber sathi oshadi va H alarm beradi', () => {
  const m = run('stuckClosed', 900);
  assert.ok(m.s.L > 85, 'L=' + m.s.L);
  assert.ok(m.alarmStates.L_H || m.alarmStates.L_HH);
});

test('model deterministik', () => {
  assert.strictEqual(JSON.stringify(run('gas', 300).s), JSON.stringify(run('gas', 300).s));
});
