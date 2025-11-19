// Very small demo dictionary.
// In a real app you’d replace this with a large word list or backend API.
const wordList = [
  "a","able","about","above","accept","access","across","add","after","again",
  "air","all","also","always","an","and","another","any","anything","are","area",
  "as","ask","at","back","because","been","before","best","better","between",
  "big","book","but","by","call","can","case","change","child","city","clear",
  "come","company","computer","control","course","day","do","down","drive",
  "each","early","easy","end","even","every","example","eye","fact","family",
  "feel","few","find","first","follow","for","form","from","game","get","give",
  "go","good","great","group","hand","hard","have","head","help","here","high",
  "home","house","how","important","in","interest","into","it","its","just",
  "keep","kind","know","large","last","late","learn","leave","let","life","like",
  "line","list","little","live","long","look","lot","love","make","man","many",
  "may","mean","might","more","most","move","much","need","never","new","next",
  "no","not","now","number","off","old","on","one","only","open","or","other",
  "our","out","over","own","part","people","place","point","possible","power",
  "problem","public","put","question","real","right","run","same","say","school",
  "see","seem","set","she","should","show","side","small","so","some","something",
  "start","state","still","story","such","system","take","tell","than","that",
  "the","their","them","then","there","these","they","thing","think","this",
  "those","time","to","today","too","try","turn","under","up","use","very","want",
  "way","we","well","what","when","where","which","who","why","will","with","word",
  "work","world","would","write","year","you","your"
];
const DICTIONARY = new Set(wordList);

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const typingArea = document.getElementById('typingArea');
const timeLeftEl = document.getElementById('timeLeft');
const wpmEl = document.getElementById('wpm');
const correctWordsEl = document.getElementById('correctWords');
const errorWordsEl = document.getElementById('errorWords');
const totalWordsEl = document.getElementById('totalWords');

const hoursValueEl = document.getElementById('hoursValue');
const minutesValueEl = document.getElementById('minutesValue');
const secondsValueEl = document.getElementById('secondsValue');
const noTimerCheckbox = document.getElementById('noTimerCheckbox');

let timerId = null;
let isRunning = false;
let startTime = null;
let isTimedMode = true;
let initialDurationSeconds = 60; // default 1 minute

