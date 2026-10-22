// Whiteboard for the lesson iframe: CSS + browser-side script.
// Both are plain strings injected into the page built in routes.ts.
// String.raw keeps backslashes intact; do not use backticks or ${} below.

export const whiteboardCss = String.raw`
/* ---- Whiteboard: the lesson fills it in as the teacher speaks ----
   (frame / position of the board itself lives in characters.ts, the scene skin) */
#whiteboard {
  position: relative; flex: 1; padding: 14px 24px 10px; overflow: hidden;
  font-family: var(--board-font, 'Nunito','Segoe UI',sans-serif);
  color: var(--board-ink, #1e293b);
}
.wb-slide { animation: wb-in .35s ease; position: relative; }
@keyframes wb-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.wb-head { display: flex; align-items: center; justify-content: space-between; }
.wb-label {
  display: flex; align-items: center; font: 800 15px 'Nunito','Segoe UI',sans-serif; letter-spacing: .08em;
  text-transform: uppercase; color: var(--accent, #12958D);
}
.wb-label .ic { font-size: 26px; margin-right: 9px; letter-spacing: 0; line-height: 1; }
.wb-dots { display: flex; gap: 7px; }
.wb-dots i { width: 11px; height: 11px; border-radius: 50%; background: var(--board-dot, #DCE4F4); }
.wb-dots i.done { background: var(--accent-line, #9CCEF5); }
.wb-dots i.on { background: var(--accent, #12958D); box-shadow: 0 0 0 3px rgba(18,149,141,.18); }
.wb-underline { display: block; width: 100%; height: 8px; margin: 4px 0 10px; }
.wb-underline path {
  stroke: var(--accent, #12958D); stroke-width: 3; fill: none; stroke-linecap: round;
  stroke-dasharray: 320; stroke-dashoffset: 320; animation: wb-draw .9s ease forwards;
}
@keyframes wb-draw { to { stroke-dashoffset: 0; } }

/* items are revealed as the narration reaches them */
.wb-item { opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.wb-item.show { opacity: 1; transform: none; }

/* picture (Wikipedia) or big topic icon, top-right of the slide */
.wb-pic {
  position: absolute; top: 34px; right: 0; width: 150px; height: 104px;
  object-fit: cover; border-radius: 16px; border: 3px solid #fff;
  box-shadow: 0 6px 16px rgba(15,23,42,.22); transform: rotate(2deg);
  animation: wb-pop .6s .25s ease both;
}
.wb-bigicon {
  position: absolute; top: 28px; right: 18px; font-size: 88px; line-height: 1;
  filter: drop-shadow(0 6px 10px rgba(15,118,110,.28));
  animation: wb-pop .6s .25s ease both, wb-float 4s 1s ease-in-out infinite;
}
.wb-bigicon::before, .wb-bigicon::after { content: ''; position: absolute; border-radius: 50%; }
.wb-bigicon::before { left: -16px; top: 14px; width: 9px; height: 9px; background: var(--accent-line, #9CCEF5); }
.wb-bigicon::after { right: -8px; bottom: -2px; width: 13px; height: 13px; background: var(--accent, #12958D); opacity: .85; }
@keyframes wb-pop { from { opacity: 0; transform: scale(.6) rotate(-8deg); } to { opacity: 1; } }
@keyframes wb-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.wb-slide.has-pic .wb-main { padding-right: 170px; min-height: 100px; }
.wb-title.has-pic .wb-main { padding-right: 0; }
.wb-title.has-pic .wb-h1, .wb-title.has-pic .wb-sub { padding-right: 170px; }

/* title slide: handwritten heading + icon chips */
.wb-h1 {
  font-family: 'Dancing Script','Segoe Script','Lucida Handwriting','Brush Script MT',cursive;
  font-weight: 700; font-size: 46px; line-height: 1.08; margin: 2px 0 0;
  color: var(--board-title, #10205C);
}
.wb-sub { font: 600 19px 'Nunito','Segoe UI',sans-serif; color: var(--board-muted, #4A5675); margin: 2px 0 12px; }
.wb-chips { display: flex; flex-wrap: wrap; gap: 8px 9px; }
.wb-chip {
  display: inline-flex; align-items: center; gap: 8px; padding: 5px 15px 5px 11px;
  border: 2.5px solid var(--accent-line, #9CCEF5); border-radius: 999px;
  background: var(--accent-soft, #F3F9FF); color: var(--board-ink, #1D2A4D);
  font: 600 16px 'Nunito','Segoe UI',sans-serif; box-shadow: 0 0 0 3px rgba(156,206,245,.2);
  opacity: 0; animation: wb-in .4s ease forwards;
}
.wb-chip .ci { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; font-size: 19px; line-height: 1; }
.wb-chip .aa { font: 800 17px 'Nunito','Segoe UI',sans-serif; color: #2B7BE4; }
.wb-chip .bang {
  display: inline-flex; align-items: center; justify-content: center; width: 21px; height: 21px;
  border-radius: 50%; background: #2F8BE6; color: #fff; font: 800 14px 'Nunito','Segoe UI',sans-serif;
}
.wb-vocab .wb-item {
  padding: 6px 16px; border: 2.5px solid var(--accent-line, #9CCEF5); border-radius: 999px;
  background: var(--accent-soft, #F3F9FF); font-size: 19px; font-weight: 700;
}
.wb-text { font-size: 23px; line-height: 1.32; font-weight: 700; color: var(--board-ink, #1D2A4D); }
.wb-note { font: 600 15px/1.4 'Nunito','Segoe UI',sans-serif; color: var(--board-muted, #4A5675); margin-top: 12px; }
.wb-example .wb-text { color: var(--board-ex, #166534); }
.wb-caution .wb-text { color: #0f172a; }
.wb-caution { border-left: 6px solid #f59e0b; background: #fffbeb; padding: 10px 14px; border-radius: 10px; }

/* steps = connected flow */
.wb-steps, .wb-facts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.wb-steps li { position: relative; display: flex; gap: 14px; align-items: flex-start; font-size: 21px; font-weight: 600; line-height: 1.3; }
.wb-steps .n {
  flex: none; width: 34px; height: 34px; border-radius: 50%; background: var(--accent, #12958D);
  color: var(--accent-ink, #fff); font: 800 17px/34px 'Nunito','Segoe UI',sans-serif; text-align: center; z-index: 1;
}
.wb-steps li:not(:last-child)::after {
  content: ''; position: absolute; left: 16px; top: 34px; bottom: -12px; width: 3px;
  background: var(--accent-line, #9CCEF5); transform: scaleY(0); transform-origin: top; transition: transform .5s .25s ease;
}
.wb-steps li.show:not(:last-child)::after { transform: scaleY(1); }
.wb-facts li { position: relative; padding-left: 22px; font-size: 17px; font-weight: 600; line-height: 1.3; }
.wb-facts li::before { content: ''; position: absolute; left: 3px; top: .5em; width: 9px; height: 9px; border-radius: 50%; background: var(--accent, #12958D); }
.wb-slide.dense .wb-steps, .wb-slide.dense .wb-facts { gap: 6px; }
.wb-slide.dense .wb-steps li { font-size: 18px; }
.wb-slide.dense .wb-steps li:not(:last-child)::after { bottom: -6px; left: 12px; top: 26px; }
.wb-slide.dense .wb-steps .n { width: 26px; height: 26px; font-size: 14px; line-height: 26px; }
.wb-slide.dense .wb-facts li { font-size: 15px; }

.wb-slide::after { content: ''; display: block; clear: both; }


/* ---- new visual kinds: timeline, comparison, diagram, bars, quiz, formula ---- */
.wb-timeline .wb-tl { position: relative; display: flex; flex-direction: column; gap: 10px; padding-left: 6px; }
.wb-tl::before { content: ''; position: absolute; left: 14px; top: 8px; bottom: 8px; width: 3px; background: var(--accent-line, #9CCEF5); border-radius: 2px; }
.wb-tl-row { position: relative; display: flex; gap: 14px; align-items: baseline; padding-left: 26px; }
.wb-tl-row::before { content: ''; position: absolute; left: 7px; top: 9px; width: 16px; height: 16px; border-radius: 50%; background: var(--accent, #12958D); box-shadow: 0 0 0 4px var(--accent-soft, #F3F9FF); }
.wb-tl-row .tw { flex: none; min-width: 72px; font: 800 17px 'Nunito','Segoe UI',sans-serif; color: var(--accent, #12958D); }
.wb-tl-row .tx { font-size: 18px; font-weight: 600; line-height: 1.3; }

.wb-cmp { display: flex; flex-direction: column; gap: 8px; }
.wb-cmp-head, .wb-cmp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.wb-cmp-head div { text-align: center; padding: 6px 10px; border-radius: 12px; font: 800 18px 'Nunito','Segoe UI',sans-serif; color: var(--accent-ink, #fff); background: var(--accent, #12958D); }
.wb-cmp-head div:last-child { background: #F59E0B; color: #fff; }
.wb-cmp-row div { padding: 7px 12px; border-radius: 12px; font-size: 16px; font-weight: 600; line-height: 1.3; background: var(--accent-soft, #F3F9FF); border: 2px solid var(--accent-line, #9CCEF5); }
.wb-cmp-row div:last-child { background: #FFFBEB; border-color: #FCD34D; }

.wb-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 28px; padding: 4px 0; }
.wb-node { position: relative; padding: 8px 12px; border-radius: 14px; background: var(--accent-soft, #F3F9FF); border: 3px solid var(--accent, #12958D); font-size: 16px; font-weight: 700; text-align: center; max-width: 170px; }
.wb-node:not(:last-of-type)::after { content: '\2192'; position: absolute; right: -25px; top: 50%; transform: translateY(-52%); font-size: 24px; font-weight: 800; color: var(--accent, #12958D); }

.wb-bars { display: flex; flex-direction: column; gap: 9px; }
.wb-bar { display: grid; grid-template-columns: 104px 1fr 104px; gap: 10px; align-items: center; font-size: 16px; font-weight: 700; }
.wb-bar .bt { height: 20px; border-radius: 10px; background: var(--board-dot, #DCE4F4); overflow: hidden; }
.wb-bar .bt i { display: block; height: 100%; width: 0; border-radius: 10px; background: linear-gradient(90deg, var(--accent, #12958D), var(--accent-line, #9CCEF5)); transition: width .9s .15s ease; }
.wb-bar.show .bt i { width: var(--w, 0%); }
.wb-bar .bv { text-align: right; white-space: nowrap; color: var(--accent, #12958D); }

.wb-quiz .wb-q { font-size: 21px; font-weight: 800; line-height: 1.3; margin-bottom: 10px; }
.wb-opts { display: flex; flex-direction: column; gap: 8px; }
.wb-opt { display: flex; gap: 12px; align-items: center; padding: 8px 14px; border-radius: 14px; border: 2.5px solid var(--accent-line, #9CCEF5); background: var(--accent-soft, #F3F9FF); font-size: 17px; font-weight: 700; }
.wb-opt b { flex: none; width: 28px; height: 28px; border-radius: 50%; background: var(--accent, #12958D); color: var(--accent-ink, #fff); text-align: center; line-height: 28px; font-size: 15px; }
.wb-answer { margin-top: 10px; padding: 9px 14px; border-radius: 12px; background: #ECFDF5; border: 2.5px solid #34D399; color: #065F46; font-size: 16px; font-weight: 700; line-height: 1.35; }

.wb-eq { margin: 6px 0 12px; padding: 18px 22px; border-radius: 18px; text-align: center; font: 800 34px/1.25 'Cambria Math','Cambria','Times New Roman',serif; color: var(--board-title, #10205C); background: var(--accent-soft, #F3F9FF); border: 3px dashed var(--accent, #12958D); }

/* the Play/Pause pair: .control-btn's display:flex was beating .hidden */
.control-btn.hidden { display: none; }
`;

