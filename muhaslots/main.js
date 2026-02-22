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
const MONTE_CARLO_BASELINES_BY_LINES = {
    spins: 500000,
    byLines: {
        1: { winRate: 0.047536, lossRate: 0.952464, rtp: 0.406668, houseEdge: 0.593332 },
        2: { winRate: 0.093756, lossRate: 0.906244, rtp: 0.418394, houseEdge: 0.581606 },
        3: { winRate: 0.136486, lossRate: 0.863514, rtp: 0.42093733333333333, houseEdge: 0.5790626666666667 },
        4: { winRate: 0.177584, lossRate: 0.822416, rtp: 0.416944, houseEdge: 0.583056 },
        5: { winRate: 0.217176, lossRate: 0.782824, rtp: 0.4209688, houseEdge: 0.5790312 },
        6: { winRate: 0.253474, lossRate: 0.746526, rtp: 0.417354, houseEdge: 0.582646 },
        7: { winRate: 0.285758, lossRate: 0.714242, rtp: 0.4150897142857143, houseEdge: 0.5849102857142857 },
        8: { winRate: 0.318648, lossRate: 0.681352, rtp: 0.4166925, houseEdge: 0.5833075 },
        9: { winRate: 0.339284, lossRate: 0.660716, rtp: 0.41754355555555556, houseEdge: 0.5824564444444444 },
        10: { winRate: 0.358774, lossRate: 0.641226, rtp: 0.4148412, houseEdge: 0.5851588 },
    },
};

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
const previewOverlayEl = document.getElementById("previewOverlay");
const previewOverlayCloseBtn = document.getElementById("previewOverlayClose");
const linesPreviewOverlayEl = document.getElementById("linesPreviewOverlay");
const overlayPrevBtn = document.getElementById("overlayPrev");
const overlayNextBtn = document.getElementById("overlayNext");
const overlayPageLabelEl = document.getElementById("overlayPageLabel");
const overlayPageEls = Array.from(document.querySelectorAll("[data-info-page]"));
const casinoAdvantageTextEl = document.getElementById("casinoAdvantageText");
const winLossOddsTextEl = document.getElementById("winLossOddsText");
const sessionStatDisplayEl = document.getElementById("sessionStatDisplay");
const desktopAutoFitQuery = window.matchMedia("(min-width: 841px)");


// State
let balance = 100.0;
let isSpinning = false;
let overlayPageIndex = 0;

// Session Winnings State
let sessionWinningsUSD = 0;
let sessionLossesUSD = 0;
let netSessionWinningsUSD = 0;
let netSessionLossesUSD = 0;
let actualSessionNetUSD = 0;


// Utilities
function fmtUSD(n) {
    return `$${Number(n).toFixed(2)}`;
}

function fmtPercent(n) {
    return `${(Number(n) * 100).toFixed(2)}%`;
}

function fmtOneIn(p) {
    if (!Number.isFinite(p) || p <= 0) return "N/A";
    return `1 in ${(1 / p).toFixed(2)}`;
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

function createGrid(cellFactory) {
    return Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, (_, col) => cellFactory(col))
    );
}

function randomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function getDenominationValue() {
    const value = Number.parseFloat(denomEl?.value ?? "1");
    return Number.isFinite(value) && value > 0 ? value : 1;
}

function getTotalBet() {
    const lines = parseInt(linesEl.value, 10);
    const betPerLine = parseFloat(betEl.value);
    const denom = getDenominationValue();
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

function getCreditStatusMessage() {
    const totalBetUSD = getTotalBet();
    if (balance <= 0) return "Out of credits. Add credits to continue.";
    if (balance < totalBetUSD) return "Insufficient credits for this bet. Lower bet/lines or add credits.";
    return "";
}

function isCreditStatusMessage(msg) {
    const text = (msg || "").trim();
    return (
        text === "Out of credits. Add credits to continue." ||
        text === "Insufficient credits for this bet. Lower bet/lines or add credits."
    );
}

function updateRealtimeCreditMessage() {
    if (isSpinning) return;
    const status = getCreditStatusMessage();
    if (status) {
        setMessage(status);
        return;
    }
    if (isCreditStatusMessage(messageEl?.textContent)) {
        clearMessage();
    }
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
    return createGrid(() => choiceWeighted(WEIGHTS));
}

// Returns { totalWinUSD, lineWins: [...], winningPositions: Set<string> }
function evaluateGrid(grid) {
    const linesActive = parseInt(linesEl.value, 10);
    const betPerLine = parseFloat(betEl.value);
    const denom = getDenominationValue();

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
        const grid = createGrid(() => randomSymbol());
        renderGrid(grid);
        if (t - start < durationMs) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}


// Lines Preview (now 5 rows)
function renderSingleLinesPreview(targetEl) {
    if (!targetEl) return;
    const active = parseInt(linesEl.value, 10);
    targetEl.innerHTML = "";

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
            targetEl.appendChild(dot);
        }
    }
}

