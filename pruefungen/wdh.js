/* Wiederholen: kurzer Test zum Stoff der letzten Stunde, danach das Wichtigste und Erklärungen.
   Außerdem: „heute“ / „morgen“ an den Wochentagen unter „Letzte Stunde“. */
(function () {
  var DATA = {}; try { DATA = JSON.parse(document.getElementById('app-data').textContent); } catch (e) {}
  var css = '' +
    '#wdh{background:var(--card);border:1.5px solid var(--red);border-radius:16px;padding:14px 16px;margin:14px 0 14px}' +
    '#wdh h2{margin:0 0 4px;font-size:19px;display:flex;align-items:center;gap:8px}' +
    '#wdh .wd-m{font-size:14px;color:var(--soft);margin:0 0 10px}' +
    '#wdh .wd-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}' +
    '#wdh .wd-chip{all:unset;cursor:pointer;font-size:14px;padding:7px 12px;border-radius:999px;border:1px solid var(--line);color:var(--ink)}' +
    '#wdh .wd-chip.on{background:var(--red);border-color:var(--red);color:#fff}' +
    '#wdh .wd-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '#wdh .wd-btn{all:unset;box-sizing:border-box;cursor:pointer;padding:11px 16px;border-radius:12px;background:var(--red);color:#fff;font-weight:600}' +
    '#wdh .wd-btn.sec{background:transparent;color:var(--ink);border:1px solid var(--line)}' +
    '#wdh .wd-btn[disabled]{opacity:.55;pointer-events:none}' +
    '#wdh .wd-st{font-size:14px;color:var(--soft)}' +
    '.wd-day{font-size:11px;font-weight:600;margin-left:6px;padding:1px 7px;border-radius:99px;background:var(--red);color:#fff;vertical-align:2px}' +
    '.wd-day.mo{background:transparent;color:var(--red);border:1px solid var(--red)}' +
    '.wd-imp{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 16px;margin-top:14px}' +
    '.wd-imp h4{margin:4px 0 6px}.wd-imp ul{margin:0 0 6px;padding-left:20px}.wd-imp li{margin:0 0 6px;line-height:1.45}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var WDN = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  function niceD(s) { var d = new Date(s + 'T12:00:00'); return WDN[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; }

  /* Religion/Ethik: in der Klassen-Version nur die eigene Gruppe */
  function myLessons() {
    var pr = null; try { pr = JSON.parse(localStorage.getItem('klasse-prefs') || 'null'); } catch (e) {}
    var mine = pr ? ({ eth: 'Ethik', rk: 'Kath. Religionslehre', ev: 'Evang. Religionslehre' }[pr.rel] || 'Ethik') : 'Ethik';
    return (DATA.lessons || []).filter(function (l) { return l && l.points && l.points.length && (!/^(Ethik|Kath\. Religionslehre|Evang\. Religionslehre)$/.test(l.subject) || l.subject === mine); });
  }
  function latest() {
    var ls = myLessons(); if (!ls.length) return { date: null, list: [] };
    var d = ls.map(function (l) { return l.date; }).sort().pop();
    return { date: d, list: ls.filter(function (l) { return l.date === d; }), all: ls };
  }
  var sel = null, busy = false, sample = null;
  (async function () { try { if (window.claude && typeof claude.use === 'function') sample = await claude.use('sample'); } catch (e) {} paint(); })();

  function paint() {
    var sec = document.querySelector('[data-sec="last"]'), list = document.getElementById('lastList'); if (!sec || !list) return;
    var box = document.getElementById('wdh');
    if (!box) { box = document.createElement('div'); box.id = 'wdh'; list.parentNode.insertBefore(box, list); }
    var L = latest();
    if (!L.list.length) { box.innerHTML = '<h2>Wiederholen</h2><p class="wd-m">Sobald Zusammenfassungen der Stunden da sind, kannst du hier den Stoff der letzten Stunde kurz testen.</p>'; return; }
    /* Fächer zur Auswahl: alle der letzten 7 Tage, vorausgewählt: die vom letzten Tag */
    var cutoff = new Date(L.date + 'T12:00:00'); cutoff.setDate(cutoff.getDate() - 6); var cut = cutoff.toISOString().slice(0, 10);
    var recent = L.all.filter(function (l) { return l.date >= cut; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    var seen = {}; recent = recent.filter(function (l) { if (seen[l.subject]) return false; seen[l.subject] = 1; return true; });
    if (!sel) { sel = {}; L.list.forEach(function (l) { sel[l.subject] = 1; }); }
    var picked = recent.filter(function (l) { return sel[l.subject]; });
    box.innerHTML = '<h2>Wiederholen</h2><p class="wd-m">Kurzer Test zum Stoff der letzten Stunde – danach siehst du das Wichtigste und warum etwas falsch war.</p>' +
      '<div class="wd-chips">' + recent.map(function (l) { return '<button class="wd-chip' + (sel[l.subject] ? ' on' : '') + '" data-wd="' + esc(l.subject) + '">' + esc(l.subject) + ' · ' + esc(niceD(l.date)) + '</button>'; }).join('') + '</div>' +
      '<div class="wd-row"><button class="wd-btn" data-wdgo' + (picked.length && !busy ? '' : ' disabled') + '>' + (busy ? 'Fragen werden erstellt …' : 'Wiederholen starten') + '</button>' +
      '<button class="wd-btn sec" data-wdread' + (picked.length ? '' : ' disabled') + '>Nur das Wichtigste lesen</button>' +
      '<span class="wd-st" id="wdSt">' + (sample ? '' : 'Den Test erstellt Claude – das klappt in der Claude-App. Hier kannst du das Wichtigste lesen.') + '</span></div>';
    if (!sample) { var g = box.querySelector('[data-wdgo]'); if (g) g.disabled = true; }
  }
  function picked() { var L = latest(), seen = {}; return (L.all || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).filter(function (l) { if (!sel || !sel[l.subject] || seen[l.subject]) return false; seen[l.subject] = 1; return true; }); }
  function importantHtml(ls) {
    return '<div class="wd-imp"><h4>Das Wichtigste</h4>' + ls.map(function (l) { return '<p style="margin:10px 0 4px"><b>' + esc(l.subject) + ': ' + esc(l.title) + '</b> <span class="wd-st">(' + esc(niceD(l.date)) + ')</span></p><ul>' + l.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'; }).join('') + '</div>';
  }
  var CK = 'wdh-cache';
  function cacheGet(k) { try { return (JSON.parse(localStorage.getItem(CK) || '{}') || {})[k]; } catch (e) { return null; } }
  function cacheSet(k, v) { try { var c = JSON.parse(localStorage.getItem(CK) || '{}') || {}; var ks = Object.keys(c); if (ks.length > 12) delete c[ks[0]]; c[k] = v; localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} }

  async function go() {
    var ls = picked(); if (!ls.length || !sample || !window.PT) return;
    var key = ls.map(function (l) { return l.subject + '@' + l.date; }).join('|');
    var qs = cacheGet(key);
    if (!qs) {
      busy = true; paint();
      var mat = ls.map(function (l) { return '### ' + l.subject + ' – ' + l.title + ' (' + l.date + ')\n' + l.points.map(function (p) { return '- ' + p; }).join('\n'); }).join('\n\n');
      var n = Math.min(10, Math.max(5, ls.length * 4));
      var prompt = 'Erstelle einen kurzen Wiederholungstest für eine 9. Klasse (bayerisches Gymnasium) NUR aus diesem Heftstoff der letzten Stunde(n). Erfinde keinen zusätzlichen Stoff, keine Zahlen, die nicht im Text stehen.\n\n' + mat + '\n\n' +
        'Gib genau ' + n + ' Aufgaben als JSON zurück, gemischt aus drei Typen, verteilt über alle Fächer:\n' +
        '{"questions":[{"type":"mc","subject":"Fach","q":"Frage","o":["A","B","C","D"],"a":0,"why":"kurze Erklärung, warum das richtig ist"},' +
        '{"type":"tf","subject":"Fach","s":"Aussage","a":true,"why":"kurze Erklärung (bei falsch: was stimmt)"},' +
        '{"type":"gap","subject":"Fach","pre":"Satzanfang ","ans":"fehlendes Wort (1–3 Wörter)","post":" Satzende.","why":"kurze Erklärung"}]}\n' +
        'Regeln: Deutsch (bei Englisch dürfen Fragen auf Englisch sein). Genau 4 Antworten bei mc, plausible falsche Antworten. Bei gap muss die Lücke eindeutig sein. Ungefähr gleich viele wahre und falsche Aussagen. Nur das JSON.';
      try {
        var r = sample.json ? await sample.json(prompt, { modelTier: 'default' }) : JSON.parse((await sample(prompt, { modelTier: 'default' })).text);
        qs = (r && r.questions) || [];
        if (qs.length) cacheSet(key, qs);
      } catch (e) {
        busy = false; paint(); var s = document.getElementById('wdSt');
        if (s) s.textContent = e && e.code === 'not_granted' ? 'Claude darf hier gerade keine Fragen erstellen.' : e && e.code === 'rate_limited' ? 'Gerade zu viele Anfragen – gleich nochmal versuchen.' : 'Das hat nicht geklappt – versuch es gleich nochmal.';
        return;
      }
      busy = false; paint();
    }
    var items = [];
    (qs || []).forEach(function (q, i) {
      var pre = q.subject ? q.subject + ': ' : '';
      if (q.type === 'mc' && q.o && q.o.length >= 2 && q.a >= 0 && q.a < q.o.length) items.push({ k: 'mc', id: 'w' + i, q: pre + q.q, o: q.o, a: q.a, why: q.why });
      else if (q.type === 'tf' && q.s) items.push({ k: 'tf', id: 'w' + i, q: '', ans: pre + q.s, a: !!q.a, right: '', why: q.why });
      else if (q.type === 'gap' && q.ans) items.push({ k: 'gap', id: 'w' + i, pre: pre + (q.pre || ''), post: q.post || '', ans: q.ans, alt: [], why: q.why });
    });
    if (!items.length) { var s2 = document.getElementById('wdSt'); if (s2) s2.textContent = 'Keine Fragen bekommen – versuch es nochmal.'; cacheSet(key, null); return; }
    var title = 'Wiederholen: ' + ls.map(function (l) { return l.subject; }).join(', ');
    window.PT.run(title, items, importantHtml(ls) + '<div class="pt-row"><button class="pt-btn sec" data-a="wdnew">Neue Fragen erstellen</button></div>');
    lastKey = key;
  }
  var lastKey = null;
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-wd]');
    if (c) { sel[c.dataset.wd] = !sel[c.dataset.wd]; return paint(); }
    if (e.target.closest && e.target.closest('[data-wdgo]')) return go();
    if (e.target.closest && e.target.closest('[data-wdread]')) {
      var ls = picked(); if (!ls.length || !window.PT) return;
      var ov = document.getElementById('pt'); if (!ov) return;
      ov.innerHTML = '<div class="pt-s" role="dialog" aria-modal="true"><div class="pt-top"><h2>Das Wichtigste</h2><button class="pt-x" data-a="close" aria-label="Schließen">×</button></div>' + importantHtml(ls) + '</div>';
      ov.hidden = false; document.body.style.overflow = 'hidden'; return;
    }
    if (e.target.closest && e.target.closest('[data-a="wdnew"]')) { if (lastKey) cacheSet(lastKey, null); go(); }
  });

  /* „heute“ / „morgen“ an den Wochentagen */
  function tagDays() {
    var now = new Date(), w = now.getDay(), t = new Date(now); t.setDate(t.getDate() + 1); var m = t.getDay();
    document.querySelectorAll('[data-lday]').forEach(function (b) {
      if (b.querySelector('.wd-day')) return;
      var d = +b.getAttribute('data-lday'), lab = d === w ? 'heute' : d === m ? 'morgen' : '';
      if (lab) { var sp = document.createElement('span'); sp.className = 'wd-day' + (lab === 'morgen' ? ' mo' : ''); sp.textContent = lab; b.appendChild(sp); }
    });
  }
  var q = 0;
  new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; tagDays(); if (!document.getElementById('wdh')) paint(); }); }).observe(document.body, { childList: true, subtree: true });
  tagDays(); paint();
})();
