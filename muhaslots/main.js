// Config
const SYMBOLS = ["💎", "🍀", "⭐", "🔔", "🍋", "🍒"];

// Weights (higher = more common)
const WEIGHTS = {
    "💎": 1,
    "🍀": 3,
    "⭐": 4,
    "🔔": 6,
    "🍋": 7,
    "🍒": 8,
};

// Paytable (multipliers) for 3/4/5 in a row from the left
const PAYTABLE = {
    "💎": { 3: 50, 4: 200, 5: 1000 },
    "🍀": { 3: 20, 4: 100, 5: 400 },
    "⭐": { 3: 10, 4: 40, 5: 200 },
    "🔔": { 3: 6, 4: 20, 5: 100 },
    "🍋": { 3: 4, 4: 12, 5: 60 },
    "🍒": { 3: 2, 4: 6, 5: 30 },
};

const ROWS = 5;
const COLS = 5;

// Paylines
const PAYLINES = [
    [2, 2, 2, 2, 2], // 1 middle
    [0, 0, 0, 0, 0], // 2 top
    [4, 4, 4, 4, 4], // 3 bottom
    [1, 1, 1, 1, 1], // 4 upper-mid
    [3, 3, 3, 3, 3], // 5 lower-mid
    [0, 1, 2, 3, 4], // 6 diagonal down
    [4, 3, 2, 1, 0], // 7 diagonal up
    [1, 2, 3, 2, 1], // 8 V around center
    [0, 1, 0, 1, 0], // 9 small wave near top
    [4, 3, 4, 3, 4], // 10 small wave near bottom
];


// DOM
const reelsEl = document.getElementById("reels");
const messageEl = document.getElementById("message");
const balanceEl = document.getElementById("balance");
const totalBetEl = document.getElementById("totalBet");
const denomEl = document.getElementById("denom");
const linesEl = document.getElementById("lines");
const betEl = document.getElementById("bet");
const creditStepEl = document.getElementById("creditStep");
const creditUpBtn = document.getElementById("creditUp");
const creditDownBtn = document.getElementById("creditDown");
const spinBtn = document.getElementById("spin");
const maxBtn = document.getElementById("max");
const payInfoBtn = document.getElementById("payInfo");
const payInfoPopup = document.getElementById("payInfoPopup");
const linesPreviewEl = document.getElementById("linesPreview");
const desktopAutoFitQuery = window.matchMedia("(min-width: 841px) and (max-height: 900px)");


// State
let balance = 100.0;
let isSpinning = false;

// Session Winnings State
let sessionWinningsUSD = 0;


// Utilities
function fmtUSD(n) {
    return `$${Number(n).toFixed(2)}`;
}

function choiceWeighted(weightsMap) {
    const entries = Object.entries(weightsMap);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [sym, w] of entries) {
        if ((r -= w) <= 0) return sym;
    }
    return entries[entries.length - 1][0];
}

function getTotalBet() {
    const lines = parseInt(linesEl.value, 10);
    const betPerLine = parseFloat(betEl.value);
    const denom = parseFloat(denomEl.value);
    // Total bet shown in dollars to user (lines * bet credits * denom)
    return lines * betPerLine * denom;
}

function updateTotals() {
    totalBetEl.textContent = fmtUSD(getTotalBet());
    balanceEl.textContent = fmtUSD(balance);
    const canAfford = balance >= getTotalBet();
    spinBtn.disabled = !canAfford || isSpinning;
    maxBtn.disabled = isSpinning;
}

function clearMessage() {
    messageEl.textContent = " ";
}

function setMessage(msg) {
    messageEl.textContent = msg;
}

function createCell(symbol, isWinning = false) {
    const cell = document.createElement("div");
    cell.className = "cell";
    if (isWinning) cell.classList.add("win");
    cell.innerHTML = `<span class="icon-container" aria-hidden="true">${symbol}</span>`;
    cell.setAttribute("role", "img");
    cell.setAttribute("aria-label", `Symbol ${symbol}`);
    return cell;
}

function renderGrid(grid, winningPositions = new Set()) {
    reelsEl.innerHTML = "";
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const key = `${row},${col}`;
            const isWin = winningPositions.has(key);
            reelsEl.appendChild(createCell(grid[row][col], isWin));
        }
    }
}