function renderLinesPreview() {
    renderSingleLinesPreview(linesPreviewOverlayEl);
}

function getPerLineOddsAndReturn() {
    const totalWeight = Object.values(WEIGHTS).reduce((sum, w) => sum + w, 0);
    let lineWinProb = 0;
    let lineExpectedReturn = 0;

    for (const symbol of SYMBOLS) {
        const p = (WEIGHTS[symbol] || 0) / totalWeight;
        const p3 = p ** 3;
        const p4 = p ** 4;
        const p5 = p ** 5;

        lineWinProb += p3;
        lineExpectedReturn +=
            (PAYTABLE[symbol]?.[3] || 0) * p3 * (1 - p) +
            (PAYTABLE[symbol]?.[4] || 0) * p4 * (1 - p) +
            (PAYTABLE[symbol]?.[5] || 0) * p5;
    }

    return {
        lineWinProb,
        lineLossProb: Math.max(0, 1 - lineWinProb),
        returnToPlayer: lineExpectedReturn,
        casinoAdvantage: Math.max(0, 1 - lineExpectedReturn),
    };
}

function updateGameOddsDisplay() {
    if (!casinoAdvantageTextEl || !winLossOddsTextEl) return;

    const { lineWinProb, lineLossProb, returnToPlayer, casinoAdvantage } = getPerLineOddsAndReturn();
    const linesActive = Math.min(10, Math.max(1, parseInt(linesEl.value, 10) || 1));
    const spinWinApprox = 1 - (lineLossProb ** linesActive);
    const spinLossApprox = lineLossProb ** linesActive;
    const baseline = MONTE_CARLO_BASELINES_BY_LINES.byLines[linesActive] || MONTE_CARLO_BASELINES_BY_LINES.byLines[10];

    casinoAdvantageTextEl.textContent =
        `100% random mode baseline (Monte Carlo, ${MONTE_CARLO_BASELINES_BY_LINES.spins.toLocaleString()} spins, ${linesActive} lines): ` +
        `house edge ${fmtPercent(baseline.houseEdge)}, RTP ${fmtPercent(baseline.rtp)}.`;

    winLossOddsTextEl.textContent =
        `Baseline win/loss: win ${fmtPercent(baseline.winRate)}, loss ${fmtPercent(baseline.lossRate)}. ` +
        `Base paytable model at ${linesActive} lines (approx): win ${fmtPercent(spinWinApprox)}, loss ${fmtPercent(spinLossApprox)}, ` +
        `per-line win ${fmtPercent(lineWinProb)} (${fmtOneIn(lineWinProb)}), per-line loss ${fmtPercent(lineLossProb)}, ` +
        `model RTP ${fmtPercent(returnToPlayer)} / house edge ${fmtPercent(casinoAdvantage)}.`;
}


// Info Overlay
function applyOverlayPage(index) {
    const max = Math.max(overlayPageEls.length - 1, 0);
    overlayPageIndex = Math.min(Math.max(index, 0), max);

    overlayPageEls.forEach((el, i) => {
        el.hidden = i !== overlayPageIndex;
    });

    if (overlayPageLabelEl) {
        overlayPageLabelEl.textContent = `Page ${overlayPageIndex + 1} of ${Math.max(overlayPageEls.length, 1)}`;
    }
}

function stepOverlayPage(delta) {
    const total = overlayPageEls.length;
    if (total <= 0) return;
    const wrappedIndex = ((overlayPageIndex + delta) % total + total) % total;
    applyOverlayPage(wrappedIndex);
}

function togglePreviewOverlay(force) {
    if (!previewOverlayEl) return;
    const wantOpen = (typeof force === "boolean") ? force : previewOverlayEl.hidden;
    previewOverlayEl.hidden = !wantOpen;
    payInfoBtn?.setAttribute("aria-expanded", String(wantOpen));
    document.body.classList.toggle("overlay-open", wantOpen);
}

