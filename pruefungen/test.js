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
    "#pt .pt-ai{white-space:pre-wrap;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-top:10px;font-size:15px;line-height:1.5}";
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
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
    return s.replace(/[⁺₊]/g, '+').replace(/[⁻₋−–]/g, '-').replace(/\s*(→|=>|->)\s*/g, '>').replace(/[\s.,;:!?„“"'()]/g, '');
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
    /* ausdrücklich eingetragene Aufgaben (falls vorhanden) */
    (ex.tf || []).forEach(function (t, i) { tf.push({ k: 'tf', id: 'T' + i, u: t.u, q: '', ans: t.s, a: !!t.a, right: '', why: t.why }); });
    (ex.gaps || []).forEach(function (g, i) {
      var m = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(g.t || ''); if (!m) return;
      gap.push({ k: 'gap', id: 'G' + i, u: g.u, pre: g.t.slice(0, m.index), post: g.t.slice(m.index + m[0].length), ans: m[1], alt: m[2] ? m[2].split('/') : [] });
    });
    (ex.writes || []).forEach(function (w, i) { if (w.keys && w.keys.length) wr.push({ k: 'wr', id: 'w' + i, u: w.u, w: w }); });
    return { mc: mc, tf: tf, gap: gap, wr: wr };
  }
  function pts(it) { return it.k === 'wr' ? Math.min(3, it.w.keys.length) : 1; }

  function build(ex, cfg, only) {
    var P = pool(ex), allUnits = !(ex.units && ex.units.length) || cfg.units.length === ex.units.length;
    function inUnits(it) { return it.k === 'wr' ? (it.u ? cfg.units.indexOf(it.u) >= 0 : allUnits) : (!it.u || !(ex.units && ex.units.length) || cfg.units.indexOf(it.u) >= 0); }
    var pools = {};
    ['mc', 'tf', 'gap', 'wr'].forEach(function (t) {
      pools[t] = shuffle(P[t].filter(function (it) { return cfg.types.indexOf(t) >= 0 && inUnits(it) && (!only || only.indexOf(it.k + ':' + it.id) >= 0); }));
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
    var rank = { tf: 0, mc: 1, gap: 2, wr: 3 };
    return out.sort(function (a, b) { return rank[a.k] - rank[b.k]; });
  }
  function noteOf(p) { return p >= 0.85 ? 1 : p >= 0.70 ? 2 : p >= 0.55 ? 3 : p >= 0.40 ? 4 : p >= 0.20 ? 5 : 6; }

  /* ---------- Ansichten ---------- */
  var S = null; /* {ex, cfg, items, ans, done, res} */
  var keepScroll = function (fn) { var s = ov.querySelector('.pt-s'), y = s ? s.scrollTop : 0; fn(); var n = ov.querySelector('.pt-s'); if (n) n.scrollTop = y; };
  function frame(title, body) { return '<div class="pt-s" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="pt-top"><h2>' + esc(title) + '</h2><button class="pt-x" data-a="close" aria-label="Schließen">×</button></div>' + body + '</div>'; }
  function show(html) { ov.innerHTML = html; ov.hidden = false; document.body.style.overflow = 'hidden'; var s = ov.querySelector('.pt-s'); if (s) s.scrollTop = 0; }
  function hide() { ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = ''; S = null; }

  function setup(exId) {
    var ex = findEx(exId); if (!ex) return;
    var P = pool(ex), units = ex.units || [];
    var cfg = S && S.ex === ex && S.cfg ? S.cfg : { units: units.map(function (u) { return u.id; }), n: 15, types: ['mc', 'tf', 'gap', 'wr'].filter(function (t) { return P[t].length; }) };
    S = { ex: ex, cfg: cfg };
    var tn = { mc: 'Ankreuzen', tf: 'Wahr / Falsch', gap: 'Lückentext', wr: 'Tippen' };
    var h = '<p class="pt-tip">Wie eine Probe: gemischte Aufgaben aus den Bereichen, die du auswählst. Danach bekommst du Punkte, eine geschätzte Note und die Verbesserung.</p>';
    if (units.length) h += '<h4>Bereiche</h4><div class="pt-chips">' + units.map(function (u) { return '<button class="chip' + (cfg.units.indexOf(u.id) >= 0 ? ' on' : '') + '" data-a="unit" data-u="' + esc(u.id) + '">' + esc(u.title) + '</button>'; }).join('') +
      '<button class="chip" data-a="allu">' + (cfg.units.length === units.length ? 'Keine' : 'Alle') + '</button></div>';
    h += '<h4>Aufgabentypen</h4><div class="pt-chips">' + ['mc', 'tf', 'gap', 'wr'].filter(function (t) { return P[t].length; }).map(function (t) { return '<button class="chip' + (cfg.types.indexOf(t) >= 0 ? ' on' : '') + '" data-a="type" data-t="' + t + '">' + tn[t] + '</button>'; }).join('') + '</div>';
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
    h += '<div class="pt-row"><button class="pt-btn" data-a="submit">Abgeben</button><button class="pt-btn sec" data-a="back">Abbrechen</button></div>';
    show(frame('Probetest ' + S.ex.subject, h));
  }

  function grade() {
    var tot = 0, max = 0;
    S.res = S.items.map(function (it, i) {
      var a = S.ans[i], m = pts(it), p = 0, fb = '';
      if (it.k === 'mc') { p = a === it.a ? 1 : 0; fb = p ? '<b>Richtig.</b>' : '<b>Richtig wäre: ' + esc(it.o[it.a]) + '</b>'; if (it.why) fb += esc(it.why); }
      else if (it.k === 'tf') { p = a === it.a ? 1 : 0; fb = '<b>' + (p ? 'Richtig – ' : 'Falsch – ') + 'die Aussage ist ' + (it.a ? 'wahr' : 'falsch') + '.</b>' + (!it.a && it.right ? 'Richtig ist: ' + esc(it.right) + '. ' : '') + esc(it.why || ''); }
      else if (it.k === 'gap') { var ok = [it.ans].concat(it.alt || []).some(function (x) { return norm(x) === norm(a); }); p = ok ? 1 : 0; fb = p ? '<b>Richtig.</b>' : '<b>Richtig wäre: ' + esc(it.ans) + '</b>'; }
      else {
        var w = it.w, txt = String(a || '');
        var nt = w.eq ? norm(txt) : w.code ? txt.toLowerCase().replace(/\s+/g, '') : txt.toLowerCase();
        var hits = w.keys.filter(function (g) { return (Array.isArray(g) ? g : [g]).some(function (k) { k = String(k).toLowerCase(); return w.code ? nt.indexOf(k.replace(/\s+/g, '')) >= 0 : nt.indexOf(k) >= 0; }); }).length;
        p = Math.round(hits / w.keys.length * m * 2) / 2; fb = '<b>' + hits + ' von ' + w.keys.length + ' wichtigen Punkten erkannt.</b>Musterlösung: ' + esc(w.model || '');
      }
      tot += p; max += m; return { p: p, max: m, fb: fb };
    });
    var pc = max ? tot / max : 0, note = noteOf(pc), d = new Date(), ds = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    S.sum = { tot: tot, max: max, pc: Math.round(pc * 100), note: note };
    (hist[S.ex.id] = hist[S.ex.id] || []).push({ d: ds, p: S.sum.pc, note: note, n: S.items.length }); hist[S.ex.id] = hist[S.ex.id].slice(-20); saveHist();
    var wrong = S.items.filter(function (_, i) { return S.res[i].p < S.res[i].max; }).length;
    var h = '<div class="pt-res"><div class="pt-note">' + note + '</div><div><b>' + fmt(tot) + ' von ' + max + ' Punkten (' + S.sum.pc + ' %)</b><div class="pt-tip" style="margin:4px 0 0">Geschätzte Note nach einem üblichen Schlüssel: 1 ab 85 %, 2 ab 70 %, 3 ab 55 %, 4 ab 40 %, 5 ab 20 %. Deine Lehrkraft kann anders bewerten.</div></div></div>';
    h += '<div class="pt-row">' + (wrong ? '<button class="pt-btn" data-a="again">Fehler nochmal üben (' + wrong + ')</button>' : '') + '<button class="pt-btn sec" data-a="back">Neuer Test</button>' + (canAsk ? '<button class="pt-btn sec" data-a="ai">Persönliches Feedback</button>' : '') + '</div><div id="ptAi"></div>';
    h += '<h4>Verbesserung</h4>' + S.items.map(function (it, i) { return qHtml(it, i, true); }).join('');
    show(frame('Ergebnis ' + S.ex.subject, h));
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
      'Fach: ' + ex.subject + ' (' + (ex.type || '') + ' am ' + ex.date + '). Ergebnis des Probetests: ' + fmt(S.sum.tot) + ' von ' + S.sum.max + ' Punkten, ' + S.sum.pc + ' %, geschätzte Note ' + S.sum.note + '.\n\n' +
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
    if (a === 'back') return setup(ex.id);
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
