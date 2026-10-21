// Amin modelini (js/amine-*.js) brauzersiz, Node ichida yuklaydi.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
function load(files) {
  const win = {};
  const ctx = vm.createContext({ console, Math, JSON, Object, Array, Number, String, Set, Map, window: win });
  win.window = win;
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, 'js', f), 'utf8'), ctx, { filename: 'js/' + f });
  return win;
}
const MODEL = ['amine-network.js', 'amine-model.js'];
module.exports = { load, MODEL, root, newModel: s => new (load(MODEL).AmineModel)(s) };
