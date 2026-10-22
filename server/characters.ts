// Teachers ("characters") for the lesson iframe.
// Each character bundles a LOOK (drawn as SVG), a THEME (scene + whiteboard
// colours) and a VOICE profile (used to pick / tune a speech-synthesis voice).
// To add a teacher, add one entry to `characters` below - nothing else.

export interface CharacterLook {
  style?: "portrait" | "robot";
  skin: string;
  skin2: string; // nose / shading
  body: string; // main clothing colour (coat, shirt, jacket)
  bodyDark: string; // outline / collar / sleeve edge
  inner?: string; // shirt under a coat or jacket
  hand: string;
  hair: string;
  hairStyle: "ponytail" | "long" | "bun" | "short" | "none";
  beard?: string; // beard colour, if any
  eyeColor: string;
  eyeBg?: string; // dark eye panels (robot)
  brow?: string; // eyebrow colour, omit for none
  mouth: string;
  head: "round" | "square";
  nose: boolean;
  accessories: Array<"glasses" | "headband" | "antenna">;
  accessoryColor: string;
  outfit: "polo" | "tee" | "coat" | "jacket" | "robot";
  badge: "atom" | "leaf" | "tie" | "panel" | "none";
  badgeColor: string;
}

export interface CharacterTheme {
  sceneTop: string;
  sceneBottom: string;
  accent: string;
  accentHover: string;
  accentInk: string; // text on top of accent
  ctrl: string; // control-button colour
  ctrlHover: string;
  soft: string; // chip background
  line: string; // chip border / connectors
  title: string; // scene title colour
  boardTitle: string; // big heading on the whiteboard
  boardBg: string;
  ink: string; // board text
  muted: string;
  border: string; // board frame gradient, start
  border2: string; // board frame gradient, end
  dot: string;
  example: string;
  decorHue: string; // hue-rotate for the faint background shapes
  glow: [string, string];
  particles: [string, string, string];
  boardFont?: string; // optional handwriting font for the board
}

export interface CharacterVoice {
  gender: "female" | "male" | "neutral";
  pitch: number; // used in full when no matching-gender voice is installed
  rate: number; // multiplier on the user's speed setting
  langs: string[]; // preferred BCP-47 prefixes, best first
}

export interface Character {
  id: string;
  name: string;
  tagline: string;
  greeting: string; // spoken when the student picks this teacher
  look: CharacterLook;
  theme: CharacterTheme;
  voice: CharacterVoice;
}

