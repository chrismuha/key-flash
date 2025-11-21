const tapArea = document.getElementById("tapArea");
const resetBtn = document.getElementById("resetBtn");
const lockBtn = document.getElementById("lockBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const clickCountEl = document.getElementById("clickCount");
const timeElapsedEl = document.getElementById("timeElapsed");
const cpmEl = document.getElementById("cpm");
const hintText = document.getElementById("hintText");

let clickCount = 0;
let startTime = null;
let timerId = null;
let lockedAt60 = false;
let finished = false;

function updateStats() {
    if (!startTime) return;

    const now = Date.now();
    let elapsedMs = now - startTime;
    let elapsedSec = elapsedMs / 1000;

    // If locking at 60s, cap time and stop at 60s
    if (lockedAt60 && elapsedSec >= 60) {
        elapsedSec = 60;
        finished = true;
        clearInterval(timerId);
        timerId = null;
        hintText.textContent = "60 seconds reached. Reset to try again.";
    }

    const elapsedMin = elapsedSec / 60;
    const cpm = elapsedMin > 0 ? (clickCount / elapsedMin) : 0;

    timeElapsedEl.textContent = elapsedSec.toFixed(1);
    cpmEl.textContent = Math.round(cpm);
}

function startTimerIfNeeded() {
    if (startTime !== null) return;
    startTime = Date.now();
    finished = false;
    hintText.textContent = lockedAt60
        ? "Counting for up to 60 seconds..."
        : "Counting... CPM is based on current elapsed time.";
    timerId = setInterval(updateStats, 100);
}

tapArea.addEventListener("click", () => {
    if (finished) return; // ignore taps after auto-finish at 60s
    startTimerIfNeeded();
    clickCount++;
    clickCountEl.textContent = clickCount;
    updateStats();
});

resetBtn.addEventListener("click", () => {
    clickCount = 0;
    startTime = null;
    finished = false;
    clickCountEl.textContent = "0";
    timeElapsedEl.textContent = "0.0";
    cpmEl.textContent = "0";
    hintText.textContent = "First tap starts the timer. CPM updates live.";

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
});

lockBtn.addEventListener("click", () => {
    lockedAt60 = !lockedAt60;
    lockBtn.textContent = lockedAt60 ? "Free Mode" : "Lock at 60s";
    hintText.textContent = lockedAt60
        ? "60-second test: CPM will be based on exactly 60 seconds."
        : "First tap starts the timer. CPM updates live.";
});

// THEME TOGGLING
let isLight = false; // default = dark

themeToggleBtn.addEventListener("click", () => {
    isLight = !isLight;
    document.body.classList.toggle("light-theme", isLight);
    themeToggleBtn.textContent = isLight ? "Dark mode" : "Light mode";
});
