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
let timerId = null;
let lockedAtSixty = false;
let finished = false;
let isLight = false;

// Used only in sixty second mode to compute CPM over a short recent window
let clickTimes = [];

// Section: Free mode logic
function updateFreeStats(eventTimeMs) {
    if (!startTime) return;

    const elapsedMs = eventTimeMs - startTime;
    const rawSec = elapsedMs / 1000;

    // Use a minimum effective window to avoid huge CPM on first fast clicks
    const minWindowSec = 5;
    const effectiveSec = Math.max(rawSec, minWindowSec);
    const elapsedMin = effectiveSec / 60;
    const cpm = elapsedMin > 0 ? clickCount / elapsedMin : 0;

    timeElapsedEl.textContent = rawSec.toFixed(1);
    cpmEl.textContent = Math.round(cpm);
}

function startFreeRunIfNeeded() {
    if (startTime !== null) return;
    startTime = Date.now();
    finished = false;
    hintText.textContent = "Counting. CPM is based on current elapsed time.";
}

// Section: Sixty second mode logic with decaying CPM
function startLockedRunIfNeeded() {
    if (startTime !== null) return;
    startTime = Date.now();
    finished = false;
    clickTimes = [];
    hintText.textContent = "Sixty second mode. CPM uses the last few seconds of clicks.";

    if (!timerId) {
        timerId = setInterval(tickLockedMode, 100);
    }
}

function tickLockedMode() {
    if (!lockedAtSixty || startTime === null) {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        return;
    }

    const now = Date.now();
    let elapsedMs = now - startTime;
    let elapsedSec = elapsedMs / 1000;

    if (elapsedSec >= 60) {
        elapsedSec = 60;
        finished = true;
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        hintText.textContent = "Sixty seconds reached. CPM is based on recent clicks.";
    }

    const windowMs = 5000;

    while (clickTimes.length > 0 && now - clickTimes[0] > windowMs) {
        clickTimes.shift();
    }

    const windowClickCount = clickTimes.length;

    const windowSec = windowMs / 1000;
    const cpm = windowClickCount * (60 / windowSec);

    timeElapsedEl.textContent = elapsedSec.toFixed(1);
    cpmEl.textContent = Math.round(cpm);
}

// Section: Shared reset helpers
function resetAll() {
    clickCount = 0;
    startTime = null;
    finished = false;
    clickTimes = [];

    clickCountEl.textContent = "0";
    timeElapsedEl.textContent = "0.0";
    cpmEl.textContent = "0";
    hintText.textContent = "First tap starts the timer. CPM updates live.";

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

// Section: Click handling
tapArea.addEventListener("click", () => {
    if (lockedAtSixty) {
        if (finished) {
            return;
        }

        const now = Date.now();
        startLockedRunIfNeeded();

        clickCount += 1;
        clickCountEl.textContent = String(clickCount);

        clickTimes.push(now);
        tickLockedMode();
        return;
    }

    if (finished) {
        resetAll();
    }

    const now = Date.now();
    startFreeRunIfNeeded();

    clickCount += 1;
    clickCountEl.textContent = String(clickCount);
    updateFreeStats(now);
});

// Section: Reset handling
resetBtn.addEventListener("click", () => {
    resetAll();
});

// Section: Lock at sixty seconds toggle
lockBtn.addEventListener("click", () => {
    const wasLocked = lockedAtSixty;
    lockedAtSixty = !lockedAtSixty;

    lockBtn.textContent = lockedAtSixty ? "Free mode" : "Lock at 60s";

    if (wasLocked !== lockedAtSixty) {
        resetAll();
        hintText.textContent = lockedAtSixty
            ? "Sixty second mode. Click to begin. CPM will fall toward zero if you stop clicking."
            : "Free mode. Click to begin. CPM updates on each click.";
    }
});

// Section: Theme toggle
themeToggleBtn.addEventListener("click", () => {
    isLight = !isLight;
    document.body.classList.toggle("light-theme", isLight);
    themeToggleBtn.textContent = isLight ? "Dark mode" : "Light mode";
});