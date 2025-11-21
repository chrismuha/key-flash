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
let lastClickTime = null;
let timerId = null;
let lockedAtSixty = false;
let finished = false;
let isLight = false;

const idleThresholdMsLocked = 2000;

// Section: Free mode stats logic
function updateFreeStats(eventTimeMs) {
    if (!startTime) return;

    let elapsedMs = eventTimeMs - startTime;
    let elapsedSec = elapsedMs / 1000;

    const elapsedMin = elapsedSec / 60;
    const cpm = elapsedMin > 0 ? clickCount / elapsedMin : 0;

    timeElapsedEl.textContent = elapsedSec.toFixed(1);
    cpmEl.textContent = Math.round(cpm);
}

function startFreeRunIfNeeded() {
    if (startTime !== null) return;
    startTime = Date.now();
    finished = false;
    hintText.textContent = "Counting. CPM is based on current elapsed time.";
}

// Section: Locked sixty second mode logic
function startLockedRunIfNeeded() {
    if (startTime !== null) return;
    const now = Date.now();
    startTime = now;
    lastClickTime = now;
    finished = false;
    hintText.textContent = "Sixty second test in progress. Clicks reset if you pause.";

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

    if (!finished && clickCount > 0 && lastClickTime && now - lastClickTime > idleThresholdMsLocked) {
        clickCount = 0;
        clickCountEl.textContent = "0";
        cpmEl.textContent = "0";
    }

    if (elapsedSec >= 60) {
        elapsedSec = 60;
        finished = true;

        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }

        const finalCpm = clickCount;
        cpmEl.textContent = String(finalCpm);
        hintText.textContent = "Sixty seconds reached. Final CPM shown.";
    }

    timeElapsedEl.textContent = elapsedSec.toFixed(1);
}

// Section: Shared reset helpers
function resetAll() {
    clickCount = 0;
    startTime = null;
    lastClickTime = null;
    finished = false;

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
        if (finished) return;

        const now = Date.now();
        startLockedRunIfNeeded();
        lastClickTime = now;

        clickCount += 1;
        clickCountEl.textContent = clickCount;
        return;
    }

    if (finished) {
        resetAll();
    }

    const now = Date.now();
    startFreeRunIfNeeded();

    clickCount += 1;
    clickCountEl.textContent = clickCount;
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
            ? "Sixty second test. Click to begin. Clicks reset if you pause."
            : "Free mode. Click to begin. CPM updates each click.";
    }
});

// Section: Theme toggle
themeToggleBtn.addEventListener("click", () => {
    isLight = !isLight;
    document.body.classList.toggle("light-theme", isLight);
    themeToggleBtn.textContent = isLight ? "Dark mode" : "Light mode";
});