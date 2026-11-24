/* Periodensystem: Knopf „PSE“ oben rechts in Aufgaben (Chemie), Elemente aus der Aufgabe werden markiert */
(function () {
  var RAW = 'H Wasserstoff 1,008|He Helium 4,003|Li Lithium 6,94|Be Beryllium 9,012|B Bor 10,81|C Kohlenstoff 12,01|N Stickstoff 14,01|O Sauerstoff 16,00|F Fluor 19,00|Ne Neon 20,18|' +
    'Na Natrium 22,99|Mg Magnesium 24,31|Al Aluminium 26,98|Si Silicium 28,09|P Phosphor 30,97|S Schwefel 32,06|Cl Chlor 35,45|Ar Argon 39,95|K Kalium 39,10|Ca Calcium 40,08|' +
    'Sc Scandium 44,96|Ti Titan 47,87|V Vanadium 50,94|Cr Chrom 52,00|Mn Mangan 54,94|Fe Eisen 55,85|Co Cobalt 58,93|Ni Nickel 58,69|Cu Kupfer 63,55|Zn Zink 65,38|' +
    'Ga Gallium 69,72|Ge Germanium 72,63|As Arsen 74,92|Se Selen 78,97|Br Brom 79,90|Kr Krypton 83,80|Rb Rubidium 85,47|Sr Strontium 87,62|Y Yttrium 88,91|Zr Zirconium 91,22|' +
    'Nb Niob 92,91|Mo Molybdän 95,95|Tc Technetium (98)|Ru Ruthenium 101,07|Rh Rhodium 102,91|Pd Palladium 106,42|Ag Silber 107,87|Cd Cadmium 112,41|In Indium 114,82|Sn Zinn 118,71|' +
    'Sb Antimon 121,76|Te Tellur 127,60|I Iod 126,90|Xe Xenon 131,29|Cs Caesium 132,91|Ba Barium 137,33|La Lanthan 138,91|Ce Cer 140,12|Pr Praseodym 140,91|Nd Neodym 144,24|' +
    'Pm Promethium (145)|Sm Samarium 150,36|Eu Europium 151,96|Gd Gadolinium 157,25|Tb Terbium 158,93|Dy Dysprosium 162,50|Ho Holmium 164,93|Er Erbium 167,26|Tm Thulium 168,93|Yb Ytterbium 173,05|' +
    'Lu Lutetium 174,97|Hf Hafnium 178,49|Ta Tantal 180,95|W Wolfram 183,84|Re Rhenium 186,21|Os Osmium 190,23|Ir Iridium 192,22|Pt Platin 195,08|Au Gold 196,97|Hg Quecksilber 200,59|' +
    'Tl Thallium 204,38|Pb Blei 207,2|Bi Bismut 208,98|Po Polonium (209)|At Astat (210)|Rn Radon (222)|Fr Francium (223)|Ra Radium (226)|Ac Actinium (227)|Th Thorium 232,04|' +
    'Pa Protactinium 231,04|U Uran 238,03|Np Neptunium (237)|Pu Plutonium (244)|Am Americium (243)|Cm Curium (247)|Bk Berkelium (247)|Cf Californium (251)|Es Einsteinium (252)|Fm Fermium (257)|' +
    'Md Mendelevium (258)|No Nobelium (259)|Lr Lawrencium (266)|Rf Rutherfordium (267)|Db Dubnium (268)|Sg Seaborgium (269)|Bh Bohrium (270)|Hs Hassium (277)|Mt Meitnerium (278)|Ds Darmstadtium (281)|' +
    'Rg Roentgenium (282)|Cn Copernicium (285)|Nh Nihonium (286)|Fl Flerovium (289)|Mc Moscovium (290)|Lv Livermorium (293)|Ts Tenness (294)|Og Oganesson (294)';
  var EL = RAW.split('|').map(function (s, i) { var p = s.split(' '); return { z: i + 1, s: p[0], n: p[1], m: p[2] }; });
  var BY = {}; EL.forEach(function (e) { BY[e.s] = e; });
  function inSet(z, a) { return a.indexOf(z) >= 0; }
  function cat(z) {
    if (inSet(z, [3, 11, 19, 37, 55, 87])) return 'alk';
    if (inSet(z, [4, 12, 20, 38, 56, 88])) return 'erd';
    if (inSet(z, [9, 17, 35, 53, 85, 117])) return 'hal';
    if (inSet(z, [2, 10, 18, 36, 54, 86, 118])) return 'edel';
    if (inSet(z, [1, 6, 7, 8, 15, 16, 34])) return 'nm';
    if (inSet(z, [5, 14, 32, 33, 51, 52])) return 'hm';
    if (z >= 57 && z <= 71) return 'lan';
    if (z >= 89 && z <= 103) return 'act';
    if (inSet(z, [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116])) return 'met';
    return 'ueb';
  }
  var CN = { alk: 'Alkalimetalle', erd: 'Erdalkalimetalle', ueb: 'Übergangsmetalle', met: 'weitere Metalle', hm: 'Halbmetalle', nm: 'Nichtmetalle', hal: 'Halogene', edel: 'Edelgase', lan: 'Lanthanoide', act: 'Actinoide' };
  function pos(z) { /* [Zeile, Spalte], Zeilen 8/9 = Lanthanoide/Actinoide */
    if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
    if (z <= 10) return [2, z <= 4 ? z - 2 : z + 8];
    if (z <= 18) return [3, z <= 12 ? z - 10 : z];
    if (z <= 36) return [4, z - 18]; if (z <= 54) return [5, z - 36];
    if (z >= 57 && z <= 71) return [8, z - 54]; if (z >= 89 && z <= 103) return [9, z - 86];
    if (z <= 86) return [6, z <= 56 ? z - 54 : z - 68];
    return [7, z <= 88 ? z - 86 : z - 100];
  }
  function group(z) { var p = pos(z); return p[0] >= 8 ? 3 : p[1]; }
  function period(z) { var p = pos(z); return p[0] === 8 ? 6 : p[0] === 9 ? 7 : p[0]; }
  var ORB = [[1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6], [5, 2], [4, 10], [5, 6], [6, 2], [4, 14], [5, 10], [6, 6], [7, 2], [5, 14], [6, 10], [7, 6]];
  function shells(z) { var sh = [], left = z; for (var i = 0; i < ORB.length && left > 0; i++) { var k = Math.min(ORB[i][1], left); sh[ORB[i][0] - 1] = (sh[ORB[i][0] - 1] || 0) + k; left -= k; } return sh; }
  function mainGroup(z) { var g = group(z), c = cat(z); if (c === 'lan' || c === 'act') return 0; return g <= 2 ? g : g >= 13 ? g - 10 : 0; }
  var ART = { alk: 'Alkalimetall', erd: 'Erdalkalimetall', ueb: 'Übergangsmetall', met: 'Metall', hm: 'Halbmetall', nm: 'Nichtmetall', hal: 'Halogen (Nichtmetall)', edel: 'Edelgas', lan: 'Lanthanoid (Metall)', act: 'Actinoid (Metall)' };
  var ROM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  var ION = { 1: '+', 2: '2+', 3: '3+', 5: '3−', 6: '2−', 7: '−' };
  var GAS = [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86], LIQ = [35, 80];

  /* Elemente aus dem Aufgabentext herausfinden */
  function found(text) {
    var out = {}, re = /(^|[^A-Za-zÄÖÜäöüß])((?:[A-Z][a-z]?[₀-₉⁰-⁹0-9]*)+)([⁺⁻]|\^?[0-9]*[+\-−](?![A-Za-z])|(?![A-Za-zäöüß]))/g, m;
    while ((m = re.exec(text))) {
      var tok = m[2], charge = !!m[3], parts = tok.match(/[A-Z][a-z]?[₀-₉⁰-⁹0-9]*/g) || [];
      var syms = parts.map(function (p) { return p.replace(/[₀-₉⁰-⁹0-9]+$/, ''); });
      if (!syms.every(function (s) { return BY[s]; })) continue;
      var digits = /[₀-₉⁰-⁹0-9]/.test(tok);
      if (syms.length === 1 && syms[0].length === 1 && !digits && !charge) continue;
      if (syms.length === 1 && syms[0].length === 2 && /^(Am|Es|In|No|At|Ab|Be|Ga|Ge|Ce|Pa|Po|Ho|Er|Ar|Am|Au|As|Ne)$/.test(syms[0]) && !digits && !charge) continue;
      syms.forEach(function (s) { out[s] = 1; });
    }
    return Object.keys(out);
  }

  var css = document.createElement('style');
  css.textContent =
    '.pse-btn{all:unset;cursor:pointer;font:600 13px/1 system-ui,sans-serif;letter-spacing:.04em;padding:7px 10px;border:1.5px solid var(--red,#d9480f);color:var(--red,#d9480f);border-radius:999px;margin-left:auto;white-space:nowrap}' +
    '.pse-btn:hover{background:var(--red,#d9480f);color:#fff}' +
    '#pse{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:10px}#pse[hidden]{display:none}' +
    '#pse .ps{background:var(--bg,#fff);color:var(--ink,#111);width:min(1200px,100%);max-height:96vh;overflow:auto;border-radius:18px;padding:16px 18px 18px}' +
    '#pse .ps-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}#pse h2{margin:0;font-size:19px}#pse .ps-x{all:unset;cursor:pointer;font-size:28px;line-height:1;padding:2px 10px;margin-left:auto;color:var(--soft,#777)}' +
    '#pse .ps-in{font-size:13px;color:var(--soft,#777);margin:0 0 8px}' +
    '#pse .grid{display:grid;grid-template-columns:repeat(18,minmax(34px,1fr));gap:3px;min-width:680px}' +
    '#pse .c{all:unset;box-sizing:border-box;cursor:pointer;border-radius:6px;padding:3px 2px 2px;text-align:center;line-height:1.05;min-height:44px;display:flex;flex-direction:column;justify-content:center;border:2px solid transparent;color:#111}' +
    '#pse .c small{font-size:9px;opacity:.75}#pse .c b{font-size:16px}#pse .c i{font-style:normal;font-size:8px;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '#pse .c.hit{border-color:var(--red,#d9480f);box-shadow:0 0 0 2px var(--red,#d9480f);transform:scale(1.06);z-index:1}' +
    '#pse .c.sel{outline:3px solid var(--ink,#111);outline-offset:1px}' +
    '#pse .dim .c:not(.hit){opacity:.45}' +
    '#pse .gap{grid-column:span 1}#pse .ph{font-size:10px;color:var(--soft,#777);display:flex;align-items:flex-end;justify-content:center;padding-bottom:2px}' +
    '#pse .alk{background:#ffb3a7}#pse .erd{background:#ffd8a8}#pse .ueb{background:#ffe8a3}#pse .met{background:#d0e8c5}#pse .hm{background:#b9e3d9}#pse .nm{background:#b8d8f5}#pse .hal{background:#cdc4f5}#pse .edel{background:#f2c4e6}#pse .lan{background:#e3d7c3}#pse .act{background:#e8cfc6}' +
    '#pse .leg{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:12px;margin:10px 0 0}#pse .leg span{display:inline-flex;align-items:center;gap:5px}#pse .leg em{width:12px;height:12px;border-radius:3px;display:inline-block}' +
    '#pse .det{margin-top:12px;border:1px solid var(--line,#ddd);border-radius:14px;padding:12px 14px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}' +
    '#pse .big{width:84px;height:84px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#111;flex:none}#pse .big b{font-size:32px}#pse .big small{font-size:12px}' +
    '#pse .det dl{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:0;font-size:14px}#pse .det dt{color:var(--soft,#777)}#pse .det dd{margin:0}' +
    '#pse .wrap{overflow-x:auto}';
  document.head.appendChild(css);

  var ov = document.createElement('div'); ov.id = 'pse'; ov.hidden = true; document.body.appendChild(ov);
  var hits = [], sel = null, prevOverflow = '';

  function cell(e) {
    var p = pos(e.z);
    return '<button class="c ' + cat(e.z) + (hits.indexOf(e.s) >= 0 ? ' hit' : '') + (sel === e.s ? ' sel' : '') + '" data-el="' + e.s + '" style="grid-row:' + (p[0] >= 8 ? p[0] + 1 : p[0]) + ';grid-column:' + p[1] + '" title="' + e.n + '">' +
      '<small>' + e.z + '</small><b>' + e.s + '</b><i>' + e.n + '</i></button>';
  }
  function detail(s) {
    var e = BY[s]; if (!e) return '';
    var z = e.z, mg = mainGroup(z), sh = shells(z), c = cat(z);
    var st = inSet(z, GAS) ? 'gasförmig' : inSet(z, LIQ) ? 'flüssig' : 'fest';
    var rows = [['Ordnungszahl', z + ' (' + z + ' Protonen, ' + z + ' Elektronen)'], ['Atommasse', e.m + ' u'], ['Gruppe', mg ? ROM[mg] + '. Hauptgruppe' : c === 'lan' || c === 'act' ? CN[c] : 'Nebengruppe (Gruppe ' + group(z) + ')'], ['Periode', period(z) + ' (' + period(z) + ' Schalen)'], ['Art', ART[c]], ['bei 25 °C', st]];
    if (mg) { rows.push(['Valenzelektronen', z === 2 ? '2 (Edelgas)' : String(mg)]); rows.push(['Schalen', sh.join(' · ')]); if (ION[mg] && z !== 1) rows.push(['typisches Ion', e.s + '<sup>' + ION[mg] + '</sup>']); else if (z === 1) rows.push(['typisches Ion', 'H<sup>+</sup>']); }
    return '<div class="det"><div class="big ' + c + '"><small>' + z + '</small><b>' + e.s + '</b><small>' + e.m + '</small></div><div><h3 style="margin:0 0 6px">' + e.n + '</h3><dl>' +
      rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl></div></div>';
  }
  function render() {
    var keep = ov.querySelector('.ps'), y = keep ? keep.scrollTop : 0;
    var ph = '<div class="ph" style="grid-row:6;grid-column:3">57–71</div><div class="ph" style="grid-row:7;grid-column:3">89–103</div><div style="grid-row:8;grid-column:1;height:8px"></div>';
    var info = hits.length ? 'In der Aufgabe: ' + hits.map(function (s) { return '<b>' + s + '</b> (' + BY[s].n + ')'; }).join(', ') + ' – rot umrandet.' : 'Tippe ein Element an für mehr Infos.';
    ov.innerHTML = '<div class="ps" role="dialog" aria-modal="true" aria-label="Periodensystem"><div class="ps-top"><h2>Periodensystem</h2><button class="ps-x" data-pse-close aria-label="Schließen">×</button></div>' +
      '<p class="ps-in">' + info + '</p><div class="wrap"><div class="grid' + (hits.length ? ' dim' : '') + '">' + EL.map(cell).join('') + ph + '</div></div>' +
      '<div class="leg">' + Object.keys(CN).map(function (k) { return '<span><em class="' + k + '" style="background:' + '' + '"></em>' + CN[k] + '</span>'; }).join('') + '</div>' +
      (sel ? detail(sel) : '') + '</div>';
    ov.querySelectorAll('.leg em').forEach(function (em) { var k = em.className; var tmp = ov.querySelector('.c.' + k); if (tmp) em.style.background = getComputedStyle(tmp).backgroundColor; });
    var ns = ov.querySelector('.ps'); if (ns) ns.scrollTop = y;
  }
  function open(text) {
    hits = found(text || ''); sel = hits.length === 1 ? hits[0] : null;
    prevOverflow = document.body.style.overflow; render(); ov.hidden = false; document.body.style.overflow = 'hidden';
  }
  function close() { ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = prevOverflow || 'hidden'; }
  ov.addEventListener('click', function (e) {
    if (e.target === ov || e.target.closest('[data-pse-close]')) return close();
    var c = e.target.closest('[data-el]'); if (c) { sel = sel === c.dataset.el ? null : c.dataset.el; render(); if (sel) { var d = ov.querySelector('.det'); if (d && d.scrollIntoView) d.scrollIntoView({ block: 'nearest' }); } }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ov.hidden) { e.stopImmediatePropagation(); close(); } }, true);

  /* Knopf in Aufgaben-Fenstern einsetzen */
  var CHEM = /Chemie|Atom|Isotop|Element|Ionen|Molekül|Elektron|Strahlung|Säure|Base|Salz|Reaktion|[A-Z][a-z]?[₀-₉⁺⁻]/;
  function sheetText(sheet) { return (sheet.innerText || sheet.textContent || '') + ' ' + Array.prototype.map.call(sheet.querySelectorAll('input,textarea'), function (i) { return i.value; }).join(' '); }
  function addBtn() {
    [['#modal .sheet', '.top', '.x'], ['#pt .pt-s', '.pt-top', '.pt-x']].forEach(function (d) {
      var sheet = document.querySelector(d[0]); if (!sheet) return;
      var top = sheet.querySelector(d[1]); if (!top || top.querySelector('.pse-btn')) return;
      var head = (top.textContent || '');
      if (/Einstellungen|Noten/.test(head)) return;
      if (!CHEM.test(head) && !CHEM.test(sheet.textContent || '')) return;
      if (/Englisch|Latein|Deutsch|Physik|Mathe|Religion|Ethik|Informatik|Geschichte|Erdkunde/.test(head) && !/Chemie/.test(head)) return;
      var b = document.createElement('button'); b.className = 'pse-btn'; b.type = 'button'; b.textContent = 'PSE'; b.title = 'Periodensystem'; b.setAttribute('aria-label', 'Periodensystem öffnen');
      var x = top.querySelector(d[2]); top.insertBefore(b, x || null);
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pse-btn'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var sheet = b.closest('.sheet, .pt-s'); open(sheet ? sheetText(sheet) : '');
  }, true);
  var q = 0;
  new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; addBtn(); }); }).observe(document.body, { childList: true, subtree: true });
  addBtn();
  window.PSE = { open: open, found: found };
})();
