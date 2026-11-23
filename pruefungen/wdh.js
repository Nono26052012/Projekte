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
    '.lsn .wd-go{all:unset;box-sizing:border-box;cursor:pointer;flex:none;align-self:center;font-size:14px;font-weight:600;padding:6px 12px;border-radius:10px;border:1.5px solid var(--red);color:var(--red);margin-left:8px;white-space:nowrap}' +
    '.lsn .wd-go:active{background:var(--red);color:#fff}.lsn .wd-go[disabled]{opacity:.55;pointer-events:none}' +
    '.lsn .wd-ex{flex:none;align-self:center;font-size:12px;font-weight:700;padding:2px 9px;border-radius:99px;white-space:nowrap;border:1.5px solid}' +
    '.lsn .wd-ex.sa{color:#e5484d;border-color:#e5484d}.lsn .wd-ex.sa.now{background:#e5484d;color:#fff}' +
    '.lsn .wd-ex.kl{color:#d98a00;border-color:#f5a524}.lsn .wd-ex.kl.now{background:#f5a524;color:#1d1d21;border-color:#f5a524}' +
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
    var old = document.getElementById('wdh'); if (old) old.remove();
    markExams();
    if (!sample) return;
    var ls = myLessons();
    document.querySelectorAll('#lastList details.lsn > summary').forEach(function (sm) {
      if (sm.querySelector('.wd-go')) return;
      var b = sm.querySelector('b'), name = b && b.textContent.trim();
      var l = ls.filter(function (x) { return x.subject === name; }).sort(function (a, c) { return c.date.localeCompare(a.date); })[0];
      if (!l) return;
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'wd-go'; btn.textContent = busyKey === l.subject + '@' + l.date ? '…' : 'Wiederholen';
      btn.dataset.wdS = l.subject; btn.dataset.wdD = l.date;
      sm.appendChild(btn);
      var ex = sm.querySelector('.wd-ex'); if (ex) sm.insertBefore(ex, btn);
    });
  }
  var busyKey = null;

  /* Signalfarben: anstehende Schulaufgabe (rot) bzw. kleiner Leistungsnachweis (gelb) */
  function upcomingFor(name) {
    var pr = null; try { pr = JSON.parse(localStorage.getItem('klasse-prefs') || 'null'); } catch (e) {}
    var t0 = new Date(); t0.setHours(12, 0, 0, 0);
    return (DATA.exams || []).filter(function (e) { return e.subject === name && (!e.group || !pr || e.group === pr.rel); })
      .map(function (e) { var d = new Date(e.date + 'T12:00:00'); return { e: e, n: Math.round((d - t0) / 864e5) }; })
      .filter(function (x) { return x.n >= 0 && x.n <= 21; }).sort(function (a, b) { return a.n - b.n; })[0];
  }
  function badge(x) {
    var sa = /schulaufgabe/i.test(x.e.type || ''), mdl = /mdl|mündl/i.test(x.e.type || '');
    var what = sa ? (mdl ? 'Mündl. Schulaufgabe' : 'Schulaufgabe') : /kurzarbeit/i.test(x.e.type || '') ? 'Kurzarbeit' : /stegreif|\bex\b/i.test(x.e.type || '') ? 'Ex' : /test/i.test(x.e.type || '') ? 'Test' : 'Kleiner LN';
    var when = x.n === 0 ? 'heute' : x.n === 1 ? 'morgen' : 'in ' + x.n + ' Tagen';
    var sp = document.createElement('span'); sp.className = 'wd-ex ' + (sa ? 'sa' : 'kl') + (x.n <= 3 ? ' now' : '');
    sp.textContent = what + ' ' + when; sp.title = (x.e.type || '') + ' am ' + x.e.date.split('-').reverse().join('.');
    return sp;
  }
  function markExams() {
    document.querySelectorAll('#lastList details.lsn > summary').forEach(function (sm) {
      if (sm.querySelector('.wd-ex')) return;
      var b = sm.querySelector('b'), x = b && upcomingFor(b.textContent.trim()); if (!x) return;
      var bd = badge(x), go = sm.querySelector('.wd-go');
      if (go) sm.insertBefore(bd, go); else sm.appendChild(bd);
    });
  }
  function picked() { var L = latest(), seen = {}; return (L.all || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).filter(function (l) { if (!sel || !sel[l.subject] || seen[l.subject]) return false; seen[l.subject] = 1; return true; }); }
  function importantHtml(ls) {
    return '<div class="wd-imp"><h4>Das Wichtigste</h4>' + ls.map(function (l) { return '<p style="margin:10px 0 4px"><b>' + esc(l.subject) + ': ' + esc(l.title) + '</b> <span class="wd-st">(' + esc(niceD(l.date)) + ')</span></p><ul>' + l.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'; }).join('') + '</div>';
  }
  var CK = 'wdh-cache';
  function cacheGet(k) { try { return (JSON.parse(localStorage.getItem(CK) || '{}') || {})[k]; } catch (e) { return null; } }
  function cacheSet(k, v) { try { var c = JSON.parse(localStorage.getItem(CK) || '{}') || {}; var ks = Object.keys(c); if (ks.length > 12) delete c[ks[0]]; c[k] = v; localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} }

  async function go(ls) {
    if (!ls || !ls.length || !sample || !window.PT) return;
    var key = ls.map(function (l) { return l.subject + '@' + l.date; }).join('|');
    var qs = cacheGet(key);
    if (!qs) {
      busyKey = key; setBusy(true);
      var mat = ls.map(function (l) { return '### ' + l.subject + ' – ' + l.title + ' (' + l.date + ')\n' + l.points.map(function (p) { return '- ' + p; }).join('\n'); }).join('\n\n');
      var n = Math.min(12, ls.reduce(function (a, l) { return a + (window.PT && window.PT.sizes ? window.PT.sizes(l.subject).wdh : 5); }, 0));
      var gr = ls.map(function (l) { var z = window.PT && window.PT.sizes ? window.PT.sizes(l.subject) : null; return z && z.g != null ? l.subject + ': Schnitt ' + z.g.toFixed(1).replace('.', ',') : ''; }).filter(Boolean).join('; ');
      var prompt = 'Erstelle einen kurzen Wiederholungstest für eine 9. Klasse (bayerisches Gymnasium) NUR aus diesem Heftstoff der letzten Stunde(n). Erfinde keinen zusätzlichen Stoff, keine Zahlen, die nicht im Text stehen.\n\n' + mat + '\n\n' +
        'Gib genau ' + n + ' Aufgaben als JSON zurück, gemischt aus drei Typen, verteilt über alle Fächer:\n' +
        '{"questions":[{"type":"mc","subject":"Fach","q":"Frage","o":["A","B","C","D"],"a":0,"why":"kurze Erklärung, warum das richtig ist"},' +
        '{"type":"tf","subject":"Fach","s":"Aussage","a":true,"why":"kurze Erklärung (bei falsch: was stimmt)"},' +
        '{"type":"gap","subject":"Fach","pre":"Satzanfang ","ans":"fehlendes Wort (1–3 Wörter)","post":" Satzende.","why":"kurze Erklärung"}]}\n' +
        (gr ? 'Bisherige Noten: ' + gr + '. Bei schwächerem Schnitt (ab 3) mehr Grundlagen- und Verständnisfragen mit einfacher Sprache, bei gutem Schnitt (bis 2) auch anspruchsvollere Fragen, die Zusammenhänge prüfen. ' : '') + 'Regeln: Deutsch (bei Englisch dürfen Fragen auf Englisch sein). Genau 4 Antworten bei mc, plausible falsche Antworten. Bei gap muss die Lücke eindeutig sein. Ungefähr gleich viele wahre und falsche Aussagen. Nur das JSON.';
      try {
        var r = sample.json ? await sample.json(prompt, { modelTier: 'default' }) : JSON.parse((await sample(prompt, { modelTier: 'default' })).text);
        qs = (r && r.questions) || [];
        if (qs.length) cacheSet(key, qs);
      } catch (e) {
        busyKey = null; setBusy(false);
        alertMsg(e && e.code === 'not_granted' ? 'Claude darf hier gerade keine Fragen erstellen.' : e && e.code === 'rate_limited' ? 'Gerade zu viele Anfragen – gleich nochmal versuchen.' : 'Das hat nicht geklappt – versuch es gleich nochmal.');
        return;
      }
      busyKey = null; setBusy(false);
    }
    var items = [];
    (qs || []).forEach(function (q, i) {
      var pre = q.subject ? q.subject + ': ' : '';
      if (q.type === 'mc' && q.o && q.o.length >= 2 && q.a >= 0 && q.a < q.o.length) items.push({ k: 'mc', id: 'w' + i, q: pre + q.q, o: q.o, a: q.a, why: q.why });
      else if (q.type === 'tf' && q.s) items.push({ k: 'tf', id: 'w' + i, q: '', ans: pre + q.s, a: !!q.a, right: '', why: q.why });
      else if (q.type === 'gap' && q.ans) items.push({ k: 'gap', id: 'w' + i, pre: pre + (q.pre || ''), post: q.post || '', ans: q.ans, alt: [], why: q.why });
    });
    if (!items.length) { alertMsg('Keine Fragen bekommen – versuch es nochmal.'); cacheSet(key, null); return; }
    var title = 'Wiederholen: ' + ls.map(function (l) { return l.subject; }).join(', ');
    window.PT.run(title, items, importantHtml(ls) + '<div class="pt-row"><button class="pt-btn sec" data-a="wdnew">Neue Fragen erstellen</button></div>');
    lastKey = key; lastLs = ls;
  }
  var lastKey = null, lastLs = null;
  function setBusy(on) { document.querySelectorAll('.lsn .wd-go').forEach(function (b) { var k = b.dataset.wdS + '@' + b.dataset.wdD; b.disabled = on; b.textContent = on && busyKey === k ? 'Fragen kommen …' : 'Wiederholen'; }); }
  function alertMsg(t) { var ov = document.getElementById('pt'); if (!ov) return; ov.innerHTML = '<div class="pt-s" role="dialog" aria-modal="true"><div class="pt-top"><h2>Wiederholen</h2><button class="pt-x" data-a="close" aria-label="Schließen">×</button></div><p class="pt-tip">' + esc(t) + '</p></div>'; ov.hidden = false; document.body.style.overflow = 'hidden'; }
  document.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('.wd-go');
    if (g) {
      e.preventDefault(); e.stopPropagation();
      var l = myLessons().filter(function (x) { return x.subject === g.dataset.wdS && x.date === g.dataset.wdD; });
      return go(l);
    }
    if (e.target.closest && e.target.closest('[data-a="wdnew"]')) { if (lastKey) cacheSet(lastKey, null); go(lastLs); }
  }, true);

  /* „heute“ / „morgen“ an den Wochentagen */
  function tagDays() {
    var now = new Date(), w = now.getDay(), t = new Date(now); t.setDate(t.getDate() + 1); var m = t.getDay();
    document.querySelectorAll('[data-lday]').forEach(function (b) {
      if (b.querySelector('.wd-day')) return;
      var d = +b.getAttribute('data-lday'), lab = d === w ? 'heute' : d === m ? 'morgen' : '';
      if (lab) { var sp = document.createElement('span'); sp.className = 'wd-day' + (lab === 'morgen' ? ' mo' : ''); sp.textContent = lab; b.appendChild(sp); }
    });
  }

  /* ---------- Ex-Verdacht: Fach markieren, Ex-Vorbereitung mit Zusammenfassung und Test ---------- */
  var exCss = document.createElement('style');
  exCss.textContent = '.lsn .ex-t{all:unset;box-sizing:border-box;cursor:pointer;flex:none;align-self:center;font-size:13px;font-weight:700;padding:5px 10px;border-radius:10px;border:1.5px dashed #f08c00;color:#f08c00;margin-left:8px}' +
    '.lsn .ex-t[aria-pressed=true]{background:#f08c00;color:#1d1d21;border-style:solid}' +
    '.lsn .wd-ex.exm{color:#f08c00;border-color:#f08c00}' +
    '#exbox{background:var(--card);border:1.5px solid #f08c00;border-radius:16px;padding:12px 16px;margin:14px 0}' +
    '#exbox h2{margin:0 0 6px;font-size:18px}#exbox .exr{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}#exbox .exr:first-of-type{border-top:0}' +
    '#exbox .exr b{flex:1}#exbox .exr small{color:var(--soft)}#exbox .exgo{all:unset;cursor:pointer;padding:8px 14px;border-radius:10px;background:#f08c00;color:#1d1d21;font-weight:700}';
  document.head.appendChild(exCss);
  var EXK = 'ex-flags', exMine = {}, exClass = {}, exCount = {}, exMyDoc = null, exCanWrite = false, exMyFlags = {};
  try { exMine = JSON.parse(localStorage.getItem(EXK) || '{}') || {}; } catch (e) {}
  function todayIso() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function relName() { var pr = null; try { pr = JSON.parse(localStorage.getItem('klasse-prefs') || 'null'); } catch (e) {} return pr ? ({ eth: 'Ethik', rk: 'Kath. Religionslehre', ev: 'Evang. Religionslehre' }[pr.rel] || 'Ethik') : 'Ethik'; }
  /* gültig bis zum Ende der nächsten Stunde im Fach (laut Stundenplan) */
  function untilFor(subject) {
    var tt = DATA.timetable, now = new Date(), found = 0;
    for (var k = 0; tt && k < 21; k++) {
      var d = new Date(now); d.setDate(d.getDate() + k); var w = d.getDay(); if (w < 1 || w > 5) continue;
      var list = (tt.days || {})[w] || [], last = -1;
      list.forEach(function (c, i) { var n = c === 'Rel' ? relName() : (tt.names || {})[c]; if (n === subject) last = i; });
      if (last < 0) continue;
      if (k === 0) { var end = (tt.periods[last] || [])[1] || '23:59', hm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2); if (hm >= end) continue; }
      if (++found < 2) continue;
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }
    var x = new Date(now); x.setDate(x.getDate() + 10); return x.toISOString().slice(0, 10);
  }
  function active() { var t = todayIso(), out = {};
    for (var s in exClass) if (exClass[s] >= t) out[s] = { until: exClass[s], who: 'class', n: exCount[s] || 1, me: !!(exMyFlags[s] && exMyFlags[s] >= t) };
    for (var m in exMine) if (exMine[m] >= t && !out[m]) out[m] = { until: exMine[m], who: 'mine', n: 1, me: true };
    return out; }
  function saveMine() { try { localStorage.setItem(EXK, JSON.stringify(exMine)); } catch (e) {} }
  (async function () {
    try {
      if (!window.claude || typeof claude.use !== 'function') return;
      var db = await claude.use('db'), user = await claude.use('user'); if (!db || !user) return;
      var id = await user.id(); if (!id) return;
      exMyDoc = db.doc('ex/' + id); exCanWrite = true;
      db.collection('ex').onSnapshot(function (snap) {
        var t = todayIso(), agg = {}, cnt = {}; exMyFlags = {};
        snap.docs.forEach(function (d) { var f = (d.exists && d.data() && d.data().flags) || {};
          for (var k in f) { if (f[k] < t) continue; cnt[k] = (cnt[k] || 0) + 1; if (!agg[k] || f[k] > agg[k]) agg[k] = f[k]; }
          if (d.id === id) exMyFlags = f; });
        exClass = agg; exCount = cnt; renderEx();
      }, function () {});
    } catch (e) {}
  })();
  async function toggle(subject) {
    var t = todayIso();
    if (exCanWrite && exMyDoc) {
      var f = {}; for (var k in exMyFlags) if (exMyFlags[k] >= t) f[k] = exMyFlags[k];
      if (f[subject]) delete f[subject]; else f[subject] = untilFor(subject);
      try { await exMyDoc.set({ flags: f, updated: new Date().toISOString() }); exMyFlags = f; delete exMine[subject]; saveMine(); return; }
      catch (e) { exCanWrite = false; }   /* nur Lesezugriff: auf dem Gerät merken */
    }
    if (exMine[subject] && exMine[subject] >= t) delete exMine[subject]; else exMine[subject] = untilFor(subject);
    saveMine(); renderEx();
  }
  function wd(iso) { var d = new Date(iso + 'T12:00:00'); return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; }
  function renderEx() {
    var A = active();
    document.querySelectorAll('#lastList details.lsn > summary').forEach(function (sm) {
      var b = sm.querySelector('b'), name = b && b.textContent.trim(); if (!name) return;
      var t = sm.querySelector('.ex-t');
      if (!t) { t = document.createElement('button'); t.type = 'button'; t.className = 'ex-t'; t.textContent = 'Ex?'; t.dataset.exS = name; var go = sm.querySelector('.wd-go'); if (go) sm.insertBefore(t, go); else sm.appendChild(t); }
      var on = !!A[name], mine = !!(A[name] && A[name].me); t.setAttribute('aria-pressed', mine); t.title = mine ? 'Deinen Ex-Verdacht zurücknehmen' : (exCanWrite ? 'Ex-Verdacht für die Klasse melden' : 'Ex-Verdacht für dich merken');
      var bd = sm.querySelector('.wd-ex.exm');
      if (on && !bd) { bd = document.createElement('span'); bd.className = 'wd-ex exm'; sm.insertBefore(bd, t); }
      if (bd) { if (!on) bd.remove(); else { var tx = 'Ex möglich' + (A[name].who === 'class' ? ' · ' + A[name].n + (A[name].n === 1 ? ' Meldung' : ' Meldungen') : ''); if (bd.textContent !== tx) bd.textContent = tx; } }
    });
    var host = document.getElementById('hero'); if (!host) return;
    var box = document.getElementById('exbox'), keys = Object.keys(A);
    if (!keys.length) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.id = 'exbox'; host.parentNode.insertBefore(box, host.nextSibling); }
    var html = '<h2>Mögliche Ex</h2>' + keys.map(function (s) { return '<div class="exr"><b>' + esc(s) + '</b><small>bis ' + esc(wd(A[s].until)) + (A[s].who === 'class' ? ' · ' + A[s].n + (A[s].n === 1 ? ' Meldung aus der Klasse' : ' Meldungen aus der Klasse') : ' · nur bei dir') + '</small>' + (sample ? '<button class="exgo" data-exprep="' + esc(s) + '">Vorbereiten</button>' : '') + '</div>'; }).join('');
    if (box.innerHTML !== html) box.innerHTML = html;
  }
  async function prep(subject) {
    if (!sample || !window.PT) return;
    var ls = myLessons().filter(function (l) { return l.subject === subject; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    var L = ls[0]; if (!L) { alertMsg('Für ' + subject + ' gibt es noch keine Zusammenfassung der letzten Stunde.'); return; }
    var parts = [L].concat(L.prev ? [Object.assign({ subject: subject }, L.prev)] : ls.slice(1, 2));
    var key = 'ex|' + subject + '@' + parts.map(function (x) { return x.date; }).join('+'), data = cacheGet(key);
    if (!data) {
      alertMsg('Claude bereitet die Ex-Vorbereitung für ' + subject + ' vor …');
      var mat = parts.map(function (l) { return '### ' + l.title + ' (' + l.date + ')\n' + (l.points || []).map(function (p) { return '- ' + p; }).join('\n'); }).join('\n\n');
      var n = window.PT.sizes ? Math.max(5, window.PT.sizes(subject).practice) : 8;
      var prompt = 'Eine 9. Klasse (bayerisches Gymnasium) erwartet in ' + subject + ' eine unangekündigte Stegreifaufgabe (Ex) über die letzten zwei Stunden. Nutze NUR diesen Heftstoff, erfinde nichts dazu:\n\n' + mat + '\n\n' +
        'Gib JSON zurück: {"summary":["5–8 kurze Sätze: das Wichtigste, was man für die Ex können muss – Begriffe, Regeln, Formeln, typische Aufgaben"],"questions":[' + n + ' Aufgaben, gemischt: {"type":"mc","q":"…","o":["A","B","C","D"],"a":0,"why":"…"} | {"type":"tf","s":"Aussage","a":true,"why":"…"} | {"type":"gap","pre":"…","ans":"1–3 Wörter","post":"…","why":"…"}]}\n' +
        'Fragen so, wie sie in einer Ex vorkommen könnten. Deutsch (bei Englisch dürfen Fragen auf Englisch sein). Nur das JSON.';
      try { data = sample.json ? await sample.json(prompt, { modelTier: 'default' }) : JSON.parse((await sample(prompt, { modelTier: 'default' })).text); if (data && data.questions && data.questions.length) cacheSet(key, data); }
      catch (e) { alertMsg(e && e.code === 'rate_limited' ? 'Gerade zu viele Anfragen – gleich nochmal versuchen.' : 'Das hat nicht geklappt – versuch es gleich nochmal.'); return; }
    }
    var items = [];
    (data.questions || []).forEach(function (q, i) {
      if (q.type === 'mc' && q.o && q.o.length >= 2 && q.a >= 0 && q.a < q.o.length) items.push({ k: 'mc', id: 'x' + i, q: q.q, o: q.o, a: q.a, why: q.why });
      else if (q.type === 'tf' && q.s) items.push({ k: 'tf', id: 'x' + i, q: '', ans: q.s, a: !!q.a, right: '', why: q.why });
      else if (q.type === 'gap' && q.ans) items.push({ k: 'gap', id: 'x' + i, pre: q.pre || '', post: q.post || '', ans: q.ans, alt: [], why: q.why });
    });
    var sum = '<div class="wd-imp"><h4>Das Wichtigste für die Ex</h4><ul>' + (data.summary || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
    var ov = document.getElementById('pt'); if (!ov) return;
    ov.innerHTML = '<div class="pt-s" role="dialog" aria-modal="true"><div class="pt-top"><h2>Ex-Vorbereitung ' + esc(subject) + '</h2><button class="pt-x" data-a="close" aria-label="Schließen">×</button></div>' +
      '<p class="pt-tip">Erst in Ruhe lesen, dann den Test ohne Nachschauen machen.</p>' + sum + importantHtml(parts) +
      (items.length ? '<div class="pt-row"><button class="pt-btn" data-exstart="' + esc(subject) + '">Test starten (' + items.length + ' Aufgaben)</button></div>' : '') + '</div>';
    ov.hidden = false; document.body.style.overflow = 'hidden'; ov.querySelector('.pt-s').scrollTop = 0;
    exPending = { subject: subject, items: items, after: sum + importantHtml(parts) };
  }
  var exPending = null;
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.ex-t');
    if (t) { e.preventDefault(); e.stopPropagation(); if (!t.disabled) toggle(t.dataset.exS); return; }
    var p = e.target.closest && e.target.closest('[data-exprep]');
    if (p) { e.preventDefault(); prep(p.dataset.exprep); return; }
    var st = e.target.closest && e.target.closest('[data-exstart]');
    if (st && exPending) { e.preventDefault(); e.stopPropagation(); window.PT.run('Ex-Vorbereitung ' + exPending.subject, exPending.items, exPending.after); }
  }, true);

  var q = 0;
  new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; tagDays(); paint(); renderEx(); }); }).observe(document.body, { childList: true, subtree: true });
  tagDays(); paint(); renderEx();
})();