export const whiteboardScript = String.raw`
(function () {
  var boardEl = document.getElementById('whiteboard');
  var activeBeat = -1;
  window.__lastBoardSyncAt = 0; // last time speech itself told us where we are

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // icon shown in front of each "Today we will cover" chip (matches the lesson sections)
  var CHIP_ICONS = {
    'core idea': '\u{1F4A1}', 'how it works': '\u2699\uFE0F', 'example': '\u{1F4D6}',
    'why it matters': '\u2764\uFE0F', 'keep in mind': '<b class="bang">!</b>', 'key facts': '\u2B50',
    'vocabulary': '<b class="aa">Aa</b>', 'big picture': '\u{1F52D}', 'three layers': '\u{1F9F1}',
    'comparison': '\u2696\uFE0F', 'summary': '\u2705'
  };
  function chipIcon(t) {
    var v = CHIP_ICONS[String(t).toLowerCase()];
    return v ? '<span class="ci">' + v + '</span>' : '';
  }

  function beatIndexAt(charIndex) {
    var idx = 0;
    for (var i = 0; i < beats.length; i++) {
      if (charIndex >= beats[i].start) idx = i; else break;
    }
    return idx;
  }

  function renderBeat(i) {
    var v = beats[i].board, h = '';
    var many = v.items && (v.items.length > 4 || v.kind === 'facts');
    var NOART = { steps: 1, facts: 1, vocab: 1, timeline: 1, comparison: 1, diagram: 1, bars: 1, quiz: 1, formula: 1 };
    var hasArt = !NOART[v.kind] && (v.image || v.icon);
    var dots = beats.map(function (_, k) {
      return '<i class="' + (k === i ? 'on' : k < i ? 'done' : '') + '"></i>';
    }).join('');

    h += '<div class="wb-slide wb-' + v.kind + (many ? ' dense' : '') + (hasArt ? ' has-pic' : '') + '">';
    h += '<div class="wb-head"><span class="wb-label">' + (v.icon ? '<span class="ic">' + esc(v.icon) + '</span>' : '') + esc(v.label) + '</span><span class="wb-dots">' + dots + '</span></div>';
    h += '<svg class="wb-underline" viewBox="0 0 300 8" preserveAspectRatio="none"><path d="M2 5 Q 40 1 90 4 T 190 4 T 298 3"/></svg>';

    if (hasArt) {
      h += v.image
        ? '<img class="wb-pic" src="' + esc(v.image) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">'
        : '<div class="wb-bigicon">' + esc(v.icon) + '</div>';
    }
    h += '<div class="wb-main">';

    if (v.kind === 'title') {
      h += '<h1 class="wb-h1">' + esc(v.text) + '</h1>';
      if (v.subtitle) h += '<div class="wb-sub">' + esc(v.subtitle) + '</div>';
      h += '<div class="wb-chips">' + (v.items || []).map(function (t, k) {
        return '<span class="wb-chip" style="animation-delay:' + (0.4 + k * 0.15).toFixed(2) + 's">' + chipIcon(t) + esc(t) + '</span>';
      }).join('') + '</div>';
    } else if (v.kind === 'steps') {
      h += '<ol class="wb-steps">' + v.items.map(function (t, k) {
        return '<li class="wb-item"><span class="n">' + (k + 1) + '</span><span>' + esc(t) + '</span></li>';
      }).join('') + '</ol>';
    } else if (v.kind === 'facts') {
      h += '<ul class="wb-facts">' + v.items.map(function (t) {
        return '<li class="wb-item">' + esc(t) + '</li>';
      }).join('') + '</ul>';
    } else if (v.kind === 'vocab') {
      h += '<div class="wb-chips">' + v.items.map(function (t) {
        return '<span class="wb-item">' + esc(t) + '</span>';
      }).join('') + '</div>';
    } else if (v.kind === 'timeline') {
      h += '<div class="wb-tl">' + v.events.map(function (e) {
        return '<div class="wb-item wb-tl-row"><span class="tw">' + esc(e.when) + '</span><span class="tx">' + esc(e.what) + '</span></div>';
      }).join('') + '</div>';
    } else if (v.kind === 'comparison') {
      h += '<div class="wb-cmp"><div class="wb-item wb-cmp-head"><div>' + esc(v.leftTitle) + '</div><div>' + esc(v.rightTitle) + '</div></div>' +
        v.rows.map(function (r) {
          return '<div class="wb-item wb-cmp-row"><div>' + esc(r.left) + '</div><div>' + esc(r.right) + '</div></div>';
        }).join('') + '</div>';
    } else if (v.kind === 'diagram') {
      h += '<div class="wb-flow">' + v.nodes.map(function (t) {
        return '<div class="wb-item wb-node">' + esc(t) + '</div>';
      }).join('') + '</div>';
      if (v.caption) h += '<div class="wb-item wb-note">' + esc(v.caption) + '</div>';
    } else if (v.kind === 'bars') {
      var maxV = 0, minV = Infinity;
      v.items.forEach(function (it) { if (it.value > maxV) maxV = it.value; if (it.value > 0 && it.value < minV) minV = it.value; });
      var useLog = maxV > 0 && minV < Infinity && maxV / minV > 200; // keep small values visible
      function scaleV(x) { return useLog ? Math.log10(x + 1) : x; }
      var fmt = function (n) {
        try { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n); } catch (e) { return String(n); }
      };
      h += '<div class="wb-bars">' + v.items.map(function (it) {
        var pct = maxV > 0 ? Math.max(4, Math.round((scaleV(it.value) / scaleV(maxV)) * 100)) : 4;
        return '<div class="wb-item wb-bar" style="--w:' + pct + '%"><span>' + esc(it.label) + '</span><span class="bt"><i></i></span><span class="bv">' + esc(fmt(it.value)) + (it.unit ? ' ' + esc(it.unit) : '') + '</span></div>';
      }).join('') + '</div>';
      if (useLog) h += '<div class="wb-item wb-note">Bar lengths use a log scale so small values stay visible.</div>';
    } else if (v.kind === 'quiz') {
      h += '<div class="wb-item wb-q">' + esc(v.question) + '</div><div class="wb-opts">' + v.options.map(function (o, k) {
        return '<div class="wb-item wb-opt"><b>' + String.fromCharCode(65 + k) + '</b><span>' + esc(o) + '</span></div>';
      }).join('') + '</div>';
      h += '<div class="wb-item wb-answer">Answer: ' + String.fromCharCode(65 + v.answer) + (v.explain ? ' \u2014 ' + esc(v.explain) : '') + '</div>';
    } else if (v.kind === 'formula') {
      h += '<div class="wb-item wb-eq">' + esc(v.text) + '</div>';
      if (v.note) h += '<div class="wb-item wb-note">' + esc(v.note) + '</div>';
    } else if (v.kind === 'caution') {
      h += '<div class="wb-caution"><div class="wb-item wb-text">' + esc(v.text) + '</div></div>';
    } else {
      h += '<div class="wb-item wb-text">' + esc(v.text) + '</div>';
      var note = v.note || (v.prompt ? 'Think: ' + v.prompt : '');
      if (note) h += '<div class="wb-item wb-note">' + esc(note) + '</div>';
    }
    h += '</div></div>';

    boardEl.innerHTML = h;
    void boardEl.offsetHeight; // flush styles so reveal transitions run
    fitSlide();
  }

  // Shrink the slide until it fits the board (long text). The scene is scaled with a
  // CSS transform, so measure in unscaled units by dividing the scale back out.
  function fitSlide() {
    var slide = boardEl.firstElementChild;
    if (!slide) return;
    var cs = getComputedStyle(boardEl);
    var sc = boardEl.offsetHeight ? boardEl.getBoundingClientRect().height / boardEl.offsetHeight : 1;
    if (!sc || !isFinite(sc)) sc = 1;
    var avail = boardEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    function h() { return slide.getBoundingClientRect().height / sc; }
    slide.style.zoom = 1;
    if (h() <= avail) return;
    var lo = 0.5, hi = 1; // find the largest zoom that fits
    for (var n = 0; n < 7; n++) {
      var mid = (lo + hi) / 2;
      slide.style.zoom = mid;
      if (h() <= avail) lo = mid; else hi = mid;
    }
    slide.style.zoom = lo;
  }

  // Show the visual for whatever is being spoken at charIndex, and reveal its
  // items in step with how far through the paragraph the narration is.
  window.showBeatAt = function (charIndex) {
    if (!boardEl || !beats.length) return;
    var i = beatIndexAt(charIndex);
    if (i !== activeBeat) { activeBeat = i; renderBeat(i); }

    var b = beats[i];
    var frac = Math.min(1, Math.max(0, (charIndex - b.start) / Math.max(1, b.end - b.start)));
    var items = boardEl.querySelectorAll('.wb-item');
    var visible = Math.min(items.length, Math.floor(frac * items.length * 1.15) + 1);
    for (var k = 0; k < items.length; k++) {
      items[k].classList.toggle('show', k < visible);
    }
  };

  window.resetBoard = function () { activeBeat = -1; window.showBeatAt(0); };
  window.showBeatAt(0);
})();
`;