function bindRapidPress(button, action) {
    if (!button || typeof action !== "function") return;

    let holdTimer = 0;
    let repeatTimer = 0;
    let didRepeat = false;

    const clearRepeat = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = 0;
        }
        if (repeatTimer) {
            clearInterval(repeatTimer);
            repeatTimer = 0;
        }
    };

    button.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        didRepeat = false;
        clearRepeat();
        holdTimer = setTimeout(() => {
            didRepeat = true;
            action();
            repeatTimer = setInterval(action, 85);
        }, 220);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        button.addEventListener(evt, clearRepeat);
    });

    button.addEventListener("click", () => {
        if (didRepeat) {
            didRepeat = false;
            return;
        }
        action();
    });
}

function handleEsc(e) {
    if (e.key !== "Escape") return;

    if (previewOverlayEl && !previewOverlayEl.hidden) {
        togglePreviewOverlay(false);
        payInfoBtn?.focus();
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

/** Remove orphan labels for session stat boxes when not inside known stat containers. */
function removeOrphanSessionLabels() {
    const candidates = document.querySelectorAll(
        'button, .label, [data-label], label, .chip, .tag, .pill, .badge, span, div'
    );
    candidates.forEach(el => {
        const txt = (el.textContent || "").trim().toLowerCase();
        const inKnownBox = el.closest(
            "#sessionWinningsBox, #sessionLossesBox, #netSessionWinningsBox, #netSessionLossesBox, #actualSessionWinningsBox, #actualSessionLossesBox"
        );
        if (
            (txt === "session winnings" ||
                txt === "session losses" ||
                txt === "session losses total" ||
                txt === "net session winnings" ||
                txt === "net session losses" ||
                txt === "actual net session winnings" ||
                txt === "actual net session losses" ||
                txt === "actual session winnings" ||
                txt === "actual session losses") &&
            !inKnownBox
        ) {
            el.remove();
        }
    });
}

function createSessionStatBox({ availBox, boxId, valueId, labelText }) {
    const clone = availBox.cloneNode(true);
    clone.id = boxId;

    let cloneLabel = clone.querySelector(".label, [data-label], label") || clone.firstElementChild;
    if (!cloneLabel) {
        cloneLabel = document.createElement("div");
        cloneLabel.className = "label";
        clone.insertBefore(cloneLabel, clone.firstChild);
    }
    cloneLabel.textContent = labelText;

    let cloneValue =
        clone.querySelector("#balance") ||
        clone.querySelector(".value, [data-value]");
    if (!cloneValue) {
        cloneValue = document.createElement("div");
        cloneValue.className = "value";
        clone.appendChild(cloneValue);
    }
    cloneValue.id = valueId;
    cloneValue.textContent = fmtUSD(0);
    cloneValue.setAttribute?.("aria-label", labelText);

    const availValue =
        availBox.querySelector("#balance") ||
        availBox.querySelector(".value, [data-value]") ||
        balanceEl;
    matchValueTypography(availValue, cloneValue);

    return clone;
}

/* Ensure session stat boxes exist, matching Available Credits. */
function ensureSessionStatsUI() {
    // HARD DELETE existing session stat containers/values and orphan labels
    [
        "#sessionWinningsBox",
        "#sessionLossesBox",
        "#netSessionWinningsBox",
        "#netSessionLossesBox",
        "#actualSessionWinningsBox",
        "#actualSessionLossesBox",
        "#sessionWinnings",
        "#sessionLosses",
        "#netSessionWinnings",
        "#netSessionLosses",
        "#actualSessionWinnings",
        "#actualSessionLosses",
    ]
        .forEach((selector) => {
            document.querySelectorAll(selector).forEach(n => n.remove());
        });
    removeOrphanSessionLabels();

    const availBox = findAvailableCreditsBox();
    if (!availBox) return;

    const winningsBox = createSessionStatBox({
        availBox,
        boxId: "sessionWinningsBox",
        valueId: "sessionWinnings",
        labelText: "Session Winnings",
    });
    availBox.insertAdjacentElement("afterend", winningsBox);

    const lossesBox = createSessionStatBox({
        availBox,
        boxId: "sessionLossesBox",
        valueId: "sessionLosses",
        labelText: "Session Losses",
    });
    winningsBox.insertAdjacentElement("afterend", lossesBox);

    const netWinningsBox = createSessionStatBox({
        availBox,
        boxId: "netSessionWinningsBox",
        valueId: "netSessionWinnings",
        labelText: "Net Session Winnings",
    });
    lossesBox.insertAdjacentElement("afterend", netWinningsBox);

    const netLossesBox = createSessionStatBox({
        availBox,
        boxId: "netSessionLossesBox",
        valueId: "netSessionLosses",
        labelText: "Net Session Losses",
    });
    netWinningsBox.insertAdjacentElement("afterend", netLossesBox);

    const actualWinningsBox = createSessionStatBox({
        availBox,
        boxId: "actualSessionWinningsBox",
        valueId: "actualSessionWinnings",
        labelText: "Actual Net Session Winnings",
    });
    netLossesBox.insertAdjacentElement("afterend", actualWinningsBox);

    const actualLossesBox = createSessionStatBox({
        availBox,
        boxId: "actualSessionLossesBox",
        valueId: "actualSessionLosses",
        labelText: "Actual Net Session Losses",
    });
    actualWinningsBox.insertAdjacentElement("afterend", actualLossesBox);

    removeOrphanSessionLabels();
}

function updateSessionDisplay(valueId, amountUSD) {
    const el = document.getElementById(valueId);
    if (el) el.textContent = fmtUSD(amountUSD);
}

function updateSessionWinningsDisplay() {
    updateSessionDisplay("sessionWinnings", sessionWinningsUSD);
}

function updateSessionLossesDisplay() {
    updateSessionDisplay("sessionLosses", sessionLossesUSD);
}

function updateNetSessionWinningsDisplay() {
    updateSessionDisplay("netSessionWinnings", netSessionWinningsUSD);
}

function updateNetSessionLossesDisplay() {
    updateSessionDisplay("netSessionLosses", netSessionLossesUSD);
}

function updateActualSessionWinningsDisplay() {
    updateSessionDisplay("actualSessionWinnings", Math.max(actualSessionNetUSD, 0));
}

function updateActualSessionLossesDisplay() {
    updateSessionDisplay("actualSessionLosses", Math.max(-actualSessionNetUSD, 0));
}

function updateSessionStatsVisibility() {
    const mode = sessionStatDisplayEl?.value || "both";
    const winningsBox = document.getElementById("sessionWinningsBox");
    const lossesBox = document.getElementById("sessionLossesBox");
    const netWinningsBox = document.getElementById("netSessionWinningsBox");
    const netLossesBox = document.getElementById("netSessionLossesBox");
    const actualWinningsBox = document.getElementById("actualSessionWinningsBox");
    const actualLossesBox = document.getElementById("actualSessionLossesBox");
    if (
        !winningsBox ||
        !lossesBox ||
        !netWinningsBox ||
        !netLossesBox ||
        !actualWinningsBox ||
        !actualLossesBox
    ) return;

    const visibilityByMode = {
        both: { winnings: true, losses: true, netWinnings: false, netLosses: false, actualWinnings: false, actualLosses: false },
        winnings: { winnings: true, losses: false, netWinnings: false, netLosses: false, actualWinnings: false, actualLosses: false },
        losses: { winnings: false, losses: true, netWinnings: false, netLosses: false, actualWinnings: false, actualLosses: false },
        netBoth: { winnings: false, losses: false, netWinnings: true, netLosses: true, actualWinnings: false, actualLosses: false },
        netWinnings: { winnings: false, losses: false, netWinnings: true, netLosses: false, actualWinnings: false, actualLosses: false },
        netLosses: { winnings: false, losses: false, netWinnings: false, netLosses: true, actualWinnings: false, actualLosses: false },
        actualNetBoth: { winnings: false, losses: false, netWinnings: false, netLosses: false, actualWinnings: true, actualLosses: true },
        actualNetWinnings: { winnings: false, losses: false, netWinnings: false, netLosses: false, actualWinnings: true, actualLosses: false },
        actualNetLosses: { winnings: false, losses: false, netWinnings: false, netLosses: false, actualWinnings: false, actualLosses: true },
    };
    const selected = visibilityByMode[mode] || visibilityByMode.both;

    winningsBox.hidden = !selected.winnings;
    lossesBox.hidden = !selected.losses;
    netWinningsBox.hidden = !selected.netWinnings;
    netLossesBox.hidden = !selected.netLosses;
    actualWinningsBox.hidden = !selected.actualWinnings;
    actualLossesBox.hidden = !selected.actualLosses;
}

function addSessionWinnings(amountUSD) {
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) return;
    sessionWinningsUSD += amountUSD;
    updateSessionWinningsDisplay();
}

function addSessionLosses(amountUSD) {
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) return;
    sessionLossesUSD += amountUSD;
    updateSessionLossesDisplay();
}

