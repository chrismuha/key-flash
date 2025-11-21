// Section: DOM element references
const tapArea = document.getElementById("tapArea");
const resetBtn = document.getElementById("resetBtn");
const lockBtn = document.getElementById("lockBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const clickCountEl = document.getElementById("clickCount");
const timeElapsedEl = document.getElementById("timeElapsed");
const cpmEl = document.getElementById("cpm");
const hintText = document.getElementById("hintText");

// Section: State variables
let clickCount = 0;
let startTime = null;
let lockedAt60 = false;
let finished = false;
let isLight = false;

// Section: Core timer and stats logic
function updateStats(eventTimeMs) {
    if (!startTime) return;

    let elapsedMs = eventTimeMs - startTime;
    let elapsedSec = elapsedMs / 1000;

    if (lockedAt60 && elapsedSec >= 60) {
        elapsedSec = 60;
        finished = true;
        hintText.textContent = "60 seconds reached. Reset to try again.";
    }

    const elapsedMin = elapsedSec / 60;
    const cpm = elapsedMin > 0 ? clickCount / elapsedMin : 0;

    timeElapsedEl.textContent = elapsedSec.toFixed(1);
    cpmEl.textContent = Math.round(cpm);
}

function startTimerIfNeeded() {
    if (startTime !== null) return;
    startTime = Date.now();
    finished = false;
    hintText.textContent = lockedAt60
        ? "Counting for up to 60 seconds."
        : "Counting. CPM is based on current elapsed time.";
}

// Section: Click handling
tapArea.addEventListener("click", () => {
    if (finished) return;

    const now = Date.now();
    startTimerIfNeeded();
    clickCount += 1;
    clickCountEl.textContent = clickCount;
    updateStats(now);
});

// Section: Reset handling
resetBtn.addEventListener("click", () => {
    clickCount = 0;
    startTime = null;
    finished = false;
    clickCountEl.textContent = "0";
    timeElapsedEl.textContent = "0.0";
    cpmEl.textContent = "0";
    hintText.textContent = "First tap starts the timer. CPM updates live.";
});

// Section: Lock at sixty seconds toggle
lockBtn.addEventListener("click", () => {
    lockedAt60 = !lockedAt60;
    lockBtn.textContent = lockedAt60 ? "Free mode" : "Lock at 60s";
    hintText.textContent = lockedAt60
        ? "Sixty second test. CPM will be based on exactly sixty seconds."
        : "First tap starts the timer. CPM updates live.";
});

// Section: Theme toggle
themeToggleBtn.addEventListener("click", () => {
    isLight = !isLight;
    document.body.classList.toggle("light-theme", isLight);
    themeToggleBtn.textContent = isLight ? "Dark mode" : "Light mode";
});