export const characters: Character[] = [
  {
    id: "aria",
    name: "Dr. Aria",
    tagline: "Science guide",
    greeting: "Hello, I'm Doctor Aria. Let's explore the science together!",
    look: {
      skin: "#F8D5BD", skin2: "#E8B293", body: "#F8FAFC", bodyDark: "#CBD5E1", inner: "#0F766E",
      hand: "#F8D5BD", hair: "#5A3424", hairStyle: "bun", eyeColor: "#6B4226", brow: "#4A2A1C",
      mouth: "#E8767F", head: "round", nose: true,
      accessories: ["glasses"], accessoryColor: "#4B3B35",
      outfit: "coat", badge: "atom", badgeColor: "#3B82F6",
    },
    theme: {
      sceneTop: "#E6F3FD", sceneBottom: "#D3EEF3", accent: "#12958D", accentHover: "#0E7C76",
      accentInk: "#FFFFFF", ctrl: "#12958D", ctrlHover: "#0E7C76", soft: "#F3F9FF", line: "#9CCEF5",
      title: "#10205C", boardTitle: "#10205C", boardBg: "#FFFFFF", ink: "#1D2A4D", muted: "#4A5675",
      border: "#14B8A6", border2: "#86EBD2", dot: "#DCE4F4", example: "#166534", decorHue: "-40deg",
      glow: ["#FFF1A8", "#FDE68A"], particles: ["#5EEAD4", "#A5F3FC", "#FDE68A"],
    },
    voice: { gender: "female", pitch: 1.06, rate: 0.97, langs: ["en-IN", "en-GB", "en-US"] },
  },
  {
    id: "nova",
    name: "Nova",
    tagline: "Friendly guide",
    greeting: "Hi, I'm Nova. Let's learn something great together!",
    look: {
      skin: "#FADBC8", skin2: "#EDBBA2", body: "#4F7DF0", bodyDark: "#3A60D0",
      hand: "#FADBC8", hair: "#2F4FB5", hairStyle: "ponytail", eyeColor: "#2F6BDF", brow: "#2F4FB5",
      mouth: "#F0707A", head: "round", nose: true,
      accessories: ["headband"], accessoryColor: "#60A5FA",
      outfit: "polo", badge: "atom", badgeColor: "#FFFFFF",
    },
    theme: {
      sceneTop: "#EFF6FF", sceneBottom: "#DBEAFE", accent: "#3B82F6", accentHover: "#2563EB",
      accentInk: "#FFFFFF", ctrl: "#3B82F6", ctrlHover: "#2563EB", soft: "#EFF6FF", line: "#93C5FD",
      title: "#1E3A8A", boardTitle: "#1E3A8A", boardBg: "#FFFFFF", ink: "#1E293B", muted: "#475569",
      border: "#60A5FA", border2: "#B6D3FF", dot: "#CBD5E1", example: "#166534", decorHue: "0deg",
      glow: ["#A5B4FC", "#818CF8"], particles: ["#5EEAD4", "#A5B4FC", "#93C5FD"],
    },
    voice: { gender: "female", pitch: 1.1, rate: 1.0, langs: ["en-IN", "en-GB", "en-US"] },
  },
  {
    id: "meera",
    name: "Meera",
    tagline: "Calm and clear",
    greeting: "Hello, I'm Meera. Ready to explore this topic step by step?",
    look: {
      skin: "#F7D6C0", skin2: "#E8B699", body: "#34C98B", bodyDark: "#1FA472",
      hand: "#F7D6C0", hair: "#2B2B33", hairStyle: "long", eyeColor: "#5B3A29", brow: "#2B2B33",
      mouth: "#F0707A", head: "round", nose: true,
      accessories: ["headband"], accessoryColor: "#4ADE80",
      outfit: "tee", badge: "leaf", badgeColor: "#FDE68A",
    },
    theme: {
      sceneTop: "#ECFDF5", sceneBottom: "#D1FAE5", accent: "#10B981", accentHover: "#059669",
      accentInk: "#FFFFFF", ctrl: "#10B981", ctrlHover: "#059669", soft: "#ECFDF5", line: "#6EE7B7",
      title: "#065F46", boardTitle: "#065F46", boardBg: "#FFFFFF", ink: "#1F2937", muted: "#4B5563",
      border: "#34D399", border2: "#B5F2D6", dot: "#D1D5DB", example: "#166534", decorHue: "-57deg",
      glow: ["#6EE7B7", "#34D399"], particles: ["#FDE68A", "#6EE7B7", "#A7F3D0"],
    },
    voice: { gender: "female", pitch: 1.18, rate: 0.98, langs: ["en-IN", "en-GB", "en-US"] },
  },
  {
    id: "aarav",
    name: "Aarav",
    tagline: "Energetic coach",
    greeting: "Hey, I'm Aarav! Let's break this down together.",
    look: {
      skin: "#E6B089", skin2: "#CE8F66", body: "#F97316", bodyDark: "#D9600A",
      hand: "#E6B089", hair: "#1F1A17", hairStyle: "short", eyeColor: "#3B2A20", brow: "#1F1A17",
      mouth: "#D9626B", head: "round", nose: true,
      accessories: [], accessoryColor: "#FDBA74",
      outfit: "polo", badge: "none", badgeColor: "#FDBA74",
    },
    theme: {
      sceneTop: "#FFF7ED", sceneBottom: "#FFEDD5", accent: "#F97316", accentHover: "#EA580C",
      accentInk: "#FFFFFF", ctrl: "#F97316", ctrlHover: "#EA580C", soft: "#FFF7ED", line: "#FDBA74",
      title: "#9A3412", boardTitle: "#9A3412", boardBg: "#FFFFFF", ink: "#292524", muted: "#57534E",
      border: "#FB923C", border2: "#FED7AA", dot: "#D6D3D1", example: "#166534", decorHue: "173deg",
      glow: ["#FDBA74", "#FB923C"], particles: ["#FDE68A", "#FDBA74", "#FCA5A5"],
    },
    voice: { gender: "male", pitch: 0.88, rate: 1.0, langs: ["en-IN", "en-US", "en-GB"] },
  },
  {
    id: "sage",
    name: "Prof. Sage",
    tagline: "Classic chalkboard",
    greeting: "Good day. I'm Professor Sage. Let us begin the lesson.",
    look: {
      skin: "#F1CDAA", skin2: "#DDAA80", body: "#7C4A21", bodyDark: "#5A3515", inner: "#F8FAFC",
      hand: "#F1CDAA", hair: "#E5E7EB", hairStyle: "short", beard: "#E5E7EB", eyeColor: "#374151", brow: "#AEB4BF",
      mouth: "#C9722B", head: "round", nose: true,
      accessories: ["glasses"], accessoryColor: "#CA8A04",
      outfit: "jacket", badge: "tie", badgeColor: "#DC2626",
    },
    theme: {
      sceneTop: "#F5F5F4", sceneBottom: "#E7E5E4", accent: "#FACC15", accentHover: "#EAB308",
      accentInk: "#14532D", ctrl: "#92400E", ctrlHover: "#78350F", soft: "rgba(250,204,21,0.14)",
      line: "rgba(250,204,21,0.65)", title: "#78350F", boardTitle: "#FDE68A", boardBg: "#14532D", ink: "#F8FAFC",
      muted: "#D1FAE5", border: "#92400E", border2: "#C2762B", dot: "rgba(255,255,255,0.28)", example: "#BBF7D0",
      decorHue: "-57deg", glow: ["#FDE68A", "#FBBF24"], particles: ["#FDE68A", "#D6D3D1", "#FCD34D"],
      boardFont: "'Segoe Print','Bradley Hand','Chalkboard SE','Comic Sans MS',cursive",
    },
    voice: { gender: "male", pitch: 0.78, rate: 0.92, langs: ["en-GB", "en-US", "en-IN"] },
  },
  {
    id: "bolt",
    name: "Bolt",
    tagline: "Robot tutor",
    greeting: "Greetings. I am Bolt. Systems online. Let us learn.",
    look: {
      style: "robot",
      skin: "#CBD5E1", skin2: "#94A3B8", body: "#64748B", bodyDark: "#475569",
      hand: "#94A3B8", hair: "#94A3B8", hairStyle: "none", eyeColor: "#22D3EE", eyeBg: "#0F172A",
      mouth: "#0F172A", head: "square", nose: false,
      accessories: ["antenna"], accessoryColor: "#22D3EE",
      outfit: "robot", badge: "panel", badgeColor: "#22D3EE",
    },
    theme: {
      sceneTop: "#ECFEFF", sceneBottom: "#CFFAFE", accent: "#06B6D4", accentHover: "#0891B2",
      accentInk: "#FFFFFF", ctrl: "#0891B2", ctrlHover: "#0E7490", soft: "#ECFEFF", line: "#67E8F9",
      title: "#155E75", boardTitle: "#155E75", boardBg: "#FFFFFF", ink: "#0F172A", muted: "#475569",
      border: "#22D3EE", border2: "#A5F3FC", dot: "#CBD5E1", example: "#166534", decorHue: "-27deg",
      glow: ["#67E8F9", "#22D3EE"], particles: ["#22D3EE", "#A5F3FC", "#67E8F9"],
    },
    voice: { gender: "neutral", pitch: 0.55, rate: 0.95, langs: ["en-US", "en-GB", "en-IN"] },
  },
];

