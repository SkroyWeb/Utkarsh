// Makes the teacher act: mouth shapes follow the spoken letters (approximate
// lip-sync), and each beat's emotion/gesture drives head and body motion.
// Injected into the lesson page by routes.ts - no other file needs to know.

export const avatarMotionCss = String.raw`
/* ---- avatar acting (applied to the avatar <svg> and its wrapper) ---- */
.avatar-root { transform-origin: 50% 100%; }
.avatar-wrap { transform-origin: 50% 100%; }
@keyframes ge-nod { 0%,100% { transform: translateY(0); } 30% { transform: translateY(8px); } 60% { transform: translateY(-2px); } }
@keyframes ge-lean { 0% { transform: none; } 40%,100% { transform: scale(1.06) translateY(6px); } }
@keyframes ge-tilt { 0% { transform: none; } 50%,100% { transform: rotate(-3.5deg); } }
@keyframes em-hop { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-12px); } }
@keyframes em-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
@keyframes em-curious { 0% { transform: none; } 100% { transform: rotate(4deg); } }
.avatar-wrap.ge-nod { animation: ge-nod .9s ease 1; }
.avatar-wrap.ge-lean { animation: ge-lean 1.2s ease forwards; }
.avatar-wrap.ge-tilt { animation: ge-tilt .9s ease forwards; }
.avatar-root.em-excited { animation: em-hop .5s ease 3; }
.avatar-root.em-happy { animation: em-hop .6s ease 1; }
.avatar-root.em-serious { animation: em-shake .35s ease 2; }
.avatar-root.em-curious { animation: em-curious .7s ease forwards; }
@media (prefers-reduced-motion: reduce) {
  .avatar-wrap, .avatar-root { animation: none !important; }
}
`;

export const avatarMotionScript = String.raw`
(function () {
  var SHAPES = {
    wide:   'M-13,27 Q0,50 13,27',
    mid:    'M-14,28 Q0,40 14,28',
    round:  'M-9,28 Q0,42 9,28',
    u:      'M-8,29 Q0,38 8,29',
    closed: 'M-12,29 Q0,29 12,29',
    fv:     'M-13,28 Q0,33 13,28',
    soft:   'M-13,28 Q0,35 13,28'
  };
  var MOODS = {
    neutral: 'M-13,28 Q0,31 13,28',
    happy:   'M-15,26 Q0,38 15,26',
    excited: 'M-16,25 Q0,42 16,25',
    curious: 'M-9,28 Q0,35 9,28',
    serious: 'M-12,29 Q0,28 12,29'
  };
  var FLAP = ['mid', 'soft', 'wide', 'soft', 'round', 'soft'];
  var mood = 'neutral', timers = [], lastSpoken = 0, flapAt = 0, lastBeat = -1;

  function mouth() {
    var m = document.getElementById('mouth-shape');
    if (m && !m.__driven) {
      // the built-in looping <animate> tags would override our "d" - remove them once
      Array.prototype.slice.call(m.querySelectorAll('animate')).forEach(function (n) { n.remove(); });
      m.setAttribute('d', MOODS[mood]);
      m.__driven = true;
    }
    return m;
  }
  function setShape(name) {
    var m = mouth();
    if (m) m.setAttribute('d', name === 'mood' ? MOODS[mood] : (SHAPES[name] || MOODS[mood]));
  }
  function visemes(word) {
    var out = [], prev = '';
    for (var i = 0; i < word.length && out.length < 7; i++) {
      var c = word.charAt(i), s;
      if ('a'.indexOf(c) !== -1) s = 'wide';
      else if ('ei'.indexOf(c) !== -1) s = 'mid';
      else if (c === 'o') s = 'round';
      else if (c === 'u' || c === 'w') s = 'u';
      else if ('mbp'.indexOf(c) !== -1) s = 'closed';
      else if (c === 'f' || c === 'v') s = 'fv';
      else s = 'soft';
      if (s !== prev) out.push(s);
      prev = s;
    }
    return out;
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  // called from the speech "boundary" event with the character currently spoken
  window.avatarSpeak = function (text, idx) {
    lastSpoken = Date.now();
    var m = /^[A-Za-z0-9']+/.exec(String(text).slice(idx));
    var seq = visemes(m ? m[0].toLowerCase() : '');
    clearTimers();
    seq.forEach(function (s, i) { timers.push(setTimeout(function () { setShape(s); }, i * 70)); });
    timers.push(setTimeout(function () { setShape('mood'); }, seq.length * 70 + 30));
  };

  // some voices (e.g. network voices) never fire boundary events: flap the mouth instead
  setInterval(function () {
    var ss = window.speechSynthesis;
    var talking = ss && ss.speaking && !ss.paused;
    var now = Date.now();
    if (talking && now - lastSpoken > 450) {
      flapAt = (flapAt + 1) % FLAP.length;
      setShape(FLAP[flapAt]);
    } else if (!talking && now - lastSpoken > 700) {
      setShape('mood');
    }
  }, 120);

  function act(beat) {
    mood = (beat && beat.emotion) || 'neutral';
    setShape('mood');
    var g = document.getElementById('cartoon-teacher');
    var root = g && g.ownerSVGElement;
    if (!root) return;
    var wrap = root.parentElement;
    root.classList.add('avatar-root');
    if (wrap) wrap.classList.add('avatar-wrap');
    ['neutral', 'happy', 'excited', 'curious', 'serious'].forEach(function (e) { root.classList.remove('em-' + e); });
    ['none', 'nod', 'lean', 'tilt'].forEach(function (x) { if (wrap) wrap.classList.remove('ge-' + x); });
    void root.getBoundingClientRect(); // restart the CSS animations
    root.classList.add('em-' + mood);
    if (wrap && beat && beat.gesture) wrap.classList.add('ge-' + beat.gesture);
  }

  function beatAt(ci) {
    var idx = 0;
    for (var i = 0; i < beats.length; i++) { if (ci >= beats[i].start) idx = i; else break; }
    return idx;
  }

  if (typeof beats !== 'undefined' && window.showBeatAt) {
    var orig = window.showBeatAt;
    window.showBeatAt = function (ci) {
      orig.apply(this, arguments);
      var i = beatAt(ci);
      if (i !== lastBeat) { lastBeat = i; act(beats[i]); }
    };
  }
})();
`;
