// node check.js — ověří, že buildReport z index.html dává formát podle ZOZSamples/Samples.md (vzor 5)
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const core = fs.readFileSync(__dirname + '/index.html', 'utf8').split('<script>')[1].split('// --- UI ---')[0];
const buildReport = vm.runInNewContext(core + ';buildReport');

assert.strictEqual(buildReport({
  area: 'ZÁSAH MIMO KATASTR ZŘIZOVATELE', reason: 'požár', placePrefix: 'do areálu firmy', place: 'Kovošrot Groupe s.r.o.',
  found: 'na místě již zasahují ostatní jednotky', activity: 'Na pokyn VZ naše jednotka doplňovala vodu do CAS 30',
  ending: 'Po vyprázdnění CAS se jednotka vrátila zpět na základnu.',
  'cas32.crew': '1+2', 'cas32.km': '20', 'cas32.min': '30', 'cas32.pmin': '30', 'oa.crew': '1+1', 'oa.km': '20',
}), `ZÁSAH MIMO KATASTR ZŘIZOVATELE

Jednotka vyjela s CAS 32 v počtu 1+2 a OA Fabia v počtu 1+1 na požár do areálu firmy Kovošrot Groupe s.r.o. Po příjezdu na místo zásahu bylo průzkumem zjištěno, že na místě již zasahují ostatní jednotky. Na pokyn VZ naše jednotka doplňovala vodu do CAS 30. Po vyprázdnění CAS se jednotka vrátila zpět na základnu.

Ujeto:
CAS 32 - 20 km
CAS 32 - 1 Mth
OA Fabia - 20 km

Spotřeba PHM:
CAS 32 - 20 km - 10 l nafta
CAS 32 Bez čerpadla - 0,5 Mth - 8 l nafta
CAS 32 S čerpadlem - 0,5 Mth - 16 l nafta
OA Fabia - 20 km - 2 l benzín

Celkem ujeto: 40 km
Celková spotřeba PHM: nafta: 34 l, benzín: 2 l`);

// prázdný formulář = jen nadpis, žádné prázdné sekce
assert.strictEqual(buildReport({ area: 'X', ending: 'Po domluvě…' }), 'X');
// Mth jen s čerpadlem se musí objevit i v Ujeto
assert.ok(buildReport({ area: 'X', 'cas25.ph': '1' }).includes('Ujeto:\nCAS 25 - 1 Mth'));
// zaškrtnuté činnosti se spojí do jedné věty v pořadí seznamu, samostatné věty zůstanou zvlášť, poznámka je odstavec
assert.strictEqual(buildReport({ area: 'X', 'act.thermo': '1', 'act.breathing': '1', 'act.water': '1', 'act.shuttle': '1', activity: 'Vlastní text', note: 'VZ informován' }),
  'X\n\nJednotka prováděla doplňování vody do CAS ostatních jednotek, kyvadlovou dálkovou dopravu vody z hydrantu a kontrolu místa zásahu termokamerou. Členové jednotky zasahovali v dýchací technice. Vlastní text.\n\nVZ informován.');
assert.strictEqual(buildReport({ area: 'X', 'act.thermo': '1' }), 'X\n\nJednotka prováděla kontrolu místa zásahu termokamerou.');
console.log('OK');