function addNetSessionWinnings(amountUSD) {
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) return;
    netSessionWinningsUSD += amountUSD;
    updateNetSessionWinningsDisplay();
}

function addNetSessionLosses(amountUSD) {
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) return;
    netSessionLossesUSD += amountUSD;
    updateNetSessionLossesDisplay();
}

function subtractNetSessionWinnings(amountUSD) {
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) return;
    netSessionWinningsUSD = Math.max(0, netSessionWinningsUSD - amountUSD);
    updateNetSessionWinningsDisplay();
}

function subtractNetSessionLosses(amountUSD) {
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) return;
    netSessionLossesUSD = Math.max(0, netSessionLossesUSD - amountUSD);
    updateNetSessionLossesDisplay();
}

function adjustActualSessionNet(amountUSD) {
    if (!Number.isFinite(amountUSD) || amountUSD === 0) return;
    actualSessionNetUSD += amountUSD;
    updateActualSessionWinningsDisplay();
    updateActualSessionLossesDisplay();
}

function adjustBalanceByCredits(creditDelta) {
    const step = parseFloat(creditStepEl.value) || 0;
    const denom = getDenominationValue();
    balance = Math.max(0, balance + (step * denom * creditDelta));
    updateTotals();
    updateRealtimeCreditMessage();
}