// ---------------------------------------------------------------------------
// CSS: the "Utkarsh" scene skin - glass card, teal pill controls, teacher
// stage + strip. The scene is designed at a fixed 860x484 and scaled to fit
// whatever size the iframe is (see fitScene in the script below).
// String.raw keeps backslashes; do not use backticks or ${} inside.
// ---------------------------------------------------------------------------
export const characterCss = String.raw`
/* ---- stage: fixed 860x484, scaled to fit ---- */
html, body { overflow: hidden; }
.video-container { background: linear-gradient(135deg, #EAF4FD 0%, #E2F3F2 100%); }
.video-container .classroom-scene {
  width: 860px !important; height: 484px !important; max-height: none !important;
  flex: none; margin: 0; border-radius: 28px; background: #fff;
  transform: scale(var(--fit, 1)); transform-origin: center center;
  box-shadow: 0 18px 50px rgba(15,60,100,.16);
  font-family: 'Nunito','Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;
}
.classroom-background { background: linear-gradient(180deg, var(--scene-top, #E6F3FD) 0%, var(--scene-bottom, #D3EEF3) 100%); }
.classroom-decor { filter: hue-rotate(var(--decor-hue, 0deg)); }

/* frosted card that holds the title and the whiteboard */
.classroom-scene::before {
  content: ''; position: absolute; left: 14px; top: 12px; width: 584px; height: 336px;
  border-radius: 26px; background: rgba(255,255,255,.6);
  border: 1.5px solid rgba(255,255,255,.95); box-shadow: 0 12px 32px rgba(20,90,130,.12); z-index: 3;
}
.video-container .classroom-scene .video-title {
  left: 14px; top: 20px; width: 584px; transform: none; z-index: 30;
  font: 800 26px/1.2 'Nunito','Segoe UI',sans-serif; color: var(--title-ink, #10205C);
}

/* whiteboard frame: teal gradient border, rounded */
.video-container .classroom-scene .content-board {
  top: 62px; left: 24px; right: auto; bottom: auto; width: 564px; height: 276px; max-height: none;
  box-sizing: border-box; transform: none; padding: 0; overflow: hidden; z-index: 6;
  display: flex; flex-direction: column; border: 4px solid transparent; border-radius: 20px;
  background:
    linear-gradient(var(--board-bg, #fff), var(--board-bg, #fff)) padding-box,
    linear-gradient(135deg, var(--board-border, #14B8A6), var(--board-border2, #86EBD2)) border-box;
  box-shadow: 0 8px 22px rgba(15,118,110,.16);
}

/* teacher stage (right) + teacher strip underneath */
.video-container .classroom-scene .teacher-area {
  left: auto; right: 14px; top: 8px; bottom: auto; transform: none; width: 236px; height: 322px; z-index: 10;
}
#teacher-strip {
  position: absolute; right: 14px; top: 334px; width: 236px; z-index: 12;
  display: flex; justify-content: center; gap: 5px;
}
.ie-chip {
  width: 36px; height: 36px; padding: 0; border-radius: 50%; cursor: pointer; flex: none;
  border: 3px solid transparent; overflow: hidden; background: #DBEAFE;
  transition: transform .15s ease, border-color .15s ease, opacity .15s ease;
}
.ie-chip:hover { transform: scale(1.1); }
.ie-chip.on { border-color: var(--accent, #12958D); box-shadow: 0 0 0 2px #fff inset; }
.ie-chip svg { width: 100%; height: 100%; display: block; }
#teacher-strip .ie-chip { width: 34px; height: 34px; border: 2.5px solid rgba(255,255,255,.95); box-shadow: 0 3px 8px rgba(20,90,130,.2); opacity: .8; }
#teacher-strip .ie-chip.on { opacity: 1; transform: scale(1.14); border-color: var(--accent, #12958D); }

/* controls: white pill, big teal buttons */
.video-container .classroom-scene .video-controls {
  left: 50%; bottom: 14px; transform: translateX(-50%); width: 524px; height: 62px; box-sizing: border-box;
  padding: 0 22px; gap: 16px; justify-content: center; align-items: center; border-radius: 999px;
  background: rgba(255,255,255,.94); box-shadow: 0 10px 28px rgba(15,118,110,.18); z-index: 50;
}
.video-container .classroom-scene .control-btn {
  width: 46px; height: 46px; flex: none; position: relative; background: var(--ctrl, #12958D);
  box-shadow: 0 4px 10px rgba(15,118,110,.25);
}
.video-container .classroom-scene .control-btn:hover { background: var(--ctrl-hover, #0E7C76); }
.video-container .classroom-scene .control-btn svg { width: 22px; height: 22px; }
.video-container .classroom-scene .control-btn.primary {
  width: 196px; padding: 0; border-radius: 999px; gap: 10px; justify-content: center;
  font: 800 19px/1 'Nunito','Segoe UI',sans-serif;
}

/* captions toggle: the classic CC box */
.control-btn.cc-btn { font: 800 11px/1 'Nunito','Segoe UI',sans-serif; letter-spacing: .02em; }
.control-btn.cc-btn::before {
  content: ''; position: absolute; left: 50%; top: 50%; width: 26px; height: 20px;
  margin: -10px 0 0 -13px; border: 2px solid #fff; border-radius: 6px; box-sizing: border-box;
}
.control-btn.cc-btn.off { opacity: .6; }
.control-btn.cc-btn.off::after {
  content: ''; position: absolute; width: 30px; height: 2px; background: #fff;
  transform: rotate(-40deg); border-radius: 2px;
}
body.cc-off #subtitles, body.cc-off .subtitles { display: none !important; }

/* subtitles sit under the whiteboard card */
.video-container .classroom-scene .subtitles {
  left: 306px; bottom: 84px; transform: translateX(-50%); max-width: 540px; z-index: 40;
  background: rgba(16,32,92,.86); border-radius: 14px; padding: 9px 18px;
  font: 600 15px/1.35 'Nunito','Segoe UI',sans-serif;
}

/* settings pop up above the gear button */
.video-container .classroom-scene .video-settings { top: auto; right: auto; left: 536px; bottom: 74px; width: 0; height: 0; z-index: 90; }
.video-container .classroom-scene .settings-dropdown {
  top: auto; bottom: 0; right: auto; left: -140px; width: 280px; max-height: 360px; overflow-y: auto;
  border-radius: 18px; padding: 12px; box-shadow: 0 16px 40px rgba(15,60,100,.25);
}
.settings-item.col { flex-direction: column; align-items: flex-start; gap: 8px; }
.ie-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.ie-teacher-name { font-size: 12px; color: #64748b; }
.ie-teacher-name b { color: #0f172a; font-weight: 600; }
`;