function spinOnce() {
    // produce ROWS x COLS
    return Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => choiceWeighted(WEIGHTS))
    );
}

// Returns { totalWinUSD, lineWins: [...], winningPositions: Set<string> }
function evaluateGrid(grid) {
    const linesActive = parseInt(linesEl.value, 10);
    const betPerLine = parseFloat(betEl.value);
    const denom = parseFloat(denomEl.value);

    let totalWinUSD = 0;
    const lineWins = [];
    const winningPositions = new Set();

    for (let li = 0; li < linesActive; li++) {
        const path = PAYLINES[li];
        const firstRow = path[0];
        const firstSym = grid[firstRow][0];

        let count = 1;
        for (let col = 1; col < COLS; col++) {
            const row = path[col];
            if (grid[row][col] === firstSym) count++;
            else break;
        }

        if (count >= 3 && PAYTABLE[firstSym]?.[count]) {
            const multiplier = PAYTABLE[firstSym][count];
            const winUSD = multiplier * betPerLine * denom;
            totalWinUSD += winUSD;

            lineWins.push({ lineIndex: li + 1, count, symbol: firstSym, winUSD });

            for (let c = 0; c < count; c++) {
                const r = path[c];
                winningPositions.add(`${r},${c}`);
            }
        }
    }

    return { totalWinUSD, lineWins, winningPositions };
}

function animateSpin(durationMs = 600) {
    const start = performance.now();
    function frame(t) {
        const grid = Array.from({ length: ROWS }, () =>
            Array.from({ length: COLS }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
        );
        renderGrid(grid);
        if (t - start < durationMs) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}


// Lines Preview (now 5 rows)
function renderLinesPreview() {
    if (!linesPreviewEl) return;
    const active = parseInt(linesEl.value, 10);
    linesPreviewEl.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const dot = document.createElement("div");
            dot.className = "dot2";
            for (let li = 0; li < active; li++) {
                const path = PAYLINES[li];
                if (path[col] === row) {
                    dot.classList.add("path");
                    break;
                }
            }
            linesPreviewEl.appendChild(dot);
        }
    }
}


// Info Tooltip
function togglePayInfo(force) {
    const wantOpen = (typeof force === "boolean") ? force : payInfoPopup.hidden;
    payInfoPopup.hidden = !wantOpen;
    payInfoBtn.setAttribute("aria-expanded", String(wantOpen));
}
function handleDocumentClick(e) {
    if (!payInfoPopup.hidden) {
        const clickInside = payInfoPopup.contains(e.target) || payInfoBtn.contains(e.target);
        if (!clickInside) togglePayInfo(false);
    }
}
function handleEsc(e) {
    if (e.key === "Escape" && !payInfoPopup.hidden) {
        togglePayInfo(false);
        payInfoBtn.focus();
    }
}

// Credit step controls (▲ / ▼)

// -----------------------------
// Session Winnings UI (match Available Credits, DELETE duplicates hard + orphans)
// -----------------------------

const BOX_SELECTOR = ".credits-box, .available-box, .stat-box, .box, .tile, .panel, .balance-box";

/* Locate the Available Credits box containing the balance value. */
function findAvailableCreditsBox() {
    if (!balanceEl) return null;
    let node = balanceEl;
    while (node && node !== document.body) {
        if (node.matches?.(BOX_SELECTOR)) {
            const lbl = node.querySelector(".label, [data-label], label") || node.firstElementChild;
            const txt = (lbl?.textContent || "").trim().toLowerCase();
            if (txt.includes("available")) return node;
        }
        node = node.parentElement;
    }
    return balanceEl.closest(BOX_SELECTOR) || balanceEl.parentElement || null;
}

/* Match the $ value typography to the Available Credits value node (no layout changes). */
function matchValueTypography(srcValueEl, destValueEl) {
    if (!srcValueEl || !destValueEl) return;
    const cs = getComputedStyle(srcValueEl);
    destValueEl.style.fontFamily = cs.fontFamily;
    destValueEl.style.fontWeight = cs.fontWeight;
    destValueEl.style.fontStyle = cs.fontStyle;
    destValueEl.style.letterSpacing = cs.letterSpacing;
    destValueEl.style.fontSize = cs.fontSize;
    destValueEl.style.lineHeight = cs.lineHeight;
    destValueEl.style.color = cs.color;
    destValueEl.style.textTransform = cs.textTransform;
    destValueEl.style.textShadow = cs.textShadow;
}