// Main Spin Flow
async function doSpin() {
    if (isSpinning) return;
    const totalBetUSD = getTotalBet();
    if (balance < totalBetUSD) {
        updateRealtimeCreditMessage();
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
    addSessionLosses(Math.max(totalBetUSD - totalWinUSD, 0));
    addNetSessionLosses(totalBetUSD);
    subtractNetSessionWinnings(totalBetUSD);
    adjustActualSessionNet(-totalBetUSD);

    // Payout
    if (totalWinUSD > 0) {
        balance += totalWinUSD;
        addSessionWinnings(totalWinUSD);
        addNetSessionWinnings(totalWinUSD);
        subtractNetSessionLosses(totalWinUSD);
        adjustActualSessionNet(totalWinUSD);

        const linesText = lineWins
            .map(w => `Line ${w.lineIndex}: ${w.symbol} × ${w.count} → ${fmtUSD(w.winUSD)}`)
            .join(" • ");
        setMessage(`WIN ${fmtUSD(totalWinUSD)} — ${linesText}`);
    } else {
        let creditHint = "";
        const status = getCreditStatusMessage();
        if (status) creditHint = ` ${status}`;
        setMessage(`No win — try again!${creditHint}`);
    }

    isSpinning = false;
    updateTotals();

    removeOrphanSessionLabels();
    updateSessionWinningsDisplay();
    updateSessionLossesDisplay();
    updateNetSessionWinningsDisplay();
    updateNetSessionLossesDisplay();
    updateActualSessionWinningsDisplay();
    updateActualSessionLossesDisplay();
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
    const cardEl = gameEl.querySelector(".card");
    if (!cardEl) return;

    if (!desktopAutoFitQuery.matches) {
        document.body.classList.remove("desktop-autofit");
        document.documentElement.style.setProperty("--desktop-fit-scale", "1");
        return;
    }

    // Measure natural content size first, without auto-fit.
    document.body.classList.remove("desktop-autofit");
    document.documentElement.style.setProperty("--desktop-fit-scale", "1");
    gameEl.style.transform = "none";

    const prevGameHeight = gameEl.style.height;
    const prevCardHeight = cardEl.style.height;
    gameEl.style.height = "auto";
    cardEl.style.height = "auto";

    const contentWidth = Math.max(
        cardEl.scrollWidth,
        cardEl.offsetWidth,
        gameEl.scrollWidth,
        gameEl.offsetWidth,
        1
    );
    const contentHeight = Math.max(
        cardEl.scrollHeight,
        cardEl.offsetHeight,
        gameEl.scrollHeight,
        gameEl.offsetHeight,
        1
    );

    gameEl.style.height = prevGameHeight;
    cardEl.style.height = prevCardHeight;
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;

    // Keep a larger vertical safety buffer on shorter desktop heights to avoid bottom clipping.
    const horizontalPadding = viewportWidth >= 1400 ? 22 : 18;
    const verticalPadding = viewportHeight <= 860 ? 56 : 38;
    const availableWidth = Math.max(viewportWidth - horizontalPadding, 1);
    const availableHeight = Math.max(viewportHeight - verticalPadding, 1);
    const rawScale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);

    document.body.classList.add("desktop-autofit");
    // Keep a little extra headroom so controls don't clip on shorter desktops.
    const scale = Math.max(0.5, Math.min(0.95, rawScale * 0.95));

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
    updateGameOddsDisplay();
    updateRealtimeCreditMessage();
    scheduleDesktopAutoFit();
}