// ---------------------------------------------------------------------------
// Browser script. Expects globals from the lesson page: CHARACTERS (array
// above), voiceSelect, speedSelect, plus seekVideo/getTimelineTime/playing.
// ---------------------------------------------------------------------------
export const characterScript = String.raw`
(function () {
  var KEY_TEACHER = 'ie.teacher', KEY_CAPTIONS = 'ie.captions';
  var current = CHARACTERS[0];

  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function byId(id) {
    for (var i = 0; i < CHARACTERS.length; i++) if (CHARACTERS[i].id === id) return CHARACTERS[i];
    return null;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------ stage fit ------------------------------- */
  // The scene is laid out at 860x484 and scaled to whatever the iframe offers.
  function fitScene() {
    var s = Math.min(window.innerWidth / 860, window.innerHeight / 484) * 0.985;
    document.documentElement.style.setProperty('--fit', String(Math.max(0.2, s)));
  }
  window.addEventListener('resize', fitScene);
  fitScene();

  /* @avatar-start */
  /* ------------------------------ avatar art ------------------------------ */
  // Illustrated half-body portrait. "mini" draws just the head for the picker.
  // Ids kept for the lesson page: cartoon-teacher, head, mouth, mouth-shape,
  // talking-animation, speechStart, background-fx.
  function avatarSvg(c, mini) {
    var L = c.look, T = c.theme, robot = L.style === 'robot';
    function a(x) { return mini ? '' : x; }
    function idAttr(v) { return mini ? '' : ' id="' + v + '"'; }

    function atom(x, y, col, r) {
      var e = 'fill="none" stroke="' + col + '" stroke-width="1.8"';
      return '<g transform="translate(' + x + ',' + y + ') scale(' + (r / 11) + ')">' +
        '<ellipse rx="11" ry="4.2" ' + e + '/>' +
        '<ellipse rx="11" ry="4.2" transform="rotate(60)" ' + e + '/>' +
        '<ellipse rx="11" ry="4.2" transform="rotate(120)" ' + e + '/>' +
        '<circle r="2.3" fill="' + col + '"/></g>';
    }
    function leaf(x, y, col) {
      return '<g transform="translate(' + x + ',' + y + ')">' +
        '<path d="M0,11 C-11,3 -9,-10 5,-13 C13,-6 11,5 0,11 Z" fill="' + col + '"/>' +
        '<path d="M0,11 C2,4 3,-2 5,-10" stroke="#34C98B" stroke-width="1.4" fill="none"/></g>';
    }
    function star(x, y, s, col, dur) {
      return '<path d="M0,-10 Q1.5,-1.5 10,0 Q1.5,1.5 0,10 Q-1.5,1.5 -10,0 Q-1.5,-1.5 0,-10 Z" fill="' + col +
        '" transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
        '<animate attributeName="opacity" values="1;0.25;1" dur="' + dur + 's" repeatCount="indefinite"/></path>';
    }

    function arm(sx) {
      var d0 = 'M' + 76 * sx + ',46 C' + 98 * sx + ',72 ' + 104 * sx + ',106 ' + 98 * sx + ',140';
      var d1 = 'M' + 76 * sx + ',46 C' + 108 * sx + ',64 ' + 122 * sx + ',94 ' + 112 * sx + ',124';
      var d2 = 'M' + 76 * sx + ',46 C' + 90 * sx + ',74 ' + 94 * sx + ',110 ' + 88 * sx + ',144';
      var anim = '<animate attributeName="d" values="' + d0 + ';' + d1 + ';' + d2 + ';' + d0 + '" dur="5s" repeatCount="indefinite"/>';
      return '<path d="' + d0 + '" stroke="' + L.bodyDark + '" stroke-width="23" stroke-linecap="round" fill="none">' + anim + '</path>' +
        '<path d="' + d0 + '" stroke="' + L.body + '" stroke-width="19" stroke-linecap="round" fill="none">' + anim + '</path>' +
        '<circle cx="' + 98 * sx + '" cy="140" r="9" fill="' + L.hand + '">' +
        '<animate attributeName="cx" values="' + 98 * sx + ';' + 112 * sx + ';' + 88 * sx + ';' + 98 * sx + '" dur="5s" repeatCount="indefinite"/>' +
        '<animate attributeName="cy" values="140;124;144;140" dur="5s" repeatCount="indefinite"/></circle>';
    }

    function bodySvg() {
      var b = '<path d="M-82,170 C-82,66 -56,22 -24,10 C-13,22 13,22 24,10 C56,22 82,66 82,170 Z" fill="' + L.body +
        '" stroke="' + L.bodyDark + '" stroke-width="3"/>';
      b += arm(-0.82) + arm(0.82);
      if (L.outfit === 'coat') {
        b += '<path d="M-26,8 Q0,24 26,8 L16,170 L-16,170 Z" fill="' + L.inner + '"/>' +
          '<path d="M-26,8 L-52,46 L-22,126" stroke="' + L.bodyDark + '" stroke-width="3" fill="none" stroke-linejoin="round"/>' +
          '<path d="M26,8 L52,46 L22,126" stroke="' + L.bodyDark + '" stroke-width="3" fill="none" stroke-linejoin="round"/>' +
          '<rect x="-17" y="-8" width="34" height="28" rx="10" fill="' + L.inner + '"/>';
      } else if (L.outfit === 'jacket') {
        b += '<path d="M-26,8 L0,76 L26,8 Z" fill="' + L.inner + '"/>' +
          '<path d="M-26,8 L-9,40 L-2,14 Z" fill="#fff" stroke="' + L.bodyDark + '" stroke-width="1.5"/>' +
          '<path d="M26,8 L9,40 L2,14 Z" fill="#fff" stroke="' + L.bodyDark + '" stroke-width="1.5"/>' +
          '<path d="M-12,-10 L12,-10 L12,16 L0,30 L-12,16 Z" fill="' + L.skin + '"/>';
      } else if (L.outfit === 'tee') {
        b += '<path d="M-25,10 Q0,44 25,10 Z" fill="' + L.skin + '"/><path d="M-25,10 Q0,44 25,10" stroke="' + L.bodyDark + '" stroke-width="3" fill="none"/>';
        b += '<path d="M-13,-10 L13,-10 L13,22 Q0,32 -13,22 Z" fill="' + L.skin + '"/>';
      } else if (L.outfit === 'polo') {
        b += '<path d="M-26,10 L0,40 L26,10 Z" fill="' + L.skin + '"/>' +
          '<path d="M-27,8 L-14,34 L-3,16 Z" fill="' + L.bodyDark + '"/><path d="M27,8 L14,34 L3,16 Z" fill="' + L.bodyDark + '"/>';
        b += '<path d="M-13,-10 L13,-10 L13,20 Q0,30 -13,20 Z" fill="' + L.skin + '"/>';
      } else if (robot) {
        b += '<rect x="-18" y="-10" width="36" height="26" rx="8" fill="' + L.skin2 + '"/>';
      }
      if (L.badge === 'atom') b += atom(L.outfit === 'coat' ? 58 : 0, 82, L.badgeColor, 13);
      if (L.badge === 'leaf') b += leaf(34, 78, L.badgeColor);
      if (L.badge === 'tie') {
        b += '<path d="M-7,24 L7,24 L5,34 L-5,34 Z" fill="' + L.badgeColor + '"/>' +
          '<path d="M-5,34 L5,34 L10,92 L0,104 L-10,92 Z" fill="' + L.badgeColor + '"/>';
      }
      if (L.badge === 'panel') {
        b += '<rect x="-30" y="26" width="60" height="38" rx="9" fill="#0F172A"/>' +
          '<circle cx="-14" cy="45" r="5" fill="' + L.badgeColor + '"><animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/></circle>' +
          '<circle cx="2" cy="45" r="5" fill="' + L.badgeColor + '"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite"/></circle>' +
          '<rect x="14" y="41" width="11" height="8" rx="3" fill="' + L.badgeColor + '"/>';
      }
      return b;
    }

    function eye(cx) {
      var blink = a('<animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 0.08;1 1" keyTimes="0;0.9;0.95;1" dur="4.2s" repeatCount="indefinite"/>');
      return '<g transform="translate(' + cx + ',-2)"><g>' + blink +
        '<ellipse rx="12.5" ry="14" fill="#fff"/>' +
        '<ellipse rx="9" ry="11.5" cy="1" fill="' + L.eyeColor + '"/>' +
        '<ellipse rx="4.6" ry="6.4" cy="1.5" fill="#1B1830"/>' +
        '<circle cx="-3.2" cy="-4" r="3.4" fill="#fff"/><circle cx="3.6" cy="4.4" r="1.7" fill="#fff"/></g>' +
        '<path d="M-14,-8 Q0,-19 14,-8" stroke="#2B2540" stroke-width="3" stroke-linecap="round" fill="none"/></g>';
    }

    function headSvg() {
      var h = '', hs = L.hairStyle;
      if (!robot) {
        // hair that sits behind the face
        if (hs === 'ponytail') {
          h += '<path d="M-40,-34 C-96,-40 -112,24 -80,60 C-72,40 -62,22 -44,4 Z" fill="' + L.hair + '"/>' +
            '<circle cx="-47" cy="-14" r="6.5" fill="' + L.accessoryColor + '"/>';
        } else if (hs === 'long') {
          h += '<path d="M-50,-24 C-76,26 -70,84 -54,112 C-44,86 -40,44 -40,8 Z" fill="' + L.hair + '"/>' +
            '<path d="M50,-24 C76,26 70,84 54,112 C44,86 40,44 40,8 Z" fill="' + L.hair + '"/>';
        } else if (hs === 'bun') {
          h += '<circle cx="14" cy="-88" r="21" fill="' + L.hair + '"/>';
        }
        if (hs !== 'none') h += '<ellipse cx="0" cy="-12" rx="48" ry="60" fill="' + L.hair + '"/>';
        // ears
        h += '<circle cx="-42" cy="6" r="7" fill="' + L.skin + '"/><circle cx="42" cy="6" r="7" fill="' + L.skin + '"/>';
      }
      // face
      if (L.head === 'square') {
        h += '<rect x="-52" y="-52" width="104" height="104" rx="26" fill="' + L.skin + '"/>';
      } else {
        h += '<ellipse cx="0" cy="2" rx="42" ry="52" fill="' + L.skin + '">' +
          a('<animate attributeName="ry" values="52;53.5;51.5;52" dur="2s" repeatCount="indefinite"/>') + '</ellipse>';
      }
      if (L.beard) {
        h += '<path d="M-44,12 Q-44,64 0,66 Q44,64 44,12 Q30,36 0,36 Q-30,36 -44,12 Z" fill="' + L.beard + '"/>';
      }
      // front hair (fringe)
      if (!robot && hs !== 'none') {
        if (hs === 'short') {
          h += '<path d="M-50,-4 C-60,-58 -28,-76 0,-76 C30,-76 60,-58 50,-4 C44,-30 28,-46 0,-46 C-28,-46 -44,-30 -50,-4 Z" fill="' + L.hair + '"/>';
        } else {
          h += '<path d="M-50,-4 C-62,-60 -24,-84 8,-80 C44,-78 62,-48 50,-4 C46,-24 34,-38 16,-44 C4,-34 -18,-42 -30,-28 C-40,-20 -46,-12 -50,-4 Z" fill="' + L.hair + '"/>';
        }
      }
      if (L.accessories.indexOf('headband') !== -1) {
        h += '<path d="M-52,-34 C-30,-68 30,-68 52,-34" stroke="' + L.accessoryColor + '" stroke-width="9" stroke-linecap="round" fill="none"/>';
      }
      // eyes
      if (L.eyeBg) {
        h += '<rect x="-38" y="-24" width="32" height="28" rx="9" fill="' + L.eyeBg + '"/><rect x="6" y="-24" width="32" height="28" rx="9" fill="' + L.eyeBg + '"/>' +
          '<circle cx="-22" cy="-10" r="8" fill="' + L.eyeColor + '"><animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite"/></circle>' +
          '<circle cx="22" cy="-10" r="8" fill="' + L.eyeColor + '"><animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite"/></circle>';
      } else {
        h += eye(-21) + eye(21);
      }
      if (L.brow) {
        var bw = L.beard || L.skin === '#E6B089' ? 4.6 : 3.6;
        h += '<g>' + a('<animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="3s" repeatCount="indefinite"/>') +
          '<path d="M-31,-25 Q-20,-31 -9,-26" stroke="' + L.brow + '" stroke-width="' + bw + '" stroke-linecap="round" fill="none"/>' +
          '<path d="M9,-26 Q20,-31 31,-25" stroke="' + L.brow + '" stroke-width="' + bw + '" stroke-linecap="round" fill="none"/></g>';
      }
      if (L.nose) h += '<path d="M-2.5,17 Q0,20 2.5,17" stroke="' + L.skin2 + '" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
      if (!robot) {
        h += '<ellipse cx="-31" cy="15" rx="8" ry="4.6" fill="#FB7185" opacity="0.3"/><ellipse cx="31" cy="15" rx="8" ry="4.6" fill="#FB7185" opacity="0.3"/>';
      }
      // mouth - keeps the ids the lesson page uses for lip-sync
      h += '<g' + idAttr('mouth') + '><path' + idAttr('mouth-shape') + ' d="M-13,28 Q0,32 13,28" fill="' + L.mouth + '" stroke="' + L.skin2 + '" stroke-width="1.5" stroke-linejoin="round">' +
        a('<animate id="talking-animation" attributeName="d" values="M-13,28 Q0,31 13,28;M-13,28 Q0,44 13,28;M-13,28 Q0,28 13,28;M-13,26 Q0,40 13,26;M-10,28 Q0,48 10,28;M-13,28 Q0,31 13,28" dur="0.4s" repeatCount="indefinite" begin="speechStart.begin"/>' +
          '<animate attributeName="d" values="M-13,28 Q0,31 13,28;M-13,28.5 Q0,32 13,28.5;M-13,28 Q0,31 13,28" dur="4s" repeatCount="indefinite" begin="0s"/>') + '</path></g>';
      // accessories
      if (L.accessories.indexOf('glasses') !== -1) {
        h += '<circle cx="-21" cy="-2" r="17.5" fill="#fff" fill-opacity="0.14" stroke="' + L.accessoryColor + '" stroke-width="3"/>' +
          '<circle cx="21" cy="-2" r="17.5" fill="#fff" fill-opacity="0.14" stroke="' + L.accessoryColor + '" stroke-width="3"/>' +
          '<path d="M-3.5,-4 Q0,-8 3.5,-4" stroke="' + L.accessoryColor + '" stroke-width="3" fill="none"/>' +
          '<path d="M-38.5,-4 L-47,-1 M38.5,-4 L47,-1" stroke="' + L.accessoryColor + '" stroke-width="3" fill="none"/>';
      }
      if (L.accessories.indexOf('antenna') !== -1) {
        h += '<line x1="0" y1="-52" x2="0" y2="-80" stroke="' + L.skin2 + '" stroke-width="5" stroke-linecap="round"/>' +
          '<circle cx="0" cy="-88" r="8" fill="' + L.accessoryColor + '"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/></circle>';
      }
      return h;
    }

    if (mini) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-72 -96 144 144" aria-hidden="true">' + headSvg() + '</svg>';
    }
    var glowRing = '<circle cx="150" cy="200" r="132" fill="none" stroke="' + T.glow[0] + '" stroke-width="3" opacity="0.9">' +
      '<animate attributeName="opacity" values="0.9;0.55;0.9" dur="3.4s" repeatCount="indefinite"/></circle>' +
      '<circle cx="150" cy="200" r="141" fill="none" stroke="' + T.glow[1] + '" stroke-width="9" opacity="0.2"/>';
    return '<svg width="100%" height="100%" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="radial-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="' + T.glow[0] + '" stop-opacity="0.6"/><stop offset="100%" stop-color="' + T.glow[1] + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="fade-grad" gradientUnits="userSpaceOnUse" x1="0" y1="96" x2="0" y2="162"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
      '<mask id="fade-mask" maskUnits="userSpaceOnUse" x="-170" y="-200" width="340" height="400"><rect x="-170" y="-200" width="340" height="400" fill="url(#fade-grad)"/></mask></defs>' +
      '<g id="background-fx"><circle cx="150" cy="200" r="140" fill="url(#radial-glow)"><animate attributeName="r" values="140;150;140" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0.5;0.8" dur="6s" repeatCount="indefinite"/></circle>' +
      glowRing + star(262, 100, 1.1, T.glow[0], 2.6) + star(36, 150, 0.7, '#fff', 3.2) + star(250, 270, 0.9, T.glow[0], 3.8) +
      '<circle cx="64" cy="90" r="4" fill="' + T.particles[0] + '"><animate attributeName="cy" values="90;110;80;100;90" dur="10s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0.3;0.8" dur="4s" repeatCount="indefinite"/></circle>' +
      '<circle cx="236" cy="70" r="5" fill="' + T.particles[1] + '"><animate attributeName="cy" values="70;90;60;80;70" dur="9s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0.3;0.7" dur="5s" repeatCount="indefinite"/></circle>' +
      '<circle cx="270" cy="210" r="4" fill="' + T.particles[2] + '"><animate attributeName="cy" values="210;230;200;220;210" dur="14s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0.4;0.8" dur="6s" repeatCount="indefinite"/></circle></g>' +
      '<g id="cartoon-teacher" transform="translate(150, 200)"><g>' +
      '<animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="2.4s" repeatCount="indefinite"/>' +
      '<g mask="url(#fade-mask)">' + bodySvg() + '</g>' +
      '<g transform="translate(0, -60)"><g id="head"><animateTransform attributeName="transform" type="rotate" values="0 0 0; 3 0 0; 0 0 0; -3 0 0; 0 0 0" dur="6s" repeatCount="indefinite"/>' + headSvg() + '</g></g>' +
      '</g></g>' +
      '<animate id="speechStart" begin="indefinite" dur="0.1s" attributeName="opacity" from="1" to="1"/></svg>';
  }
  /* @avatar-end */

  /* ------------------------------- theme ---------------------------------- */
  function applyTheme(T) {
    var r = document.documentElement.style;
    var map = {
      '--scene-top': T.sceneTop, '--scene-bottom': T.sceneBottom,
      '--accent': T.accent, '--accent-hover': T.accentHover, '--accent-ink': T.accentInk,
      '--ctrl': T.ctrl, '--ctrl-hover': T.ctrlHover,
      '--accent-soft': T.soft, '--accent-line': T.line, '--title-ink': T.title,
      '--board-title': T.boardTitle || T.title,
      '--board-bg': T.boardBg, '--board-ink': T.ink, '--board-muted': T.muted,
      '--board-border': T.border, '--board-border2': T.border2 || T.border,
      '--board-dot': T.dot, '--board-ex': T.example,
      '--board-font': T.boardFont || "'Nunito','Segoe UI',sans-serif",
      '--decor-hue': T.decorHue
    };
    for (var k in map) r.setProperty(k, map[k]);
  }

  /* -------------------------------- voices -------------------------------- */
  var FEMALE = /(female|woman|zira|samantha|aria|jenny|hazel|susan|heera|priya|veena|karen|moira|tessa|fiona|victoria|allison|ava|emma|michelle|sonia|libby|natasha|neerja|swara|kalpana|lekha|kajal|raveena|amy|joanna|salli|kendra|ivy)/i;
  var MALE = /(\bmale\b|david|mark|daniel|george|guy|ryan|james|ravi|hemant|prabhat|rishi|alex|fred|thomas|oliver|arthur|eric|christopher|brian|liam|connor|aaron|madhur|matthew|joey|justin|kevin|russell)/i;

  function genderOf(v) {
    var n = v.name || '';
    if (FEMALE.test(n) && !/\bmale\b/i.test(n.replace(/female/i, ''))) return 'female';
    if (MALE.test(n)) return 'male';
    return null;
  }
  function scoreVoice(v, vc) {
    var s = 0, lang = String(v.lang || '').replace('_', '-').toLowerCase();
    for (var i = 0; i < vc.langs.length; i++) {
      if (lang.indexOf(vc.langs[i].toLowerCase()) === 0) { s += 30 - i * 6; break; }
    }
    var g = genderOf(v);
    if (vc.gender !== 'neutral' && g) s += (g === vc.gender) ? 40 : -40;
    if (v.localService) s += 6; // local voices report word positions reliably (keeps board/captions in sync)
    return s;
  }
  function englishVoices() {
    var all = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    var en = all.filter(function (v) { return String(v.lang || '').toLowerCase().indexOf('en') !== -1; });
    return en.length ? en : all;
  }

  // Picks the voice + pitch/rate for the current teacher (or the student's manual choice).
  window.pickSpeechVoice = function () {
    var list = englishVoices(), vc = current.voice, sel = voiceSelect.value;
    if (sel && sel !== 'auto') {
      for (var i = 0; i < list.length; i++) {
        if (list[i].voiceURI === sel) return { voice: list[i], pitch: 1, rate: vc.rate };
      }
    }
    var best = null, bestScore = -1e9;
    list.forEach(function (v) {
      var s = scoreVoice(v, vc);
      if (s > bestScore) { best = v; bestScore = s; }
    });
    var pitch = vc.pitch;
    // A genuinely matching voice only needs a light nudge; otherwise shift fully.
    if (best && vc.gender !== 'neutral' && genderOf(best) === vc.gender) pitch = 1 + (vc.pitch - 1) * 0.35;
    return { voice: best, pitch: pitch, rate: vc.rate };
  };

  window.populateVoiceList = function () {
    var list = englishVoices();
    if (!list.length) return;
    var prev = voiceSelect.value;
    voiceSelect.innerHTML = '<option value="auto">Auto (matches teacher)</option>';
    var keep = false;
    list.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v.voiceURI;
      o.textContent = v.name + (v.lang ? ' (' + v.lang + ')' : '');
      voiceSelect.appendChild(o);
      if (v.voiceURI === prev) keep = true;
    });
    voiceSelect.value = keep ? prev : 'auto';
  };

  function speakHello(c) {
    if (!window.speechSynthesis) return;
    var ch = window.pickSpeechVoice();
    var u = new SpeechSynthesisUtterance(c.greeting);
    u.pitch = ch.pitch; u.rate = ch.rate;
    if (ch.voice) { try { u.voice = ch.voice; } catch (e) {} }
    var talk = function () { var el = document.getElementById('speechStart'); if (el && el.beginElement) el.beginElement(); };
    u.onstart = talk; u.onboundary = talk;
    window.speechSynthesis.speak(u);
  }

  /* ------------------------------- teacher -------------------------------- */
  function highlight() {
    var chips = document.querySelectorAll('.ie-chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('on', chips[i].getAttribute('data-id') === current.id);
    var n = document.getElementById('teacher-name');
    if (n) n.innerHTML = '<b>' + esc(current.name) + '</b> &middot; ' + esc(current.tagline);
  }

  function setTeacher(id, userAction) {
    current = byId(id) || CHARACTERS[0];
    applyTheme(current.theme);
    var box = document.getElementById('teacher-container');
    if (box) box.innerHTML = avatarSvg(current, false);
    highlight();
    save(KEY_TEACHER, current.id);
    voiceSelect.value = 'auto'; // the voice follows the teacher
    if (!userAction) return;
    try {
      if (playing) {
        seekVideo(getTimelineTime(), true); // carry on from here with the new voice
      } else {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        speakHello(current);
      }
    } catch (e) {}
  }

  // Fills a container with one round face per teacher (used by the strip under
  // the stage and by the picker inside Settings).
  function fillPicker(picker) {
    if (!picker) return;
    CHARACTERS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ie-chip';
      b.setAttribute('data-id', c.id);
      b.title = c.name + ' - ' + c.tagline;
      b.setAttribute('aria-label', 'Teacher: ' + c.name);
      b.style.background = c.theme.sceneBottom;
      b.innerHTML = avatarSvg(c, true);
      b.addEventListener('click', function () { setTeacher(c.id, true); });
      picker.appendChild(b);
    });
  }

  function buildPicker() {
    fillPicker(document.getElementById('teacher-picker'));
    var scene = document.querySelector('.classroom-scene');
    if (scene) {
      var strip = document.getElementById('teacher-strip');
      if (!strip) {
        strip = document.createElement('div');
        strip.id = 'teacher-strip';
        strip.setAttribute('role', 'group');
        strip.setAttribute('aria-label', 'Choose your teacher');
        scene.appendChild(strip);
      }
      fillPicker(strip);
    }
  }

  /* ------------------------------- captions ------------------------------- */
  var ccBtn = document.getElementById('cc-btn');
  var ccSelect = document.getElementById('cc-select');
  function setCaptions(on, persist) {
    document.body.classList.toggle('cc-off', !on);
    if (ccBtn) { ccBtn.classList.toggle('off', !on); ccBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    if (ccSelect) ccSelect.value = on ? 'on' : 'off';
    if (persist) save(KEY_CAPTIONS, on ? 'on' : 'off');
  }
  if (ccBtn) ccBtn.addEventListener('click', function () { setCaptions(document.body.classList.contains('cc-off'), true); });
  if (ccSelect) ccSelect.addEventListener('change', function () { setCaptions(ccSelect.value === 'on', true); });

  /* --------------------------------- init --------------------------------- */
  buildPicker();
  setTeacher(load(KEY_TEACHER) || CHARACTERS[0].id, false);
  setCaptions(load(KEY_CAPTIONS) !== 'off', false);
})();
`;
