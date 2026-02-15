// Dictionary and state
const localWordList = [
    "a", "able", "about", "above", "accept", "access", "across", "add", "after", "again",
    "air", "all", "also", "always", "an", "and", "another", "any", "anything", "are", "area",
    "as", "ask", "at", "back", "because", "been", "before", "best", "better", "between",
    "big", "book", "but", "by", "call", "can", "case", "change", "child", "city", "clear",
    "come", "company", "computer", "control", "course", "day", "do", "down", "drive",
    "each", "early", "easy", "end", "even", "every", "example", "eye", "fact", "family",
    "feel", "few", "find", "first", "follow", "for", "form", "from", "game", "get", "give",
    "go", "good", "great", "group", "hand", "hard", "have", "head", "help", "here", "high",
    "home", "house", "how", "important", "in", "interest", "into", "it", "its", "just",
    "keep", "kind", "know", "large", "last", "late", "learn", "leave", "let", "life", "like",
    "line", "list", "little", "live", "long", "look", "lot", "love", "make", "man", "many",
    "may", "mean", "might", "more", "most", "move", "much", "need", "never", "new", "next",
    "no", "not", "now", "number", "off", "old", "on", "one", "only", "open", "or", "other",
    "our", "out", "over", "own", "part", "people", "place", "point", "possible", "power",
    "problem", "public", "put", "question", "real", "right", "run", "same", "say", "school",
    "see", "seem", "set", "she", "should", "show", "side", "small", "so", "some", "something",
    "start", "state", "still", "story", "such", "system", "take", "tell", "than", "that",
    "the", "their", "them", "then", "there", "these", "they", "thing", "think", "this",
    "those", "time", "to", "today", "too", "try", "turn", "under", "up", "use", "very", "want",
    "way", "we", "well", "what", "when", "where", "which", "who", "why", "will", "with", "word",
    "work", "world", "would", "write", "year", "you", "your"
];
const LOCAL_DICTIONARY = new Set(localWordList);
const apiWordCache = Object.create(null);

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const typingArea = document.getElementById('typingArea');
const timeLeftEl = document.getElementById('timeLeft');
const overlayTimeLeftEl = document.getElementById('overlayTimeLeft');
const wpmEl = document.getElementById('wpm');
const overlayWpmEl = document.getElementById('overlayWpm');
const correctWordsEl = document.getElementById('correctWords');
const errorWordsEl = document.getElementById('errorWords');
const totalWordsEl = document.getElementById('totalWords');

const hoursValueEl = document.getElementById('hoursValue');
const minutesValueEl = document.getElementById('minutesValue');
const secondsValueEl = document.getElementById('secondsValue');
const noTimerCheckbox = document.getElementById('noTimerCheckbox');
const themeToggle = document.getElementById('themeToggle');
const validationModeInputs = document.querySelectorAll('input[name="validationMode"]');
const overlayLaunchBtn = document.getElementById('overlayToggleBtn');
const overlayPanel = document.getElementById('overlayPanel');
const overlayStartBtn = document.getElementById('overlayStartBtn');
const overlayStopBtn = document.getElementById('overlayStopBtn');
const overlayResetBtn = document.getElementById('overlayResetBtn');
const overlayHideBtn = document.getElementById('overlayHideBtn');
const overlayStatusEl = document.getElementById('overlayStatus');
const isOverlayWindow = window.location.hash === "#overlay";
const bridge = window.wpmBridge;

let timerId = null;
let isRunning = false;
let startTime = null;
let isTimedMode = true;
let initialDurationSeconds = 60;
let validationMode = "strict";

// Theme management
function applyTheme(theme) {
    const body = document.body;
    if (theme === "dark") {
        body.classList.add("dark-theme");
        themeToggle.checked = true;
    } else {
        body.classList.remove("dark-theme");
        themeToggle.checked = false;
    }
}

function initTheme() {
    try {
        const saved = localStorage.getItem("wpmTheme");
        if (saved === "dark" || saved === "light") {
            applyTheme(saved);
            return;
        }
    } catch (_) {
        // ignore storage errors
    }
    applyTheme("light");
}

themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "dark" : "light";
    applyTheme(newTheme);
    try {
        localStorage.setItem("wpmTheme", newTheme);
    } catch (_) {
        // ignore
    }
});

