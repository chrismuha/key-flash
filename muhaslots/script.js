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

// ---->>> CHANGED: 5 rows now
const ROWS = 5;
const COLS = 5;

// 10 paylines for a 5-row machine (row indices 0..4)
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


// State

let balance = 100.0;
let isSpinning = false;

// --- Session Winnings State ---
let sessionWinningsUSD = 0;


// Utilities

function fmtUSD(n) {
    return `$${n.toFixed(2)}`;
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
    // Reel symbols wrapped to pick up .reels .icon-container (green chip)
    cell.innerHTML = `<span class="icon-container" aria-hidden="true">${symbol}</span>`;
    cell.setAttribute("role", "img");
    cell.setAttribute("aria-label", `Symbol ${symbol}`);
    return cell;
}

function renderGrid(grid, winningPositions = new Set()) {
    reelsEl.innerHTML = "";
    // grid[row][col]
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
    return grid;
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
        // Count matching from left
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

            // track win for UI
            lineWins.push({ lineIndex: li + 1, count, symbol: firstSym, winUSD });

            // mark the winning cells
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

    // Always render ROWS x COLS (5x5) dots; highlight those touched by active lines
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const dot = document.createElement("div");
            dot.className = "dot2";

            // Check if this (row,col) is part of any active line path
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
function getCreditStep() {
    const v = parseFloat(creditStepEl.value);
    return isNaN(v) ? 1 : v;
}
function incBet(delta) {
    const step = getCreditStep();
    let newVal = parseFloat(betEl.value) + delta * step;
    // Clamp to one of the existing options [1,2,5,10,20,50]
    const options = Array.from(betEl.options).map(o => parseFloat(o.value));
    // find nearest option
    const nearest = options.reduce((best, val) =>
        Math.abs(val - newVal) < Math.abs(best - newVal) ? val : best, options[0]);
    betEl.value = String(nearest);
    onConfigChange();
}

// --- Session Winnings UI Helpers ---
function insertAfter(refNode, newNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
}
function ensureSessionWinningsUI() {
    if (document.getElementById("sessionWinnings")) return;

    const box = document.createElement("div");
    box.id = "session-winnings";
    box.className = "stat-box";
    box.style.cssText = "margin-top:.5rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem;";
    box.innerHTML = `
        <span>Session Winnings</span>
        <strong><span id="sessionWinnings">\$0.00</span></strong>
    `;

    // Try to place directly under the Available Credits container
    const anchor = balanceEl?.parentElement || balanceEl;
    if (anchor && anchor.parentElement) {
        insertAfter(anchor, box);
    } else {
        // Fallback: append near totals
        totalBetEl?.parentElement?.appendChild(box);
    }
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
        addSessionWinnings(totalWinUSD); // <-- accumulate session winnings

        const linesText = lineWins
            .map(w => `Line ${w.lineIndex}: ${w.symbol} × ${w.count} → ${fmtUSD(w.winUSD)}`)
            .join(" • ");
        setMessage(`WIN ${fmtUSD(totalWinUSD)} — ${linesText}`);
    } else {
        setMessage("No win — try again!");
    }

    isSpinning = false;
    updateTotals();
}

function doMaxBet() {
    // Max lines stays at 10 (matches PAYLINES length)
    betEl.value = Array.from(betEl.options).reduce((max, o) =>
        parseFloat(o.value) > parseFloat(max.value) ? o : max
    ).value;
    linesEl.value = "10";
    onConfigChange();
}

// Events
function onConfigChange() {
    updateTotals();
    renderLinesPreview();
}

spinBtn.addEventListener("click", doSpin);
maxBtn.addEventListener("click", doMaxBet);
denomEl.addEventListener("change", onConfigChange);
linesEl.addEventListener("change", onConfigChange);
betEl.addEventListener("change", onConfigChange);

creditUpBtn.addEventListener("click", () => incBet(+1));
creditDownBtn.addEventListener("click", () => incBet(-1));
creditStepEl.addEventListener("input", () => {
    // keep within bounds >= 0
    if (parseFloat(creditStepEl.value) < 0) creditStepEl.value = "0";
});

payInfoBtn.addEventListener("click", () => togglePayInfo());
document.addEventListener("click", handleDocumentClick);
document.addEventListener("keydown", handleEsc);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); incBet(+1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); incBet(-1); }
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

    // Initialize Session Winnings UI
    ensureSessionWinningsUI();
    updateSessionWinningsDisplay();
})();

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
    const order = ["💎", "🍀", "⭐", "🔔", "🍋", "🍒"]; // match UI order
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