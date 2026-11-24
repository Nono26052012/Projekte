/* „Frag die KI“: Chat zu einem Fach – kennt den ganzen Stoff des Fachs aus der App */
(function () {
  var DATA = {}; try { DATA = JSON.parse(document.getElementById('app-data').textContent); } catch (e) {}
  var sample = null, ready = false;
  (async function () { try { if (window.claude && typeof claude.use === 'function') sample = await claude.use('sample'); } catch (e) {} ready = true; paintBtns(); })();
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function subjects() {
    var s = {}; (DATA.exams || []).forEach(function (e) { if (e.subject) s[e.subject] = 1; }); (DATA.lessons || []).forEach(function (l) { if (l.subject) s[l.subject] = 1; });
    (DATA.practice || []).forEach(function (p) { if (p.subject) s[p.subject] = 1; });
    var pr = null; try { pr = JSON.parse(localStorage.getItem('klasse-prefs') || 'null'); } catch (e) {}
    var mine = pr && { eth: 'Ethik', rk: 'Kath. Religionslehre', ev: 'Evang. Religionslehre' }[pr.rel];
    return Object.keys(s).filter(function (x) { return !mine || !/^(Ethik|Kath\. Religionslehre|Evang\. Religionslehre)$/.test(x) || x === mine; }).sort(function (a, b) { return a.localeCompare(b, 'de'); });
  }
  function hasStuff(sub) { return (DATA.exams || []).some(function (e) { return e.subject === sub && ((e.units && e.units.length) || (e.quiz && e.quiz.length) || (e.topics && e.topics.length) || (e.cards && e.cards.length)); }) || (DATA.lessons || []).some(function (l) { return l.subject === sub; }) || (DATA.practice || []).some(function (p) { return p.subject === sub; }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  /* ---------- Den ganzen Stoff eines Fachs als Text ---------- */
  var ctxCache = {};
  function context(sub) {
    if (ctxCache[sub]) return ctxCache[sub];
    var out = [], t = today();
    (DATA.exams || []).filter(function (e) { return e.subject === sub; }).sort(function (a, b) { return (b.date >= t) - (a.date >= t) || (a.date < b.date ? -1 : 1); }).forEach(function (e) {
      var s = ['## ' + (e.type || 'Prüfung') + ' am ' + e.date + (e.date < t ? ' (vorbei)' : '') + (e.teacher ? ' bei ' + e.teacher : '')];
      if (e.topics && e.topics.length) s.push('Themen: ' + e.topics.map(function (x) { return typeof x === 'string' ? x : (x.t || x.title || JSON.stringify(x)); }).join('; '));
      (e.units || []).forEach(function (u) { s.push('### ' + u.title); (u.learn || []).forEach(function (l) { s.push('- ' + l); }); });
      if (e.quiz && e.quiz.length) { s.push('### Übungsfragen'); e.quiz.forEach(function (q) { if (q && q.o) s.push('- ' + q.q + ' → ' + q.o[q.a] + (q.why ? ' (' + q.why + ')' : '')); }); }
      if (e.writes && e.writes.length) { s.push('### Tipp-Aufgaben'); e.writes.forEach(function (w) { s.push('- ' + (w.prompt || w.title || '') + (w.model ? ' | Musterlösung: ' + w.model : '')); }); }
      if (e.draws && e.draws.length) s.push('Zeichenaufgaben: ' + e.draws.map(function (d) { return d.title || d.prompt || ''; }).join('; '));
      if (e.cards && e.cards.length) s.push('Karteikarten: ' + e.cards.slice(0, 150).map(function (c) { return c.f + ' = ' + c.b; }).join('; '));
      out.push(s.join('\n'));
    });
    var ls = (DATA.lessons || []).filter(function (l) { return l.subject === sub; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 12);
    if (ls.length) out.push('## Letzte Unterrichtsstunden\n' + ls.map(function (l) { return '### ' + l.date + ': ' + (l.title || '') + '\n' + (l.points || []).map(function (p) { return '- ' + p; }).join('\n'); }).join('\n'));
    (DATA.practice || []).filter(function (p) { return p.subject === sub; }).forEach(function (p) {
      var cards = []; (p.sets || []).forEach(function (st) { (st.cards || []).forEach(function (c) { cards.push(c.f + ' = ' + c.b + (c.sec ? ' [' + c.sec + ']' : '')); }); });
      if (cards.length) out.push('## Vokabeln/Karten (' + cards.length + ', Auszug)\n' + cards.slice(-400).join('; '));
    });
    var txt = out.join('\n\n'); if (txt.length > 60000) txt = txt.slice(0, 60000) + '\n…(gekürzt)';
    return (ctxCache[sub] = txt);
  }
  function grade(sub) {
    try { var D = JSON.parse(localStorage.getItem('noten-v1') || 'null'); var s = D && (D.subjects || []).find(function (x) { return x.n === sub; }); if (!s || !s.g || !s.g.length) return null; var a = 0, w = 0; s.g.forEach(function (g) { a += g.v * (g.w || 1); w += g.w || 1; }); return w ? (a / w).toFixed(1).replace('.', ',') : null; } catch (e) { return null; }
  }

  /* ---------- Oberfläche ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.ki-btn{all:unset;cursor:pointer;font:600 13px/1 system-ui,sans-serif;padding:7px 11px;border:1.5px solid var(--red,#d9480f);color:var(--red,#d9480f);border-radius:999px;white-space:nowrap}' +
    '.top .ki-btn,.pt-top .ki-btn{margin-left:auto}.top .ki-btn+.pse-btn,.pt-top .ki-btn+.pse-btn{margin-left:0}' +
    '.ki-top{box-sizing:border-box;height:44px;padding:0 14px;display:grid;place-content:center;border-radius:12px;border:1px solid var(--line,#ddd);background:var(--card,#fff);color:var(--ink,#111);font:600 14px/1 system-ui,sans-serif}.ki-top:hover{background:var(--card,#fff);color:var(--red,#d9480f);border-color:var(--red,#d9480f)}' +
    '.ki-btn:not(.ki-top):hover{background:var(--red,#d9480f);color:#fff}.prac .ki-btn{margin-left:8px;padding:10px 14px}' +
    '#ki{position:fixed;inset:0;z-index:78;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}#ki[hidden]{display:none}' +
    '#ki .ks{background:var(--bg,#fff);color:var(--ink,#111);width:100%;max-width:760px;height:92vh;display:flex;flex-direction:column;border-radius:20px 20px 0 0;overflow:hidden}' +
    '@media (min-width:1000px){#ki{align-items:center}#ki .ks{max-width:min(1000px,88vw);height:88vh;border-radius:20px}}' +
    '#ki .kh{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--line,#ddd)}#ki .kh h2{margin:0;font-size:18px;flex:1}' +
    '#ki select{font:inherit;font-size:15px;padding:5px 8px;border-radius:8px;border:1px solid var(--line,#ccc);background:var(--card,#fff);color:inherit}' +
    '#ki .kx{all:unset;cursor:pointer;font-size:28px;line-height:1;padding:2px 8px;color:var(--soft,#777)}' +
    '#ki .km{flex:1;overflow:auto;padding:16px 18px;display:flex;flex-direction:column;gap:10px}' +
    '#ki .b{max-width:85%;padding:10px 13px;border-radius:14px;line-height:1.45;font-size:15.5px;white-space:pre-wrap;word-wrap:break-word}' +
    '#ki .u{align-self:flex-end;background:var(--red,#d9480f);color:#fff;border-bottom-right-radius:4px}#ki .a{align-self:flex-start;background:var(--card,#f3f3f3);border:1px solid var(--line,#ddd);border-bottom-left-radius:4px}' +
    '#ki .a.err{border-color:var(--red,#d9480f)}#ki .hint{color:var(--soft,#777);font-size:14px;line-height:1.45}' +
    '#ki .sug{display:flex;flex-wrap:wrap;gap:6px}#ki .sug button{all:unset;cursor:pointer;font-size:13.5px;padding:7px 11px;border:1px solid var(--line,#ccc);border-radius:999px}#ki .sug button:hover{border-color:var(--red,#d9480f)}' +
    '#ki form{display:flex;gap:8px;padding:12px 14px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--line,#ddd)}' +
    '#ki textarea{flex:1;font:inherit;font-size:16px;resize:none;min-height:44px;max-height:140px;padding:10px 12px;border-radius:12px;border:1px solid var(--line,#ccc);background:var(--card,#fff);color:inherit}' +
    '#ki .send{all:unset;cursor:pointer;background:var(--red,#d9480f);color:#fff;font-weight:600;padding:0 16px;border-radius:12px}#ki .send[disabled]{opacity:.5;cursor:default}' +
    '#ki .ctx{font-size:12.5px;color:var(--soft,#777);padding:6px 18px 0}';
  document.head.appendChild(css);
  var ov = document.createElement('div'); ov.id = 'ki'; ov.hidden = true; document.body.appendChild(ov);
  var chats = {}, cur = null, task = '', busy = false, prevOverflow = '';

  function sup(s) { return window.PT && PT.esc ? s : s; }
  function bubbles() {
    var c = chats[cur] || [];
    if (!c.length) return '<p class="hint">Frag alles zu <b>' + esc(cur) + '</b>: Ich kenne den Stoff aus der App – Lerneinheiten, Übungsfragen, Musterlösungen und eure letzten Stunden.' + (task ? ' Die Aufgabe, an der du gerade bist, sehe ich auch.' : '') + '</p>' +
      '<div class="sug">' + (task ? ['Erklär mir diese Aufgabe Schritt für Schritt', 'Gib mir einen Tipp, ohne die Lösung zu verraten'] : ['Was kommt in der nächsten Prüfung dran?', 'Erklär mir das wichtigste Thema einfach', 'Stell mir 3 Übungsfragen']).concat(['Was verwechseln viele hier?']).map(function (q) { return '<button type="button" data-q="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>';
    return c.map(function (m) { return '<div class="b ' + (m.r === 'u' ? 'u' : 'a') + (m.err ? ' err' : '') + '">' + esc(m.t) + '</div>'; }).join('');
  }
  function render() {
    var opts = subjects().filter(hasStuff).map(function (s) { return '<option' + (s === cur ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
    ov.innerHTML = '<div class="ks" role="dialog" aria-modal="true" aria-label="Frag die KI"><div class="kh"><h2>Frag die KI</h2><select aria-label="Fach">' + opts + '</select><button class="kx" data-ki-close aria-label="Schließen">×</button></div>' +
      (task ? '<div class="ctx">Mit der aktuellen Aufgabe</div>' : '') +
      '<div class="km">' + bubbles() + '</div>' +
      '<form><textarea rows="1" placeholder="' + (sample ? 'Deine Frage …' : 'Geht nur in der Claude-App') + '"' + (sample ? '' : ' disabled') + '></textarea><button class="send" type="submit"' + (busy || !sample ? ' disabled' : '') + '>Senden</button></form></div>';
    var m = ov.querySelector('.km'); m.scrollTop = m.scrollHeight;
  }
  function open(sub, taskText) {
    cur = sub && hasStuff(sub) && subjects().indexOf(sub) >= 0 ? sub : (cur || subjects().filter(hasStuff)[0]); task = (taskText || '').slice(0, 3000);
    prevOverflow = document.body.style.overflow; render(); ov.hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(function () { var t = ov.querySelector('textarea'); if (t && window.innerWidth > 700) t.focus(); }, 50);
  }
  function close() { ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = prevOverflow; }

  async function ask(q) {
    if (!sample || busy || !q.trim()) return;
    var c = chats[cur] = chats[cur] || []; c.push({ r: 'u', t: q.trim() }); var a = { r: 'a', t: '…' }; c.push(a); busy = true; render();
    var g = grade(cur), hist = c.slice(0, -2).slice(-10).map(function (m) { return (m.r === 'u' ? 'Schüler: ' : 'Du: ') + m.t; }).join('\n');
    var prompt = 'Du bist eine geduldige, ehrliche Lernhilfe für eine Schülerin oder einen Schüler der Klasse 9 am bayerischen Gymnasium (Chiemgau-Gymnasium). Fach: ' + cur + '. Heute ist ' + today() + '.' +
      (g ? ' Notenschnitt im Fach bisher: ' + g + ' – bei schwächerem Schnitt einfacher und kleinschrittiger erklären.' : '') +
      '\n\nDas ist der gesamte Stoff dieses Fachs aus der Lern-App (aus dem Unterricht/OneNote übernommen):\n<stoff>\n' + context(cur) + '\n</stoff>\n' +
      (task ? '\nDie Aufgabe, die gerade offen ist:\n<aufgabe>\n' + task + '\n</aufgabe>\n' : '') +
      (hist ? '\nBisheriges Gespräch:\n' + hist + '\n' : '') +
      '\nNeue Frage: ' + q.trim() + '\n\n' +
      'Antworte auf Deutsch (du-Form; im Fach Englisch/Latein dürfen Beispiele in der Sprache sein), kurz und klar (meist unter 150 Wörtern, nur länger wenn nötig), ohne Markdown-Überschriften und ohne Tabellen. ' +
      'Halte dich an den Stoff oben und an das Niveau der 9. Klasse; wenn etwas nicht im Stoff steht, sag das ehrlich und erkläre es trotzdem allgemein, aber kennzeichne es. ' +
      'Wenn nach der Lösung einer gerade offenen Aufgabe gefragt wird, gib zuerst einen Tipp und erkläre dann den Weg, damit man es selbst versteht. Formeln mit echten Hoch-/Tiefzeichen (H₂O, Al³⁺, v²).';
    try {
      var r = await sample(prompt, { modelTier: 'default', onText: function (o) { a.t = o.text; var b = ov.querySelectorAll('.km .b.a'); if (b.length) { b[b.length - 1].textContent = o.text; var m = ov.querySelector('.km'); m.scrollTop = m.scrollHeight; } } });
      a.t = r && r.text ? r.text : a.t;
    } catch (e) {
      a.err = true; a.t = e && e.code === 'not_granted' ? 'Die KI ist hier nicht freigegeben. Erlaube sie in der Claude-App, wenn sie danach fragt.' : e && e.code === 'rate_limited' ? 'Gerade zu viele Anfragen – versuch es in ein paar Minuten nochmal.' : 'Das hat gerade nicht geklappt. Versuch es nochmal.';
    }
    busy = false; if (!ov.hidden) render();
  }
  ov.addEventListener('click', function (e) {
    if (e.target === ov || e.target.closest('[data-ki-close]')) return close();
    var s = e.target.closest('[data-q]'); if (s) ask(s.dataset.q);
  });
  ov.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') { cur = e.target.value; render(); } });
  ov.addEventListener('submit', function (e) { e.preventDefault(); var t = ov.querySelector('textarea'); var v = t.value; t.value = ''; ask(v); });
  ov.addEventListener('keydown', function (e) { if (e.target.tagName === 'TEXTAREA' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); var t = e.target, v = t.value; t.value = ''; ask(v); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ov.hidden) { e.stopImmediatePropagation(); close(); } }, true);

  /* ---------- Knöpfe ---------- */
  var lastSub = null;
  function exSub(id) { var e = (DATA.exams || []).find(function (x) { return x.id === id; }); return e ? e.subject : null; }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-learn],[data-quiz],[data-cards],[data-write],[data-draw]');
    if (b) { var id = b.getAttribute('data-learn') || b.getAttribute('data-quiz') || b.getAttribute('data-cards') || b.getAttribute('data-write') || b.getAttribute('data-draw'); lastSub = exSub(id) || lastSub; }
    var k = e.target.closest && e.target.closest('.ki-btn'); if (!k) return;
    e.preventDefault(); e.stopPropagation();
    var sheet = k.closest('.sheet, .pt-s');
    open(k.dataset.sub || subFromSheet(sheet) || lastSub, sheet ? taskText(sheet) : '');
  }, true);
  function subFromSheet(sheet) {
    if (!sheet) return null; var h = (sheet.querySelector('h2,h3') || {}).textContent || '';
    var all = subjects().sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < all.length; i++) if (h.indexOf(all[i]) >= 0) return all[i];
    return lastSub;
  }
  function taskText(sheet) {
    var c = sheet.cloneNode(true); c.querySelectorAll('button.ki-btn,button.pse-btn,.x,.pt-x,canvas,svg').forEach(function (n) { n.remove(); });
    var t = (c.innerText || c.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
    var ins = Array.prototype.map.call(sheet.querySelectorAll('textarea,input[type=text],input:not([type])'), function (i) { return i.value; }).filter(Boolean);
    return t + (ins.length ? '\nBisherige Eingabe: ' + ins.join(' | ') : '');
  }
  function mk(sub) { var b = document.createElement('button'); b.type = 'button'; b.className = 'ki-btn'; b.textContent = 'Frag die KI'; if (sub) b.dataset.sub = sub; return b; }
  function paintBtns() {
    if (!ready || !sample) return;
    var gear = document.getElementById('gear');
    if (gear && !document.getElementById('kiOpen')) { var tb = mk(null); tb.id = 'kiOpen'; tb.className = 'ki-btn ki-top'; var nb = document.getElementById('ntOpen'); gear.parentNode.insertBefore(tb, nb && nb.parentNode === gear.parentNode ? nb : gear); }
    else if (gear) { var t0 = document.getElementById('kiOpen'), n0 = document.getElementById('ntOpen'); if (n0 && t0.nextSibling !== n0 && n0.parentNode === t0.parentNode) n0.parentNode.insertBefore(t0, n0); }
    [['#modal .sheet', '.top', '.x'], ['#pt .pt-s', '.pt-top', '.pt-x']].forEach(function (d) {
      var sheet = document.querySelector(d[0]); if (!sheet) return; var top = sheet.querySelector(d[1]); if (!top || top.querySelector('.ki-btn')) return;
      if (/Einstellungen|Noten/.test(top.textContent || '')) return;
      var anchor = top.querySelector('.pse-btn') || top.querySelector(d[2]); top.insertBefore(mk(null), anchor || null);
    });
    document.querySelectorAll('.exam .body').forEach(function (body) {
      if (body.querySelector('.ki-btn')) return;
      var any = body.querySelector('[data-quiz],[data-learn],[data-cards],[data-write],[data-draw]'); if (!any) return;
      var sub = exSub(any.getAttribute('data-quiz') || any.getAttribute('data-learn') || any.getAttribute('data-cards') || any.getAttribute('data-write') || any.getAttribute('data-draw')); if (!sub) return;
      var row = body.querySelector('.pt-open'); var b = mk(sub);
      if (row) row.appendChild(b); else { var r = document.createElement('div'); r.className = 'prac'; r.style.marginTop = '8px'; r.appendChild(b); body.appendChild(r); }
    });
  }
  var q = 0;
  new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; paintBtns(); }); }).observe(document.body, { childList: true, subtree: true });
  window.KI = { open: open, context: context };
})();
