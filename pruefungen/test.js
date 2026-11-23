/* Probetest: gemischte Aufgaben (Multiple Choice, Wahr/Falsch, Lückentext, Tippen) zu ausgewählten Bereichen,
   Auswertung mit Punkten, Note (Schätzung) und Verbesserung; optional persönliches Feedback von Claude. */
(function () {
  var css = "" +
    ".pt-open{margin-top:8px}" +
    "#pt{position:fixed;inset:0;z-index:61;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}" +
    "#pt[hidden]{display:none}" +
    "#pt .pt-s{background:var(--bg);color:var(--ink);width:100%;max-width:760px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:20px 20px calc(24px + env(safe-area-inset-bottom))}" +
    "@media (min-width:1000px){#pt{align-items:center}#pt .pt-s{max-width:min(1000px,88vw);border-radius:20px;max-height:90vh;padding:28px 36px}}" +
    "#pt h2{margin:0;font-size:22px}#pt h4{margin:16px 0 8px;font-size:15px}" +
    "#pt .pt-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}" +
    "#pt .pt-x{all:unset;cursor:pointer;font-size:26px;line-height:1;padding:4px 8px;color:var(--soft)}" +
    "#pt .pt-tip{font-size:14px;color:var(--soft);margin:4px 0 10px}" +
    "#pt .pt-chips{display:flex;flex-wrap:wrap;gap:6px}" +
    "#pt .chip{all:unset;cursor:pointer;font-size:14px;padding:7px 12px;border-radius:999px;border:1px solid var(--line);color:var(--ink)}" +
    "#pt .chip.on{background:var(--red);border-color:var(--red);color:#fff}" +
    "#pt .pt-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:12px;background:var(--red);color:#fff;font-weight:600;font-size:16px}" +
    "#pt .pt-btn.sec{background:var(--card);color:var(--ink);border:1px solid var(--line)}" +
    "#pt .pt-btn[disabled]{opacity:.5;pointer-events:none}" +
    "#pt .pt-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}" +
    "#pt .pt-q{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-top:10px}" +
    "#pt .pt-q.ok{border-color:#2e9b5b}#pt .pt-q.bad{border-color:var(--red)}" +
    "#pt .pt-qh{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--soft);margin-bottom:6px}" +
    "#pt .pt-qt{font-size:16px;line-height:1.45}" +
    "#pt .pt-opts{display:grid;gap:6px;margin-top:10px}" +
    "#pt .pt-opt{all:unset;cursor:pointer;padding:10px 12px;border-radius:10px;border:1px solid var(--line);font-size:15px}" +
    "#pt .pt-opt.sel{border-color:var(--red);box-shadow:inset 0 0 0 1px var(--red)}" +
    "#pt .pt-opt.right{border-color:#2e9b5b;box-shadow:inset 0 0 0 1px #2e9b5b}" +
    "#pt .pt-tf{display:flex;gap:8px;margin-top:10px}#pt .pt-tf .pt-opt{flex:1;text-align:center}" +
    "#pt input.pt-gap{font:inherit;font-size:16px;width:9em;max-width:60vw;padding:3px 8px;border:none;border-bottom:2px solid var(--red);background:transparent;color:var(--ink);border-radius:0}" +
    "#pt textarea{font:inherit;font-size:15px;width:100%;box-sizing:border-box;min-height:90px;margin-top:10px;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}" +
    "#pt .pt-fb{margin-top:10px;font-size:14px;line-height:1.45}#pt .pt-fb b{display:block}" +
    "#pt .pt-res{display:flex;align-items:center;gap:18px;flex-wrap:wrap;background:var(--card);border:1px solid var(--red);border-radius:16px;padding:16px 18px;margin-top:8px}" +
    "#pt .pt-note{font-size:54px;font-weight:800;line-height:1;color:var(--red)}" +
    "#pt .pt-hist{font-size:13px;color:var(--soft);margin-top:8px}" +
    /* Aufgaben im Vollbild */
    "#modal,#pt,#nt{align-items:stretch!important;justify-content:stretch!important;padding:0!important}" +
    "#modal .sheet,#pt .pt-s,#nt .nt-s{box-sizing:border-box;width:100vw!important;max-width:none!important;height:100vh;height:100dvh;max-height:none!important;border-radius:0!important;" +
    "padding:max(14px,env(safe-area-inset-top)) max(22px,env(safe-area-inset-right),calc((100vw - 1100px)/2)) calc(28px + env(safe-area-inset-bottom)) max(22px,env(safe-area-inset-left),calc((100vw - 1100px)/2))!important}" +
    "#modal .sheet>.top,#pt .pt-top,#nt .nt-top{position:sticky;top:calc(-1 * max(14px,env(safe-area-inset-top)));z-index:3;background:var(--bg);padding:12px 0 10px;margin-top:-2px}" +
    "#pt .pt-qt,#modal .sheet .learn li{font-size:17px}" +
    "#pt .pt-ai{white-space:pre-wrap;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-top:10px;font-size:15px;line-height:1.5}";
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  /* Stiftfarbe: light-dark()-Farben versteht die Zeichenfläche nicht – passende Farbe für Hell/Dunkel wählen */
  try {
    var sd = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'strokeStyle');
    if (sd && sd.set && !CanvasRenderingContext2D.prototype.__ldFix) {
      Object.defineProperty(CanvasRenderingContext2D.prototype, 'strokeStyle', { configurable: true, get: sd.get, set: function (v) {
        if (typeof v === 'string' && v.indexOf('light-dark(') === 0) {
          var m = /light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/.exec(v), t = document.documentElement.dataset.theme;
          var dark = t === 'dark' || (t !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
          if (m) v = dark ? m[2] : m[1];
        }
        sd.set.call(this, v);
      } });
      CanvasRenderingContext2D.prototype.__ldFix = 1;
    }
  } catch (e) {}
  var ov = document.createElement('div'); ov.id = 'pt'; ov.hidden = true; document.body.appendChild(ov);

  var DATA = {}; try { DATA = JSON.parse(document.getElementById('app-data').textContent); } catch (e) {}
  var HK = 'tests-v1', hist = {}; try { hist = JSON.parse(localStorage.getItem(HK) || '{}') || {}; } catch (e) {}
  function saveHist() { try { localStorage.setItem(HK, JSON.stringify(hist)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var SUBS = '₀₁₂₃₄₅₆₇₈₉', SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function norm(s) {
    s = String(s || '').toLowerCase();
    s = s.replace(/[₀-₉]/g, function (c) { return String(SUBS.indexOf(c)); }).replace(/[⁰¹²³⁴-⁹]/g, function (c) { return String(SUPS.indexOf(c)); });
    return s.replace(/[⁺₊]/g, '+').replace(/[⁻₋−–]/g, '-').replace(/[\^_]/g, '').replace(/\s*(→|=>|->)\s*/g, '>').replace(/[\s.,;:!?„“"'()]/g, '');
  }
  function exams() { return (DATA.exams || []).filter(function (e) { return (e.quiz && e.quiz.length) || (e.writes && e.writes.length) || (e.gaps && e.gaps.length) || (e.tf && e.tf.length); }); }
  function findEx(id) { return (DATA.exams || []).find(function (e) { return e.id === id; }); }

  /* ---------- Aufgaben aus den vorhandenen Inhalten bilden ---------- */
  function pool(ex) {
    var mc = [], tf = [], gap = [], wr = [], usedGap = {};
    (ex.quiz || []).forEach(function (q, i) {
      if (!q || !q.o || q.o.length < 2) return;
      mc.push({ k: 'mc', id: 'q' + i, src: i, u: q.u, q: q.q, o: q.o, a: q.a, why: q.why });
      /* Wahr/Falsch: Frage mit einer Antwort – stimmt sie? */
      var right = Math.random() < 0.5, wrongIx = q.o.map(function (_, j) { return j; }).filter(function (j) { return j !== q.a; });
      var shown = right ? q.a : wrongIx[Math.floor(Math.random() * wrongIx.length)];
      tf.push({ k: 'tf', id: 't' + i, src: i, u: q.u, q: q.q, ans: q.o[shown], a: right, right: q.o[q.a], why: q.why });
      /* Lückentext aus der Erklärung, wenn die richtige Antwort darin vorkommt */
      var A = String(q.o[q.a] || '').trim();
      if (q.why && A && A.split(/\s+/).length <= 3 && A.length <= 30) {
        var ix = q.why.toLowerCase().indexOf(A.toLowerCase());
        if (ix >= 0) gap.push({ k: 'gap', id: 'g' + i, src: i, u: q.u, pre: q.why.slice(0, ix), post: q.why.slice(ix + A.length), ans: A });
      }
    });
    /* Lückentext aus den Merksätzen der Lerneinheiten */
    (ex.units || []).forEach(function (u) {
      var answers = (ex.quiz || []).filter(function (q) { return q.u === u.id && q.o; }).map(function (q) { return String(q.o[q.a] || '').trim(); })
        .filter(function (A) { return A && A.length >= 2 && A.length <= 30 && A.split(/\s+/).length <= 3; }).sort(function (a, b) { return b.length - a.length; });
      (u.learn || []).forEach(function (s, li) {
        for (var j = 0; j < answers.length; j++) {
          var A = answers[j], ix = s.toLowerCase().indexOf(A.toLowerCase());
          if (ix < 0) continue;
          var before = s.charAt(ix - 1), after = s.charAt(ix + A.length);
          if (/[A-Za-zÄÖÜäöüß0-9]/.test(before) || /[A-Za-zÄÖÜäöüß]/.test(after)) continue;
          var key = u.id + '|' + li; if (usedGap[key]) break; usedGap[key] = 1;
          gap.push({ k: 'gap', id: 'l' + u.id + '-' + li, u: u.id, pre: s.slice(0, ix), post: s.slice(ix + A.length), ans: s.substr(ix, A.length) });
          break;
        }
      });
    });
    /* Weitere Lücken: Fachbegriffe, Definitionen und Werte aus den Merksätzen */
    if (!/englisch/i.test(ex.subject || '')) (ex.units || []).forEach(function (u) {
      var qs = (ex.quiz || []).filter(function (q) { return q.u === u.id; });
      var texts = (u.learn || []).map(function (s, li) { return { s: s, key: u.id + '|' + li, id: 'k' + u.id + '-' + li }; })
        .concat(qs.map(function (q, qi) { return { s: q.why || '', key: 'w' + u.id + '|' + qi, id: 'kw' + u.id + '-' + qi }; }));
      var all = (u.title || '') + ' ' + texts.map(function (t) { return t.s; }).join(' ') + ' ' + qs.map(function (q) { return q.q + ' ' + (q.o || []).join(' '); }).join(' ');
      var used = {}; gap.forEach(function (g) { if (g.u === u.id) used[norm(g.ans)] = 1; });
      var STOP = /^(Allgemein|Faustregel|Rechenweg|Tipp|Merksatz|Regel|Vorgehen|Schritt|Beispiel|Beispiele|Achtung|Wichtig|Merke|Hinweis|Versuch|Messung|Umrechnen|Rechnung|Ergebnis|Lösung|Aufgabe|Formel|Immer|Dabei|Deshalb|Daher|Außerdem|Insgesamt|Zuerst|Danach|Jeder|Jede|Jedes|Beim|Wenn|Weil|Dort|Hier|Diese|Dieser|Dieses|Damit|Davon|Doppelte|Halbe|Drei|Zwei|Vier|Mit|Ohne|Sie|Man|Vor|Nach)$/;
      function count(w) { var n = 0, i = -1, l = all.toLowerCase(), x = w.toLowerCase(); while ((i = l.indexOf(x, i + 1)) >= 0) n++; return n; }
      texts.forEach(function (t) {
        var s = t.s; if (!s || s.length < 25 || usedGap[t.key]) return;
        var c = [], m;
        m = /^([A-ZÄÖÜ][A-Za-zÄÖÜäöüß\-]+(?: [A-Za-zÄÖÜäöüß\-]+){0,2}):\s+\S/.exec(s);
        if (m && !STOP.test(m[1]) && m[1].length <= 32) c.push({ i: 0, a: m[1], sc: 6 });
        var re = /\(([a-zäöü][a-zäöüß\-]+(?: [a-zäöüßA-ZÄÖÜ\-]+){0,2})\)/g;
        while ((m = re.exec(s))) if (!/^z\. ?B|^ca|^vgl/.test(m[1])) c.push({ i: m.index + 1, a: m[1], sc: 4 });
        re = /(^|[\s(=≈~→])(\d{1,3}(?: \d{3})*(?:,\d+)?\s?(?:%|(?:k|M|m|c|µ)?(?:J|N|W|Pa|V|A|g|m|s|h|°C)(?:\/s²|\/s|\/h|²|³)?|km\/h|m\/s²?|Mrd\. Jahre|Jahre))(?![A-Za-zäöüß/0-9])/g;
        while ((m = re.exec(s))) c.push({ i: m.index + m[1].length, a: m[2], sc: 3 });
        re = /[A-ZÄÖÜ][a-zäöüß]{3,}(?:-[A-ZÄÖÜa-zäöüß0-9]+)*/g;
        while ((m = re.exec(s))) {
          var w = m[0], at = m.index, pre = s.slice(0, at);
          if (STOP.test(w) || /^\s*$/.test(pre) || /[.:!?]\s*$/.test(pre)) continue;
          c.push({ i: at, a: w, sc: 1 + Math.min(4, count(w) - 1) + ((u.title || '').toLowerCase().indexOf(w.toLowerCase()) >= 0 ? 2 : 0) + (w.length >= 9 ? 1 : 0) });
        }
        c = c.filter(function (x) { return !used[norm(x.a)]; }).sort(function (a, b) { return b.sc - a.sc; });
        if (!c.length || c[0].sc < 2) return;
        var b = c[0]; used[norm(b.a)] = 1; usedGap[t.key] = 1;
        gap.push({ k: 'gap', id: t.id, u: u.id, pre: s.slice(0, b.i), post: s.slice(b.i + b.a.length), ans: b.a });
      });
    });
    /* ausdrücklich eingetragene Aufgaben (falls vorhanden) */
    (ex.tf || []).forEach(function (t, i) { tf.push({ k: 'tf', id: 'T' + i, u: t.u, q: '', ans: t.s, a: !!t.a, right: '', why: t.why }); });
    (ex.gaps || []).forEach(function (g, i) {
      var m = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(g.t || ''); if (!m) return;
      gap.push({ k: 'gap', id: 'G' + i, u: g.u, pre: g.t.slice(0, m.index), post: g.t.slice(m.index + m[0].length), ans: m[1], alt: m[2] ? m[2].split('/') : [] });
    });
    (ex.writes || []).forEach(function (w, i) { if (w.keys && w.keys.length) wr.push({ k: 'wr', id: 'w' + i, u: w.u, w: w }); });
    /* Vokabeln / Karteikarten: tippen, ankreuzen, wahr/falsch */
    var voc = [], cards = (ex.cards || []).filter(function (c) { return c && c.f && c.b; });
    cards.forEach(function (c, i) {
      voc.push({ k: 'voc', id: 'v' + i, src: 'c' + i, card: 1, q: c.f, ans: c.b });
      if (cards.length >= 4) {
        var others = shuffle(cards.filter(function (_, j) { return j !== i; })).slice(0, 3).map(function (o) { return o.b; });
        var o = shuffle([c.b].concat(others));
        mc.push({ k: 'mc', id: 'cm' + i, src: 'c' + i, card: 1, q: c.f, o: o, a: o.indexOf(c.b), why: c.f + ' – ' + c.b });
        var right = Math.random() < 0.5, show = right ? c.b : others[0];
        tf.push({ k: 'tf', id: 'ct' + i, src: 'c' + i, card: 1, q: c.f, ans: show, a: right, right: c.b, why: c.f + ' – ' + c.b });
      }
    });
    return { mc: mc, tf: tf, gap: gap, wr: wr, voc: voc };
  }
  function alts(x) { var a = String(x || '').split(/\s*[,;/]\s*|\s+oder\s+/i).filter(Boolean); a.push(String(x || '')); return a.concat(a.map(function (v) { return v.replace(/^(to|the|a|an|der|die|das|ein|eine)\s+/i, ''); })); }
  /* ---------- Anpassung an Note und Fehler ---------- */
  var SK = 'pt-stats', stats = {}; try { stats = JSON.parse(localStorage.getItem(SK) || '{}') || {}; } catch (e) {}
  function saveStats() { try { var ks = Object.keys(stats); if (ks.length > 1500) ks.sort(function (a, b) { return (stats[a].t || 0) - (stats[b].t || 0); }).slice(0, ks.length - 1500).forEach(function (k) { delete stats[k]; }); localStorage.setItem(SK, JSON.stringify(stats)); } catch (e) {} }
  function skey(exId, it) { return exId + '|' + (it.src != null ? 's' + it.src : it.id); }
  function gradeOf(subject) {
    var D = null; try { D = JSON.parse(localStorage.getItem('noten-v1') || 'null'); } catch (e) {}
    var sub = D && (D.subjects || []).find(function (x) { return x.n === subject; }); if (!sub || !sub.g || !sub.g.length) return null;
    var mean = function (a) { var s = 0, w = 0; a.forEach(function (g) { s += g.v * (g.w || 1); w += (g.w || 1); }); return w ? s / w : null; };
    var G = mean(sub.g.filter(function (g) { return g.t === 'gross'; })), K = mean(sub.g.filter(function (g) { return g.t === 'klein'; }));
    var sa = (DATA.exams || []).filter(function (e) { return e.subject === subject && /schulaufgabe/i.test(e.type || ''); }).length;
    var r = sub.ratio === 'auto' || !sub.ratio ? (sa > 2 ? 2 : 1) : (sub.ratio === '2:1' ? 2 : 1);
    return G != null && K != null ? (r * G + K) / (r + 1) : (G != null ? G : K);
  }
  /* Stufe: 0 = sicher (bis 2,0), 1 = mittel (bis 3,0), 2 = Förderbedarf (ab 3,0), null = keine Note */
  function level(subject) { var g = gradeOf(subject); return { g: g, lv: g == null ? null : g <= 2.0 ? 0 : g <= 3.0 ? 1 : 2 }; }
  function sizes(subject) { var L = level(subject); return { g: L.g, lv: L.lv, test: L.lv == null ? 15 : [10, 15, 25][L.lv], practice: L.lv == null ? 10 : [6, 10, 14][L.lv], wdh: L.lv == null ? 5 : [4, 5, 7][L.lv] }; }
  function weight(exId, it) { var st = stats[skey(exId, it)]; if (!st) return 1; return Math.max(0.15, 1 + st.w * 1.5 - st.r * 0.6); }
  function gtxt(g) { return g == null ? '' : g.toFixed(2).replace('.', ','); }
  function pts(it) { return it.k === 'wr' ? Math.min(3, it.w.keys.length) : 1; }

  function build(ex, cfg, only) {
    var P = pool(ex), allUnits = !(ex.units && ex.units.length) || cfg.units.length === ex.units.length;
    function inUnits(it) { return it.k === 'wr' ? (it.u ? cfg.units.indexOf(it.u) >= 0 : allUnits) : (!it.u || !(ex.units && ex.units.length) || cfg.units.indexOf(it.u) >= 0); }
    var pools = {};
    ['mc', 'tf', 'gap', 'wr', 'voc'].forEach(function (t) {
      pools[t] = P[t].filter(function (it) { return cfg.types.indexOf(t) >= 0 && inUnits(it) && (!cfg.only || cfg.only(it)) && (!only || only.indexOf(it.k + ':' + it.id) >= 0); })
        .map(function (it) { return { it: it, s: Math.random() * weight(ex.id, it) }; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.it; });
    });
    var out = [], usedSrc = {}, order = shuffle(cfg.types.slice()), n = only ? 1e9 : cfg.n, guard = 0, maxWr = only ? 1e9 : Math.max(1, Math.round(n * 0.2));
    while (out.length < n && guard++ < 1000) {
      var added = false;
      for (var i = 0; i < order.length && out.length < n; i++) {
        var p = pools[order[i]];
        if (order[i] === 'wr' && out.filter(function (x) { return x.k === 'wr'; }).length >= maxWr) continue;
        while (p && p.length) { var it = p.shift(); if (it.src != null && usedSrc[it.src]) continue; if (it.k === 'gap') { var ga = 'a:' + norm(it.ans); if (usedSrc[ga]) continue; usedSrc[ga] = 1; } if (it.src != null) usedSrc[it.src] = 1; out.push(it); added = true; break; }
      }
      if (!added) break;
    }
    /* Reihenfolge wie in einer Probe: erst Ankreuzen, dann Lücken, dann Schreiben */
    var rank = { tf: 0, mc: 1, voc: 2, gap: 2, wr: 3 };
    return out.sort(function (a, b) { return rank[a.k] - rank[b.k]; });
  }
  var TYPES = ['mc', 'tf', 'gap', 'voc', 'wr'], tn = { mc: 'Ankreuzen', tf: 'Wahr / Falsch', gap: 'Lückentext', voc: 'Vokabeln tippen', wr: 'Tippen' };
  function noteOf(p) { return p >= 0.85 ? 1 : p >= 0.70 ? 2 : p >= 0.55 ? 3 : p >= 0.40 ? 4 : p >= 0.20 ? 5 : 6; }

  function adaptTip(subject, kind) {
    var SZ = sizes(subject), n = kind === 'test' ? SZ.test : SZ.practice;
    var base = SZ.lv == null ? 'Trag in „Noten“ deine Noten ein, dann passt sich die Länge an. ' : 'Angepasst an deinen Schnitt ' + gtxt(SZ.g) + ' in ' + subject + ': ' + n + ' Aufgaben' + (kind === 'test' ? ' vorgeschlagen' : '') + '. ';
    return '<p class="pt-tip" style="margin-top:-4px">' + esc(base) + 'Aufgaben, die du schon falsch hattest, kommen öfter dran.</p>';
  }

  /* ---------- Ansichten ---------- */
  var S = null; /* {ex, cfg, items, ans, done, res} */
  var keepScroll = function (fn) { var s = ov.querySelector('.pt-s'), y = s ? s.scrollTop : 0; fn(); var n = ov.querySelector('.pt-s'); if (n) n.scrollTop = y; };
  function frame(title, body) { return '<div class="pt-s" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="pt-top"><h2>' + esc(title) + '</h2><button class="pt-x" data-a="close" aria-label="Schließen">×</button></div>' + body + '</div>'; }
  function show(html) { ov.innerHTML = html; ov.hidden = false; document.body.style.overflow = 'hidden'; var s = ov.querySelector('.pt-s'); if (s) s.scrollTop = 0; }
  function hide() { ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = ''; S = null; }

  function setup(exId) {
    var ex = findEx(exId); if (!ex) return;
    var P = pool(ex), units = ex.units || [];
    var SZ = sizes(ex.subject);
    var cfg = S && S.ex === ex && S.cfg && !S.cfg.only ? S.cfg : { units: units.map(function (u) { return u.id; }), n: SZ.test, types: TYPES.filter(function (t) { return P[t].length; }) };
    S = { ex: ex, cfg: cfg };

    var h = '<p class="pt-tip">Wie eine Probe: gemischte Aufgaben aus den Bereichen, die du auswählst. Danach bekommst du Punkte, eine geschätzte Note und die Verbesserung.</p>' + adaptTip(ex.subject, 'test');
    if (units.length) h += '<h4>Bereiche</h4><div class="pt-chips">' + units.map(function (u) { return '<button class="chip' + (cfg.units.indexOf(u.id) >= 0 ? ' on' : '') + '" data-a="unit" data-u="' + esc(u.id) + '">' + esc(u.title) + '</button>'; }).join('') +
      '<button class="chip" data-a="allu">' + (cfg.units.length === units.length ? 'Keine' : 'Alle') + '</button></div>';
    h += '<h4>Aufgabentypen</h4><div class="pt-chips">' + TYPES.filter(function (t) { return P[t].length; }).map(function (t) { return '<button class="chip' + (cfg.types.indexOf(t) >= 0 ? ' on' : '') + '" data-a="type" data-t="' + t + '">' + tn[t] + '</button>'; }).join('') + '</div>';
    h += '<h4>Länge</h4><div class="pt-chips">' + [10, 15, 25].map(function (n) { return '<button class="chip' + (cfg.n === n ? ' on' : '') + '" data-a="n" data-n="' + n + '">' + n + ' Aufgaben</button>'; }).join('') + '<button class="chip' + (cfg.n === 999 ? ' on' : '') + '" data-a="n" data-n="999">Alles</button></div>';
    var cnt = build(ex, cfg).length;
    h += '<div class="pt-row"><button class="pt-btn" data-a="start"' + (cnt ? '' : ' disabled') + '>Test starten (' + cnt + ' Aufgaben)</button></div>';
    var hh = hist[ex.id] || [];
    if (hh.length) h += '<div class="pt-hist">Bisher: ' + hh.slice(-5).map(function (r) { return r.d.slice(8, 10) + '.' + r.d.slice(5, 7) + '. Note ' + r.note + ' (' + r.p + ' %)'; }).join(' · ') + '</div>';
    keepScroll(function () { show(frame('Probetest ' + ex.subject, h)); });
    ov.hidden = false;
  }

  function qHtml(it, i, graded) {
    var r = graded ? S.res[i] : null, a = S.ans[i];
    var h = '<div class="pt-q' + (r ? (r.p === r.max ? ' ok' : ' bad') : '') + '" data-i="' + i + '"><div class="pt-qh"><span>Aufgabe ' + (i + 1) + '</span><span>' + (r ? r.p + ' / ' : '') + r_max(it) + ' P.</span></div>';
    if (it.k === 'mc') {
      h += '<div class="pt-qt">' + esc(it.q) + '</div><div class="pt-opts">' + it.o.map(function (o, j) {
        var c = (a === j ? ' sel' : '') + (graded && j === it.a ? ' right' : '');
        return '<button class="pt-opt' + c + '" data-a="mc" data-i="' + i + '" data-j="' + j + '"' + (graded ? ' disabled' : '') + '>' + esc(o) + '</button>';
      }).join('') + '</div>';
    } else if (it.k === 'tf') {
      h += '<div class="pt-qt">' + (it.q ? esc(it.q) + '<br><b>' + esc(it.ans) + '</b>' : '<b>' + esc(it.ans) + '</b>') + '</div><div class="pt-tip" style="margin:6px 0 0">Stimmt das?</div><div class="pt-tf">' +
        [true, false].map(function (v) { var c = (a === v ? ' sel' : '') + (graded && v === it.a ? ' right' : ''); return '<button class="pt-opt' + c + '" data-a="tf" data-i="' + i + '" data-v="' + v + '"' + (graded ? ' disabled' : '') + '>' + (v ? 'Wahr' : 'Falsch') + '</button>'; }).join('') + '</div>';
    } else if (it.k === 'gap') {
      h += '<div class="pt-qt">Ergänze die Lücke:<br>' + esc(it.pre) + '<input class="pt-gap" data-a="gap" data-i="' + i + '" autocomplete="off" autocapitalize="off" spellcheck="false" value="' + esc(a || '') + '"' + (graded ? ' disabled' : '') + '>' + esc(it.post) + '</div>';
    } else if (it.k === 'voc') {
      h += '<div class="pt-qt">' + esc(it.q) + '<br><input class="pt-gap" style="width:14em;margin-top:8px" data-a="gap" data-i="' + i + '" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Bedeutung" value="' + esc(a || '') + '"' + (graded ? ' disabled' : '') + '></div>';
    } else {
      h += '<div class="pt-qt">' + esc(it.w.prompt || it.w.title) + '</div><textarea data-a="wr" data-i="' + i + '"' + (graded ? ' disabled' : '') + ' autocapitalize="off" spellcheck="false" placeholder="Deine Antwort">' + esc(a || '') + '</textarea>';
    }
    if (r) h += '<div class="pt-fb">' + r.fb + '</div>';
    return h + '</div>';
  }
  function r_max(it) { return pts(it); }

  function run(items) {
    S.items = items; S.ans = items.map(function () { return null; }); S.res = null;
    var h = '<p class="pt-tip">' + items.length + ' Aufgaben · ' + items.reduce(function (s, it) { return s + pts(it); }, 0) + ' Punkte. Nimm dir Zeit wie in einer echten Probe – die Lösungen kommen erst nach dem Abgeben.</p>';
    h += items.map(function (it, i) { return qHtml(it, i, false); }).join('');
    h += '<div class="pt-row"><button class="pt-btn" data-a="submit">' + (S.practice ? 'Fertig – auswerten' : 'Abgeben') + '</button><button class="pt-btn sec" data-a="back">Abbrechen</button></div>';
    show(frame(S.custom ? S.practice : S.practice ? S.ex.subject + ': ' + S.practice : 'Probetest ' + S.ex.subject, h));
  }
  function markTask(k) {
    var box = [].slice.call(document.querySelectorAll('input[data-k]')).filter(function (x) { return x.dataset.k === k; })[0];
    if (box && !box.checked) box.click();
  }

  function grade() {
    var tot = 0, max = 0;
    S.res = S.items.map(function (it, i) {
      var a = S.ans[i], m = pts(it), p = 0, fb = '';
      if (it.k === 'mc') { p = a === it.a ? 1 : 0; fb = p ? '<b>Richtig.</b>' : '<b>Richtig wäre: ' + esc(it.o[it.a]) + '</b>'; if (it.why) fb += esc(it.why); }
      else if (it.k === 'tf') { p = a === it.a ? 1 : 0; fb = '<b>' + (p ? 'Richtig – ' : 'Falsch – ') + 'die Aussage ist ' + (it.a ? 'wahr' : 'falsch') + '.</b>' + (!it.a && it.right ? 'Richtig ist: ' + esc(it.right) + '. ' : '') + esc(it.why || ''); }
      else if (it.k === 'voc') { var na = norm(a), nb = norm(String(a || '').trim().replace(/^(to|the|a|an|der|die|das|ein|eine)\s+/i, '')); p = !!na && alts(it.ans).some(function (x) { var nx = norm(x); return nx === na || nx === nb; }) ? 1 : 0; fb = p ? '<b>Richtig.</b>' + (norm(it.ans) !== na ? 'Komplett: ' + esc(it.ans) : '') : '<b>Richtig wäre: ' + esc(it.ans) + '</b>'; }
      else if (it.k === 'gap') { var ok = [it.ans].concat(it.alt || []).some(function (x) { return norm(x) === norm(a); }); p = ok ? 1 : 0; fb = (p ? '<b>Richtig.</b>' : '<b>Richtig wäre: ' + esc(it.ans) + '</b>') + esc(it.why || ''); }
      else {
        var w = it.w, txt = String(a || '');
        var nt = w.eq ? norm(txt) : w.code ? txt.toLowerCase().replace(/\s+/g, '') : txt.toLowerCase();
        var hits = w.keys.filter(function (g) { return (Array.isArray(g) ? g : [g]).some(function (k) { k = String(k).toLowerCase(); return w.code ? nt.indexOf(k.replace(/\s+/g, '')) >= 0 : nt.indexOf(k) >= 0; }); }).length;
        p = Math.round(hits / w.keys.length * m * 2) / 2; fb = '<b>' + hits + ' von ' + w.keys.length + ' wichtigen Punkten erkannt.</b>Musterlösung: ' + esc(w.model || '');
      }
      tot += p; max += m; return { p: p, max: m, fb: fb };
    });
    if (S.ex && S.ex.id !== 'custom') { var now = Date.now(); S.items.forEach(function (it, i) { var k = skey(S.ex.id, it), st = stats[k] || { r: 0, w: 0 }; if (S.res[i].p >= S.res[i].max) st.r++; else st.w++; st.t = now; stats[k] = st; }); saveStats(); }
    var pc = max ? tot / max : 0, note = noteOf(pc), d = new Date(), ds = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    S.sum = { tot: tot, max: max, pc: Math.round(pc * 100), note: note };
    if (!S.practice) (hist[S.ex.id] = hist[S.ex.id] || []).push({ d: ds, p: S.sum.pc, note: note, n: S.items.length }); if (hist[S.ex.id]) hist[S.ex.id] = hist[S.ex.id].slice(-20); saveHist();
    var wrong = S.items.filter(function (_, i) { return S.res[i].p < S.res[i].max; }).length;
    var passed = pc >= 0.8, tkMsg = '';
    if (S.tk) { tkMsg = passed ? '<div class="pt-tip" style="margin:6px 0 0;color:#2e9b5b">Ab 80 % geschafft – die Aufgabe im Lernplan ist abgehakt.</div>' : '<div class="pt-tip" style="margin:6px 0 0">Für das Häkchen im Lernplan brauchst du 80 %. Übe die Fehler und versuch es nochmal.</div>'; if (passed) markTask(S.tk); }
    var h = '<div class="pt-res"><div class="pt-note">' + (S.practice ? S.sum.pc + '<span style="font-size:24px"> %</span>' : note) + '</div><div><b>' + fmt(tot) + ' von ' + max + ' Punkten (' + S.sum.pc + ' %)</b>' + (S.practice ? '' : '<div class="pt-tip" style="margin:4px 0 0">Geschätzte Note nach einem üblichen Schlüssel: 1 ab 85 %, 2 ab 70 %, 3 ab 55 %, 4 ab 40 %, 5 ab 20 %. Deine Lehrkraft kann anders bewerten.</div>') + tkMsg + '</div></div>';
    h += '<div class="pt-row">' + (wrong ? '<button class="pt-btn" data-a="again">Fehler nochmal üben (' + wrong + ')</button>' : '') + '<button class="pt-btn sec" data-a="back">' + (S.practice ? 'Fertig' : 'Neuer Test') + '</button>' + (canAsk && !S.custom ? '<button class="pt-btn sec" data-a="ai">Persönliches Feedback</button>' : '') + '</div><div id="ptAi"></div>' + (S.after || '');
    h += '<h4>Verbesserung</h4>' + S.items.map(function (it, i) { return qHtml(it, i, true); }).join('');
    show(frame((S.custom ? S.practice + ' – Ergebnis' : S.practice ? 'Ergebnis: ' + S.practice : 'Ergebnis ' + S.ex.subject), h));
  }
  function fmt(x) { return String(x).replace('.', ','); }

  /* ---------- Persönliches Feedback (nur in der Claude-App, wenn erlaubt) ---------- */
  var sample = null, canAsk = false;
  (async function () { try { if (window.claude && typeof claude.use === 'function') { sample = await claude.use('sample'); canAsk = !!sample; } } catch (e) {} })();
  function plain(s) { return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
  async function feedback(btn) {
    var box = document.getElementById('ptAi'); if (!box || !sample) return;
    btn.disabled = true; box.className = 'pt-ai'; box.textContent = 'Claude schaut sich deinen Test an …';
    var ex = S.ex, lines = S.items.map(function (it, i) {
      var r = S.res[i], a = S.ans[i], t;
      if (it.k === 'mc') t = 'Ankreuzen: ' + it.q + ' | gewählt: ' + (a == null ? '–' : it.o[a]) + ' | richtig: ' + it.o[it.a];
      else if (it.k === 'tf') t = 'Wahr/Falsch: ' + (it.q ? it.q + ' → ' : '') + it.ans + ' | gewählt: ' + (a == null ? '–' : a ? 'wahr' : 'falsch') + ' | richtig: ' + (it.a ? 'wahr' : 'falsch');
      else if (it.k === 'gap') t = 'Lücke: ' + it.pre + '___' + it.post + ' | eingetragen: ' + (a || '–') + ' | richtig: ' + it.ans;
      else t = 'Tippen: ' + (it.w.prompt || it.w.title) + ' | Antwort: ' + (a || '–') + ' | Musterlösung: ' + (it.w.model || '');
      var u = it.u && (ex.units || []).find(function (x) { return x.id === it.u; });
      return (i + 1) + '. [' + (u ? u.title : 'allgemein') + '] ' + t + ' | Punkte ' + r.p + '/' + r.max;
    }).join('\n');
    var prompt = 'Du bist eine freundliche, ehrliche Lernhilfe für eine Schülerin oder einen Schüler der 9. Klasse am bayerischen Gymnasium. ' +
      'Fach: ' + ex.subject + ' (' + (ex.type || '') + ' am ' + ex.date + ').' + (gradeOf(ex.subject) != null ? ' Bisheriger Notenschnitt in dem Fach: ' + gtxt(gradeOf(ex.subject)) + ' – passe Ton und Tiefe daran an (bei schwächerem Schnitt Grundlagen einfacher erklären, bei gutem Schnitt auf Feinheiten achten).' : '') + ' Ergebnis des Probetests: ' + fmt(S.sum.tot) + ' von ' + S.sum.max + ' Punkten, ' + S.sum.pc + ' %, geschätzte Note ' + S.sum.note + '.\n\n' +
      'Aufgaben mit Antworten:\n' + lines + '\n\n' +
      'Schreib ein kurzes, persönliches Feedback auf Deutsch (du-Form, höchstens 180 Wörter, keine Überschriften mit #, keine Tabellen):\n' +
      '1) Was schon gut sitzt (konkret, 1–2 Sätze).\n2) Die 2–3 wichtigsten Lücken: Was genau wurde verwechselt oder fehlt? Erkläre jeweils den richtigen Zusammenhang in einem Satz.\n' +
      '3) Bei Tipp-Antworten: Sag, ob sie inhaltlich stimmen, auch wenn Wörter anders sind.\n4) Ein konkreter Tipp, was als Nächstes geübt werden sollte (nenne die Bereiche).\n' +
      'Halte dich nur an die Inhalte oben, erfinde keinen zusätzlichen Stoff. Ermutigend, aber ehrlich.';
    try {
      var r = await sample(prompt, { modelTier: 'default', onText: function (o) { box.textContent = o.text; } });
      box.textContent = r && r.text ? r.text : box.textContent;
    } catch (e) {
      box.textContent = e && e.code === 'not_granted' ? 'Persönliches Feedback ist hier nicht freigegeben.' : e && e.code === 'rate_limited' ? 'Gerade zu viele Anfragen – versuch es in ein paar Minuten nochmal.' : 'Das Feedback hat gerade nicht geklappt. Versuch es später nochmal.';
      if (e && e.code === 'not_granted') canAsk = false;
    }
    btn.disabled = false;
  }

  /* ---------- Bedienung ---------- */
  ov.addEventListener('click', function (e) {
    if (e.target === ov) return hide();
    var b = e.target.closest('[data-a]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'TEXTAREA') return;
    var a = b.dataset.a, cfg = S && S.cfg, ex = S && S.ex;
    if (a === 'close') return hide();
    if (a === 'unit') { var i = cfg.units.indexOf(b.dataset.u); if (i >= 0) cfg.units.splice(i, 1); else cfg.units.push(b.dataset.u); return setup(ex.id); }
    if (a === 'allu') { cfg.units = cfg.units.length === ex.units.length ? [] : ex.units.map(function (u) { return u.id; }); return setup(ex.id); }
    if (a === 'type') { var t = cfg.types.indexOf(b.dataset.t); if (t >= 0) { if (cfg.types.length > 1) cfg.types.splice(t, 1); } else cfg.types.push(b.dataset.t); return setup(ex.id); }
    if (a === 'n') { cfg.n = +b.dataset.n; return setup(ex.id); }
    if (a === 'start') return run(build(ex, cfg));
    if (a === 'back') { if (S.practice) return hide(); return setup(ex.id); }
    if (a === 'pick') return pickRun(b);
    if (a === 'again') { var keep = S.items.filter(function (_, i) { return S.res[i].p < S.res[i].max; }); return run(shuffle(keep)); }
    if (a === 'ai') return feedback(b);
    if (a === 'submit') {
      var open = S.ans.filter(function (x) { return x == null || x === ''; }).length;
      if (open && !b.dataset.sure) { b.dataset.sure = '1'; b.textContent = open + ' Aufgabe' + (open > 1 ? 'n sind' : ' ist') + ' noch leer – trotzdem abgeben?'; return; }
      return grade();
    }
    if (a === 'mc' || a === 'tf') {
      var ix = +b.dataset.i; S.ans[ix] = a === 'mc' ? +b.dataset.j : b.dataset.v === 'true';
      b.parentNode.querySelectorAll('.pt-opt').forEach(function (x) { x.classList.toggle('sel', x === b); });
    }
  });
  ov.addEventListener('input', function (e) { var t = e.target; if (t.dataset && (t.dataset.a === 'gap' || t.dataset.a === 'wr') && S && S.ans) S.ans[+t.dataset.i] = t.value; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ov.hidden) hide(); });

  /* ---------- Formeln mit der Tastatur: ^ für hoch, Zahl für tief, -> für Pfeil; Vorschau beim Tippen ---------- */
  var pvCss = document.createElement('style');
  pvCss.textContent = '.kb-tip{font-size:13px;color:var(--soft);margin:6px 0 0}.kb-tip code{background:var(--card);border:1px solid var(--line);border-radius:5px;padding:0 5px;font-size:12px}' +
    '.kb-pv{font-size:18px;margin:8px 0 0;min-height:1.4em}.kb-pv:empty{display:none}.kb-pv sub,.kb-pv sup{font-size:.72em;line-height:0;position:relative;vertical-align:baseline}.kb-pv sub{bottom:-.3em}.kb-pv sup{top:-.52em}';
  document.head.appendChild(pvCss);
  function pretty(t) {
    var h = esc(t);
    h = h.replace(/\s*(-&gt;|=&gt;)\s*/g, ' → ').replace(/\*/g, '·');
    h = h.replace(/\^\(([^)]*)\)/g, '<sup>$1</sup>').replace(/\^([0-9]*[+\-−]?)/g, function (m, g) { return g ? '<sup>' + g.replace('-', '−') + '</sup>' : m; });
    h = h.replace(/_([0-9]+)/g, '<sub>$1</sub>');
    h = h.replace(/([A-Za-z\)\]])([0-9]+)(?![^<]*<\/sup>)/g, '$1<sub>$2</sub>');
    h = h.replace(/([A-Za-z\]](?:<sub>[0-9]+<\/sub>)?)([+\-])(?=\s|$|\))/g, function (m, a, c) { return a + '<sup>' + (c === '-' ? '−' : '+') + '</sup>'; });
    return h;
  }
  function looksLikeFormula(t) { return /\^|->|=>|[A-Za-z\)][0-9]|[A-Z][a-z]?[+\-](\s|$)/.test(t); }
  function attachPreview(el, ctxText) {
    if (el.dataset.kb) return; el.dataset.kb = '1';
    var formulaTask = /gleichung|formel|reaktion|ion|ladung|[0-9]|→|⁺|⁻|²|³|₂|₃|\^/i.test(ctxText || '');
    var tip = document.createElement('div'); tip.className = 'kb-tip';
    tip.innerHTML = 'Formeln mit der Tastatur: hoch mit <code>^</code> (z. B. <code>x^2</code>, <code>Al^3+</code>), tief einfach die Zahl (<code>H2O</code>), Pfeil <code>-&gt;</code>';
    var pv = document.createElement('div'); pv.className = 'kb-pv';
    el.parentNode.insertBefore(pv, el.nextSibling); el.parentNode.insertBefore(tip, pv.nextSibling);
    tip.hidden = !formulaTask;
    var upd = function () { var v = el.value || ''; pv.innerHTML = looksLikeFormula(v) ? 'So sieht es aus: ' + pretty(v) : ''; if (looksLikeFormula(v)) tip.hidden = false; };
    el.addEventListener('input', upd); upd();
  }
  function scanInputs() {
    var a = document.querySelector('#modal textarea#ans:not(.code)');
    if (a) { var sh = a.closest('.sheet'), tip = sh && sh.querySelector('.tip'); attachPreview(a, tip ? tip.textContent : ''); }
    document.querySelectorAll('#pt textarea[data-a="wr"], #pt input.pt-gap').forEach(function (el) {
      if (el.disabled) return; var q = el.closest('.pt-q'); attachPreview(el, q ? q.textContent : '');
    });
  }
  var kbq = 0; new MutationObserver(function () { if (kbq) return; kbq = requestAnimationFrame(function () { kbq = 0; scanInputs(); }); }).observe(document.body, { childList: true, subtree: true });

  /* ---------- Schnittstelle für andere Teile der App (z. B. Wiederholen) ---------- */
  window.PT = { sizes: sizes, run: function (title, items, afterHtml) { S = { ex: { id: 'custom', subject: title, units: [] }, cfg: null, practice: title, custom: true, after: afterHtml || '' }; run(items); }, esc: esc };

  /* ---------- Lernplan: beim Starten die Übungsform wählen ---------- */
  var CH = null; /* {btn, ex, unit, tk, kind} */
  function choices(ex, kind, unit) {
    var P = pool(ex), inU = function (it) { return !unit || it.u === unit; }, out = [];
    var cnt = function (t, f) { return P[t].filter(function (it) { return inU(it) && (!f || f(it)); }).length; };
    if (kind === 'cards') {
      out.push({ id: 'orig', t: 'Karteikarten', d: 'Klassisch umdrehen, mit Wiederholung' });
      if (P.voc.length >= 3) out.push({ id: 'voc', t: 'Vokabeln tippen', d: 'Du siehst eine Seite und tippst die Bedeutung' });
      if (cnt('mc', function (x) { return x.card; }) >= 3) out.push({ id: 'cmc', t: 'Ankreuzen', d: 'Die richtige Bedeutung aus vier auswählen' });
      if (cnt('tf', function (x) { return x.card; }) >= 3) out.push({ id: 'ctf', t: 'Wahr / Falsch', d: 'Passt die Bedeutung?' });
      if (out.length > 2) out.push({ id: 'cmix', t: 'Gemischt', d: 'Alles durcheinander' });
    } else if (kind === 'learn') {
      out.push({ id: 'orig', t: 'Lerneinheit + Test', d: 'Merksätze lesen, dann kurzer Test' });
      if (new Set(P.gap.filter(inU).map(function (x) { return norm(x.ans); })).size >= 3) out.push({ id: 'gap', t: 'Lückentext', d: 'Fehlende Begriffe ergänzen' });
      if (cnt('tf', function (x) { return !x.card; }) >= 3) out.push({ id: 'tf', t: 'Wahr / Falsch', d: 'Stimmt die Aussage?' });
      if (out.length > 1) out.push({ id: 'mix', t: 'Gemischt', d: 'Ankreuzen, Wahr/Falsch und Lückentext' });
    } else if (kind === 'quiz') {
      out.push({ id: 'orig', t: 'Quiz', d: 'Ankreuzen wie gewohnt' });
      out.push({ id: 'all', t: 'Gemischter Test', d: 'Alle Aufgabentypen, ' + (ex.units && ex.units.length ? 'alle Bereiche' : 'alles') });
    }
    return out;
  }
  function chooser(btn) {
    var kind = btn.hasAttribute('data-cards') ? 'cards' : btn.hasAttribute('data-learn') ? 'learn' : 'quiz';
    var id = btn.getAttribute('data-' + kind), ex = findEx(id); if (!ex) return false;
    var unit = btn.getAttribute('data-unit') || '', ch = choices(ex, kind, unit); if (ch.length < 2) return false;
    CH = { btn: btn, ex: ex, unit: unit, tk: btn.getAttribute('data-tk') || '', kind: kind };
    var u = unit && (ex.units || []).find(function (x) { return x.id === unit; });
    var h = '<p class="pt-tip">' + esc(u ? u.title : kind === 'cards' ? 'Karteikarten' : 'Abschluss') + ' – wie willst du heute üben? Ab 80 % wird die Aufgabe abgehakt.</p>' + adaptTip(ex.subject, 'practice') + '<div class="pt-opts">' +
      ch.map(function (c) { return '<button class="pt-opt" data-a="pick" data-c="' + c.id + '"><b>' + esc(c.t) + '</b><br><span class="pt-tip" style="margin:0">' + esc(c.d) + '</span></button>'; }).join('') + '</div>';
    S = { ex: ex, cfg: null };
    show(frame(ex.subject + ': Übungsform', h));
    return true;
  }
  function pickRun(b) {
    var c = b.dataset.c, ch = CH; if (!ch) return;
    if (c === 'orig') { hide(); ch.btn.dataset.ptGo = '1'; ch.btn.click(); delete ch.btn.dataset.ptGo; return; }
    var units = ch.unit ? [ch.unit] : (ch.ex.units || []).map(function (u) { return u.id; });
    var cfg = { units: units, n: sizes(ch.ex.subject).practice, types: [] }, name = '';
    if (c === 'voc') { cfg.types = ['voc']; name = 'Vokabeln tippen'; }
    else if (c === 'cmc') { cfg.types = ['mc']; cfg.only = function (x) { return x.card; }; name = 'Ankreuzen'; }
    else if (c === 'ctf') { cfg.types = ['tf']; cfg.only = function (x) { return x.card; }; name = 'Wahr / Falsch'; }
    else if (c === 'cmix') { cfg.types = ['voc', 'mc', 'tf']; cfg.only = function (x) { return x.card || x.k === 'voc'; }; name = 'Vokabeln gemischt'; }
    else if (c === 'gap') { cfg.types = ['gap']; name = 'Lückentext'; }
    else if (c === 'tf') { cfg.types = ['tf']; cfg.only = function (x) { return !x.card; }; name = 'Wahr / Falsch'; }
    else if (c === 'mix') { cfg.types = ['mc', 'tf', 'gap']; cfg.only = function (x) { return !x.card; }; name = 'Gemischt'; }
    else if (c === 'all') { cfg.types = TYPES.slice(); cfg.n = sizes(ch.ex.subject).test; name = 'Gemischter Test'; }
    S = { ex: ch.ex, cfg: cfg, tk: ch.tk, practice: name };
    var items = build(ch.ex, cfg); if (!items.length) return;
    run(items);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.task button.go[data-learn], .task button.go[data-quiz], .task button.go[data-cards]');
    if (!b || b.dataset.ptGo || ov.contains(b)) return;
    if (chooser(b)) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }
  }, true);

  /* Knopf „Probetest“ in jeder Prüfungskarte */
  function addButtons() {
    document.querySelectorAll('.exam .body').forEach(function (body) {
      if (body.querySelector('.pt-open')) return;
      var q = body.querySelector('[data-quiz]'), id = q && q.getAttribute('data-quiz');
      if (!id) { var any = body.querySelector('[data-learn],[data-write]'); id = any && (any.getAttribute('data-learn') || any.getAttribute('data-write')); }
      var ex = id && findEx(id); if (!ex || exams().indexOf(ex) < 0) return;
      var row = document.createElement('div'); row.className = 'prac pt-open';
      var btn = document.createElement('button'); btn.className = 'btn main'; btn.type = 'button'; btn.textContent = 'Probetest mit Note';
      btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); S = null; setup(ex.id); });
      row.appendChild(btn);
      var anchor = q ? q.closest('.prac') : null;
      if (anchor && anchor.parentNode === body) body.insertBefore(row, anchor.nextSibling); else body.appendChild(row);
    });
  }
  var t0 = 0; addButtons(); new MutationObserver(function () { if (t0) return; t0 = requestAnimationFrame(function () { t0 = 0; addButtons(); }); }).observe(document.body, { childList: true, subtree: true });
})();