/** Remove any orphan elements whose text is exactly "Session Winnings" that are NOT inside our box. */
function removeOrphanSessionWinningsLabels() {
    const candidates = document.querySelectorAll(
        'button, .label, [data-label], label, .chip, .tag, .pill, .badge, span, div'
    );
    candidates.forEach(el => {
        const txt = (el.textContent || "").trim().toLowerCase();
        if (txt === "session winnings" && !el.closest("#sessionWinningsBox")) {
            el.remove();
        }
    });
}

/* Ensure one Session Winnings box exists, matching Available Credits. */
function ensureSessionWinningsUI() {
    // HARD DELETE existing session winnings containers/values and orphan labels
    document.querySelectorAll("#sessionWinningsBox").forEach(n => n.remove());
    document.querySelectorAll("#sessionWinnings").forEach(n => n.remove());
    removeOrphanSessionWinningsLabels();

    const availBox = findAvailableCreditsBox();
    if (!availBox) return;

    // Clone Available Credits
    const clone = availBox.cloneNode(true);
    clone.id = "sessionWinningsBox";

    // Label
    let cloneLabel = clone.querySelector(".label, [data-label], label") || clone.firstElementChild;
    if (!cloneLabel) {
        cloneLabel = document.createElement("div");
        cloneLabel.className = "label";
        clone.insertBefore(cloneLabel, clone.firstChild);
    }
    cloneLabel.textContent = "Session Winnings";

    // Value
    let cloneValue =
        clone.querySelector("#balance") ||
        clone.querySelector(".value, [data-value]");
    if (!cloneValue) {
        cloneValue = document.createElement("div");
        cloneValue.className = "value";
        clone.appendChild(cloneValue);
    }
    cloneValue.id = "sessionWinnings";
    cloneValue.textContent = fmtUSD(0);
    cloneValue.setAttribute?.("aria-label", "Session Winnings");

    // Insert directly below Available Credits
    availBox.insertAdjacentElement("afterend", clone);

    // Match value typography to Available Credits value
    const availValue =
        availBox.querySelector("#balance") ||
        availBox.querySelector(".value, [data-value]") ||
        balanceEl;
    matchValueTypography(availValue, cloneValue);

    removeOrphanSessionWinningsLabels();
}

function updateSessionWinningsDisplay() {
    const el = document.getElementById("sessionWinnings");
    if (el) el.textContent = fmtUSD(sessionWinningsUSD);
}

function addSessionWinnings(amountUSD) {
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) return;
    sessionWinningsUSD += amountUSD;
    updateSessionWinningsDisplay();
}

// Main Spin Flow
async function doSpin() {
    if (isSpinning) return;
    const totalBetUSD = getTotalBet();
    if (balance < totalBetUSD) {
        setMessage("Insufficient balance for that bet.");
        return;
    }

    isSpinning = true;
    updateTotals();
    clearMessage();

    // Deduct bet up front
    balance -= totalBetUSD;
    updateTotals();

    // Simple spin animation
    animateSpin(650);
    await new Promise(r => setTimeout(r, 700));

    // Final outcome
    const grid = spinOnce();
    const { totalWinUSD, lineWins, winningPositions } = evaluateGrid(grid);
    renderGrid(grid, winningPositions);

    // Payout
    if (totalWinUSD > 0) {
        balance += totalWinUSD;
        addSessionWinnings(totalWinUSD);

        const linesText = lineWins
            .map(w => `Line ${w.lineIndex}: ${w.symbol} × ${w.count} → ${fmtUSD(w.winUSD)}`)
            .join(" • ");
        setMessage(`WIN ${fmtUSD(totalWinUSD)} — ${linesText}`);
    } else {
        setMessage("No win — try again!");
    }

    isSpinning = false;
    updateTotals();

    removeOrphanSessionWinningsLabels();
    updateSessionWinningsDisplay();
}

function doMaxBet() {
    betEl.value = Array.from(betEl.options).reduce((max, o) =>
        parseFloat(o.value) > parseFloat(max.value) ? o : max
    ).value;
    linesEl.value = "10";
    onConfigChange();
}