// Helpers
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function normalizeWord(token) {
    return token.toLowerCase().replace(/[^a-z']/g, "");
}

function getWordStatus(token) {
    if (validationMode === "freeform") {
        return token.trim().length ? "valid" : "ignore";
    }

    const word = normalizeWord(token);
    if (!word) return "ignore";
    if (/^\d+$/.test(word)) return "valid";

    if (LOCAL_DICTIONARY.has(word)) return "valid";

    const cached = apiWordCache[word];
    if (cached === true) return "valid";
    if (cached === false) return "invalid";

    fetchWordValidity(word);
    return "unknown";
}

function fetchWordValidity(word) {
    if (apiWordCache[word] === "pending") return;
    apiWordCache[word] = "pending";

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
        .then(res => {
            apiWordCache[word] = res.ok;
        })
        .catch(() => {
            apiWordCache[word] = false;
        })
        .finally(() => {
            if (typingArea.innerText.trim().length > 0) {
                rebuildWithHighlights();
                updateStats();
            }
        });
}

function analyzeText(text) {
    const rawWords = text.trim().split(/\s+/).filter(Boolean);
    let total = 0;
    let correct = 0;
    let errors = 0;

    for (const token of rawWords) {
        const status = getWordStatus(token);
        if (status === "ignore" || status === "unknown") continue;
        total++;
        if (status === "valid") {
            correct++;
        } else {
            errors++;
        }
    }

    return { total, correct, errors };
}

function rebuildWithHighlights() {
    const text = typingArea.innerText;
    const tokens = text.split(/(\s+)/);

    const html = tokens
        .map(token => {
            if (/^\s+$/.test(token)) {
                return token.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>");
            }
            const status = getWordStatus(token);
            if (status === "invalid") {
                return `<span class="word-error">${escapeHtml(token)}</span>`;
            }
            return escapeHtml(token);
        })
        .join("");

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
    const elapsedMs = startTime ? now - startTime : 0;
    const elapsedMinutes = elapsedMs > 0 ? (elapsedMs / 1000) / 60 : 1;
    const wpm = Math.round(correct / elapsedMinutes);

    wpmEl.textContent = isFinite(wpm) ? wpm : 0;
    overlayWpmEl.textContent = isFinite(wpm) ? wpm : 0;
    correctWordsEl.textContent = correct;
    errorWordsEl.textContent = errors;
    totalWordsEl.textContent = total;
    sendStatsUpdate();
}

function setTimeLeftDisplayValue(value) {
    timeLeftEl.textContent = value;
    overlayTimeLeftEl.textContent = value;
    sendStatsUpdate();
}

function sendStatsUpdate() {
    if (isOverlayWindow || !bridge || typeof bridge.sendStats !== "function") return;
    bridge.sendStats({
        wpm: wpmEl.textContent,
        timeLeft: timeLeftEl.textContent,
        status: isRunning ? "running" : "idle"
    });
}

function updateOverlayStatus() {
    overlayStatusEl.textContent = isRunning ? "Running · background overlay" : "Idle · stays on top";
}

function handleOverlayStatsIncoming(data) {
    if (!data) return;
    if (typeof data.wpm !== "undefined") overlayWpmEl.textContent = data.wpm;
    if (typeof data.timeLeft !== "undefined") overlayTimeLeftEl.textContent = data.timeLeft;
    overlayStatusEl.textContent = data.status === "running" ? "Running · background overlay" : "Idle · stays on top";
    if (data.status === "running") {
        overlayStartBtn.disabled = true;
        overlayStopBtn.disabled = false;
        overlayResetBtn.disabled = false;
    } else {
        overlayStartBtn.disabled = false;
        overlayStopBtn.disabled = true;
        overlayResetBtn.disabled = true;
    }
}

// Time configuration
function getSelectedDurationSeconds() {
    const h = parseInt(hoursValueEl.textContent, 10) || 0;
    const m = parseInt(minutesValueEl.textContent, 10) || 0;
    const s = parseInt(secondsValueEl.textContent, 10) || 0;
    return h * 3600 + m * 60 + s;
}

function updateTimeLeftDisplay() {
    if (noTimerCheckbox.checked) {
        setTimeLeftDisplayValue("∞");
        return;
    }
    const total = getSelectedDurationSeconds() || 60;
    initialDurationSeconds = total;
    setTimeLeftDisplayValue(total.toString());
}

function adjustTime(unit, delta) {
    let el;
    let max = 59;

    if (unit === "hours") {
        el = hoursValueEl;
        max = 5;
    } else if (unit === "minutes") {
        el = minutesValueEl;
    } else {
        el = secondsValueEl;
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

// Test control
function startTest() {
    if (isRunning) return;

    isTimedMode = !noTimerCheckbox.checked;

    if (isTimedMode) {
        const total = getSelectedDurationSeconds() || 60;
        initialDurationSeconds = total;
        setTimeLeftDisplayValue(total.toString());
    } else {
        initialDurationSeconds = null;
        setTimeLeftDisplayValue("∞");
    }

    typingArea.innerHTML = "";
    typingArea.classList.remove("disabled");
    typingArea.classList.add("active");
    typingArea.setAttribute("contenteditable", "true");
    typingArea.focus();

    wpmEl.textContent = "0";
    overlayWpmEl.textContent = "0";
    correctWordsEl.textContent = "0";
    errorWordsEl.textContent = "0";
    totalWordsEl.textContent = "0";

    startBtn.disabled = true;
    overlayStartBtn.disabled = true;
    stopBtn.disabled = false;
    overlayStopBtn.disabled = false;
    resetBtn.disabled = false;
    overlayResetBtn.disabled = false;
    setTimeControlsEnabled(false);

    startTime = Date.now();
    isRunning = true;
    updateOverlayStatus();
    updateStats();

    timerId = setInterval(() => {
        if (!isRunning) return;

        updateStats();

        if (isTimedMode && initialDurationSeconds != null) {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, initialDurationSeconds - elapsedSeconds);
            setTimeLeftDisplayValue(remaining.toString());

            if (remaining <= 0) {
                stopTest(true);
            }
        }
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
    overlayStartBtn.disabled = false;
    stopBtn.disabled = true;
    overlayStopBtn.disabled = true;
    overlayResetBtn.disabled = resetBtn.disabled;
    setTimeControlsEnabled(true);

    if (!isTimedMode) {
        setTimeLeftDisplayValue("∞");
    }

    updateOverlayStatus();
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
    overlayWpmEl.textContent = "0";
    correctWordsEl.textContent = "0";
    errorWordsEl.textContent = "0";
    totalWordsEl.textContent = "0";

    startBtn.disabled = false;
    overlayStartBtn.disabled = false;
    stopBtn.disabled = true;
    overlayStopBtn.disabled = true;
    resetBtn.disabled = true;
    overlayResetBtn.disabled = true;
    setTimeControlsEnabled(true);

    updateTimeLeftDisplay();
    updateOverlayStatus();
}

// Event wiring
function wireMainWindowEvents() {
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

    validationModeInputs.forEach(input => {
        input.addEventListener('change', () => {
            validationMode = input.value === "freeform" ? "freeform" : "strict";
            rebuildWithHighlights();
            updateStats();
        });
    });

    overlayLaunchBtn?.addEventListener('click', () => bridge?.openOverlay());

    document.addEventListener('keydown', (event) => {
        if (event.key !== "Enter" || event.repeat) return;

        const target = event.target;
        const isEditing = target === typingArea || target.isContentEditable;
        if (isEditing && isRunning) {
            return;
        }

        event.preventDefault();
        if (isRunning) {
            stopTest(false);
        } else {
            startTest();
        }
    });
}

function wireOverlayWindowEvents() {
    document.querySelector(".container").style.display = "none";
    overlayPanel.classList.remove("hidden");
    overlayPanel.classList.add("overlay-standalone");
    overlayHideBtn.addEventListener('click', () => window.close());
    overlayStartBtn.addEventListener('click', () => bridge?.sendAction("start"));
    overlayStopBtn.addEventListener('click', () => bridge?.sendAction("stop"));
    overlayResetBtn.addEventListener('click', () => bridge?.sendAction("reset"));
    if (bridge && typeof bridge.onStats === "function") {
        bridge.onStats(handleOverlayStatsIncoming);
    }
}

function wireOverlayActionListener() {
    if (!bridge || typeof bridge.onAction !== "function") return;
    bridge.onAction((action) => {
        if (action === "start") startTest();
        if (action === "stop") stopTest(false);
        if (action === "reset") resetTest();
    });
}

// Initial setup
initTheme();
updateTimeLeftDisplay();
setTimeControlsEnabled(true);
stopBtn.disabled = true;
resetBtn.disabled = true;
overlayStopBtn.disabled = true;
overlayResetBtn.disabled = true;
updateOverlayStatus();

if (isOverlayWindow) {
    wireOverlayWindowEvents();
} else {
    wireMainWindowEvents();
    wireOverlayActionListener();
}