function disableDoubleTapZoom() {
    let lastTouchEnd = 0;

    const getInteractiveTarget = (target) => {
        if (!(target instanceof Element)) return null;
        return target.closest("button, input, select, textarea, label, a, [role='button']");
    };

    document.addEventListener("touchend", (e) => {
        const now = Date.now();
        const isRapidDoubleTap = now - lastTouchEnd <= 300;
        if (isRapidDoubleTap && e.cancelable) {
            e.preventDefault();

            // Preserve responsiveness for controls while blocking Safari double-tap zoom.
            const interactive = getInteractiveTarget(e.target);
            if (interactive && typeof interactive.click === "function") {
                interactive.click();
            }
        }
        lastTouchEnd = now;
    }, { passive: false });

    document.addEventListener("gesturestart", (e) => {
        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    document.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches.length > 1 && e.cancelable) {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener("dblclick", (e) => {
        if (e.cancelable) e.preventDefault();
    }, { passive: false });
}

spinBtn.addEventListener("click", doSpin);
maxBtn.addEventListener("click", doMaxBet);
denomEl.addEventListener("change", onConfigChange);
linesEl.addEventListener("change", onConfigChange);
betEl.addEventListener("change", onConfigChange);
sessionStatDisplayEl?.addEventListener("change", updateSessionStatsVisibility);

creditUpBtn.onclick = () => adjustBalanceByCredits(1);
creditDownBtn.onclick = () => adjustBalanceByCredits(-1);

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

payInfoBtn?.addEventListener("click", () => {
    applyOverlayPage(0);
    togglePreviewOverlay(true);
});
document.addEventListener("keydown", handleEsc);
previewOverlayCloseBtn?.addEventListener("click", () => togglePreviewOverlay(false));
bindRapidPress(overlayPrevBtn, () => stepOverlayPage(-1));
bindRapidPress(overlayNextBtn, () => stepOverlayPage(1));

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

    const overlayOpen = previewOverlayEl && !previewOverlayEl.hidden;
    if (overlayOpen && e.key === "ArrowLeft") {
        e.preventDefault();
        stepOverlayPage(-1);
    } else if (overlayOpen && e.key === "ArrowRight") {
        e.preventDefault();
        stepOverlayPage(1);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        creditUpBtn.click();
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        creditDownBtn.click();
    }
});

// Init
(function init() {
    const grid = createGrid(() => randomSymbol());
    renderGrid(grid);
    updateTotals();
    renderLinesPreview();
    updateGameOddsDisplay();

    // ARIA defaults
    payInfoBtn?.setAttribute("aria-expanded", "false");
    if (previewOverlayEl) previewOverlayEl.hidden = true;
    applyOverlayPage(0);

    ensureSessionStatsUI();
    updateSessionWinningsDisplay();
    updateSessionLossesDisplay();
    updateNetSessionWinningsDisplay();
    updateNetSessionLossesDisplay();
    updateActualSessionWinningsDisplay();
    updateActualSessionLossesDisplay();
    updateSessionStatsVisibility();
    removeOrphanSessionLabels();
    updateRealtimeCreditMessage();
    disableDoubleTapZoom();
    applyDesktopAutoFit();
})();

window.addEventListener("resize", scheduleDesktopAutoFit, { passive: true });
desktopAutoFitQuery.addEventListener("change", scheduleDesktopAutoFit);
window.visualViewport?.addEventListener("resize", scheduleDesktopAutoFit, { passive: true });
window.visualViewport?.addEventListener("scroll", scheduleDesktopAutoFit, { passive: true });
window.addEventListener("load", scheduleDesktopAutoFit);
document.fonts?.ready?.then(scheduleDesktopAutoFit);