function applyDesktopAutoFit() {
    const gameEl = document.querySelector(".game");
    if (!gameEl) return;

    if (!desktopAutoFitQuery.matches) {
        document.body.classList.remove("desktop-autofit");
        document.documentElement.style.setProperty("--desktop-fit-scale", "1");
        return;
    }

    document.body.classList.add("desktop-autofit");

    // Measure unscaled dimensions before computing fit scale.
    gameEl.style.transform = "none";
    const contentWidth = Math.max(gameEl.scrollWidth, 1);
    const contentHeight = Math.max(gameEl.scrollHeight, 1);
    const availableWidth = Math.max(window.innerWidth - 16, 1);
    const availableHeight = Math.max(window.innerHeight - 16, 1);
    const rawScale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);
    // Keep a small safety margin to avoid 1-2px clipping from subpixel rounding.
    const scale = Math.max(0.5, rawScale * 0.93);

    document.documentElement.style.setProperty("--desktop-fit-scale", String(scale));
    gameEl.style.transform = "";
}

let desktopFitRaf = 0;
function scheduleDesktopAutoFit() {
    if (desktopFitRaf) cancelAnimationFrame(desktopFitRaf);
    desktopFitRaf = requestAnimationFrame(() => {
        desktopFitRaf = 0;
        applyDesktopAutoFit();
    });
}

// Events
function onConfigChange() {
    updateTotals();
    renderLinesPreview();
    scheduleDesktopAutoFit();
}

spinBtn.addEventListener("click", doSpin);
maxBtn.addEventListener("click", doMaxBet);
denomEl.addEventListener("change", onConfigChange);
linesEl.addEventListener("change", onConfigChange);
betEl.addEventListener("change", onConfigChange);

creditUpBtn.onclick = () => {
    const step = parseFloat(creditStepEl.value) || 0;
    const denom = parseFloat(denomEl.value) || 1;
    balance = Math.max(0, balance + step * denom);
    updateTotals();
};

creditDownBtn.onclick = () => {
    const step = parseFloat(creditStepEl.value) || 0;
    const denom = parseFloat(denomEl.value) || 1;
    balance = Math.max(0, balance - step * denom);
    updateTotals();
};

creditStepEl.addEventListener("input", () => {
    if (parseFloat(creditStepEl.value) < 0) creditStepEl.value = "0";
});

creditStepEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
        e.preventDefault();
        creditUpBtn.click();
        return;
    }
    if (e.key === "ArrowDown") {
        e.preventDefault();
        creditDownBtn.click();
        return;
    }
    if (e.key === "Enter") {
        e.preventDefault();
        if (parseFloat(creditStepEl.value) < 0) creditStepEl.value = "0";
        creditUpBtn.click();
    }
});

payInfoBtn.addEventListener("click", () => togglePayInfo());
document.addEventListener("click", handleDocumentClick);
document.addEventListener("keydown", handleEsc);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    const target = e.target;
    const isTypingField = target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
    );
    if (isTypingField) return;

    if (e.key === "ArrowUp") {
        e.preventDefault();
        creditUpBtn.click();
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        creditDownBtn.click();
    }
});

// Init
(function init() {
    const grid = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    );
    renderGrid(grid);
    updateTotals();
    renderLinesPreview();

    // ARIA defaults
    payInfoPopup.hidden = true;
    payInfoBtn.setAttribute("aria-expanded", "false");

    ensureSessionWinningsUI();
    updateSessionWinningsDisplay();
    removeOrphanSessionWinningsLabels();
    applyDesktopAutoFit();
})();

window.addEventListener("resize", scheduleDesktopAutoFit, { passive: true });
desktopAutoFitQuery.addEventListener("change", scheduleDesktopAutoFit);

// Render Payout Table automatically
function renderPayoutTable() {
    const table = document.querySelector('.paytable .table');
    if (!table) return;
    table.innerHTML = `
    <div class="head">Symbol</div>
    <div class="head">3</div>
    <div class="head">4</div>
    <div class="head">5</div>
  `;
    const order = ["💎", "🍀", "⭐", "🔔", "🍋", "🍒"];
    for (const sym of order) {
        const p = PAYTABLE[sym];
        table.insertAdjacentHTML(
            'beforeend',
            `<div><span class="icon-container">${sym}</span></div>
       <div>${p[3]}</div>
       <div>${p[4]}</div>
       <div>${p[5]}</div>`
        );
    }
}