/* ---------- Helpers ---------- */

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeWord(token) {
  return token.toLowerCase().replace(/[^a-z']/g, "");
}

function analyzeText(text) {
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  let total = 0;
  let correct = 0;
  let errors = 0;

  for (const token of rawWords) {
    const norm = normalizeWord(token);
    if (!norm) continue;
    total++;
    if (DICTIONARY.has(norm)) {
      correct++;
    } else {
      errors++;
    }
  }

  return { total, correct, errors };
}

function rebuildWithHighlights() {
  const text = typingArea.innerText;
  const tokens = text.split(/(\s+)/); // keep whitespace

  const html = tokens.map(token => {
    if (/^\s+$/.test(token)) {
      return token.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>");
    }
    const norm = normalizeWord(token);
    if (!norm) {
      return escapeHtml(token);
    }
    if (DICTIONARY.has(norm)) {
      return escapeHtml(token);
    } else {
      return `<span class="word-error">${escapeHtml(token)}</span>`;
    }
  }).join("");

  typingArea.innerHTML = html;
  placeCaretAtEnd(typingArea);
}

function placeCaretAtEnd(el) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function updateStats() {
  const text = typingArea.innerText;
  const { total, correct, errors } = analyzeText(text);

  const now = Date.now();
  const elapsedMs = startTime ? (now - startTime) : 0;
  const elapsedMinutes = elapsedMs > 0 ? (elapsedMs / 1000) / 60 : 1;
  const wpm = Math.round(correct / elapsedMinutes);

  wpmEl.textContent = isFinite(wpm) ? wpm : 0;
  correctWordsEl.textContent = correct;
  errorWordsEl.textContent = errors;
  totalWordsEl.textContent = total;
}

/* ---------- Time config ---------- */

function getSelectedDurationSeconds() {
  const h = parseInt(hoursValueEl.textContent, 10) || 0;
  const m = parseInt(minutesValueEl.textContent, 10) || 0;
  const s = parseInt(secondsValueEl.textContent, 10) || 0;
  return h * 3600 + m * 60 + s;
}

function updateTimeLeftDisplay() {
  if (noTimerCheckbox.checked) {
    timeLeftEl.textContent = "∞";
    return;
  }
  const total = getSelectedDurationSeconds() || 60; // fallback
  initialDurationSeconds = total;
  timeLeftEl.textContent = total.toString();
}

function adjustTime(unit, delta) {
  let el;
  let max = 59;
  if (unit === "hours") {
    el = hoursValueEl;
    max = 5; // cap hours a bit (change if you want)
  } else if (unit === "minutes") {
    el = minutesValueEl;
  } else if (unit === "seconds") {
    el = secondsValueEl;
  } else {
    return;
  }

  let current = parseInt(el.textContent, 10) || 0;
  let next = current + delta;
  if (next < 0) next = 0;
  if (next > max) next = max;
  el.textContent = next.toString();

  if (!isRunning) {
    updateTimeLeftDisplay();
  }
}

function setTimeControlsEnabled(enabled) {
  document.querySelectorAll(".time-btn").forEach(btn => {
    btn.disabled = !enabled;
  });
  noTimerCheckbox.disabled = !enabled;
}

/* ---------- Test control ---------- */

function startTest() {
  if (isRunning) return;

  isTimedMode = !noTimerCheckbox.checked;
  if (isTimedMode) {
    const total = getSelectedDurationSeconds() || 60;
    initialDurationSeconds = total;
    timeLeftEl.textContent = total.toString();
  } else {
    initialDurationSeconds = null;
    timeLeftEl.textContent = "∞";
  }

  typingArea.innerHTML = "";
  typingArea.classList.remove("disabled");
  typingArea.classList.add("active");
  typingArea.setAttribute("contenteditable", "true");
  typingArea.focus();

  wpmEl.textContent = "0";
  correctWordsEl.textContent = "0";
  errorWordsEl.textContent = "0";
  totalWordsEl.textContent = "0";

  startBtn.disabled = true;
  stopBtn.disabled = false;
  resetBtn.disabled = false;
  setTimeControlsEnabled(false);

  startTime = Date.now();
  isRunning = true;

  timerId = setInterval(() => {
    if (!isRunning) return;

    updateStats();

    if (isTimedMode && initialDurationSeconds != null) {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, initialDurationSeconds - elapsedSeconds);
      timeLeftEl.textContent = remaining.toString();

      if (remaining <= 0) {
        stopTest(true);
      }
    }
    // In no-timer mode, we just keep updating stats; time shows ∞
  }, 1000);
}

function stopTest(auto = false) {
  if (!isRunning) return;

  isRunning = false;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  rebuildWithHighlights();
  updateStats();

  typingArea.classList.remove("active");
  typingArea.classList.add("disabled");
  typingArea.setAttribute("contenteditable", "false");

  startBtn.disabled = false;
  stopBtn.disabled = true;
  // Reset button stays enabled so user can clear and reconfigure
  setTimeControlsEnabled(true);

  // If auto stop from timer, timeLeftEl is already at 0
  if (!isTimedMode) {
    // keep ∞ display for no-timer mode after stopping
    timeLeftEl.textContent = "∞";
  }
}

function resetTest() {
  if (timerId) clearInterval(timerId);
  timerId = null;
  isRunning = false;
  startTime = null;

  typingArea.innerHTML = "";
  typingArea.classList.add("disabled");
  typingArea.classList.remove("active");
  typingArea.setAttribute("contenteditable", "false");

  wpmEl.textContent = "0";
  correctWordsEl.textContent = "0";
  errorWordsEl.textContent = "0";
  totalWordsEl.textContent = "0";

  startBtn.disabled = false;
  stopBtn.disabled = true;
  resetBtn.disabled = true;
  setTimeControlsEnabled(true);

  updateTimeLeftDisplay();
}

/* ---------- Event wiring ---------- */

startBtn.addEventListener('click', startTest);
stopBtn.addEventListener('click', () => stopTest(false));
resetBtn.addEventListener('click', resetTest);

typingArea.addEventListener('input', () => {
  if (!isRunning) return;
  window.requestAnimationFrame(() => {
    rebuildWithHighlights();
    updateStats();
  });
});

document.querySelectorAll(".time-btn").forEach(btn => {
  btn.addEventListener('click', () => {
    const unit = btn.getAttribute("data-unit");
    const isPlus = btn.classList.contains("plus");
    adjustTime(unit, isPlus ? 1 : -1);
  });
});

noTimerCheckbox.addEventListener('change', () => {
  if (!isRunning) {
    updateTimeLeftDisplay();
  }
});

/* ---------- Initial setup ---------- */

updateTimeLeftDisplay();
setTimeControlsEnabled(true);
stopBtn.disabled = true;
resetBtn.disabled = true;