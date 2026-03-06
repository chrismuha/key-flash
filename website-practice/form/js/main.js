// Section: Export PDF (US Letter)
window.PdfExportShared?.bindExportButton("exportButton", "letter");
// Section: Theme Switcher (Light/Dark)
const themeOptions = Array.from(document.querySelectorAll('.themes-switcher div[data-theme]'));
const systemThemeOption = document.querySelector('.themes-switcher .system-theme-option');
const systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)');

let selectedThemeMode = 'system';

if (systemThemeOption) {
    systemThemeOption.style.display = '';
}

function applyThemeMode(mode) {
    const useDark = mode === 'dark' || (mode === 'system' && systemColorScheme.matches);
    document.body.classList.toggle('dark-mode', useDark);
}

function setActiveThemeOption(mode) {
    themeOptions.forEach((option) => {
        option.classList.toggle('active', option.dataset.theme === mode);
    });
}

themeOptions.forEach((option) => {
    option.addEventListener('click', function () {
        const mode = this.dataset.theme || 'system';
        selectedThemeMode = mode;
        setActiveThemeOption(mode);
        applyThemeMode(mode);
    });
});

systemColorScheme.addEventListener('change', () => {
    if (selectedThemeMode === 'system') {
        applyThemeMode('system');
    }
});

setActiveThemeOption(selectedThemeMode);
applyThemeMode(selectedThemeMode);

// Section: Settings Panel + Auto-Tab Preference
const settingsToggleButton = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("settings-panel");
const autoTabToggle = document.getElementById("auto-tab-toggle");
const AUTO_TAB_STORAGE_KEY = "testForm.autoTabEnabled";
let autoTabEnabled = false;

function loadAutoTabPreference() {
    try {
        const savedPreference = localStorage.getItem(AUTO_TAB_STORAGE_KEY);
        if (savedPreference === "true") return true;
        if (savedPreference === "false") return false;
        return !window.matchMedia("(max-width: 700px)").matches;
    } catch (error) {
        return !window.matchMedia("(max-width: 700px)").matches;
    }
}

function saveAutoTabPreference(enabled) {
    try {
        localStorage.setItem(AUTO_TAB_STORAGE_KEY, String(enabled));
    } catch (error) {
        // Ignore storage failures.
    }
}

autoTabEnabled = loadAutoTabPreference();
if (autoTabToggle) {
    autoTabToggle.checked = autoTabEnabled;
    autoTabToggle.addEventListener("change", function () {
        autoTabEnabled = this.checked;
        saveAutoTabPreference(autoTabEnabled);
    });
}

if (settingsToggleButton && settingsPanel) {
    settingsToggleButton.addEventListener("click", function () {
        const shouldOpen = settingsPanel.hidden;
        settingsPanel.hidden = !shouldOpen;
        settingsToggleButton.setAttribute("aria-expanded", String(shouldOpen));
    });
}

// Section: Quantity Input Styling
document.addEventListener("DOMContentLoaded", function () {
    let quantityInput = document.getElementById("quantity");
    if (!quantityInput) return;

    if (quantityInput.value.trim() !== "") {
        quantityInput.style.color = "gray"; // Light Mode default text color
    }

    quantityInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^\d]/g, "").slice(0, 2);
        if (this.value !== "" && Number(this.value) > 99) this.value = "99";
        this.style.color = "black"; // Change color when user types
    });

    if (document.body.classList.contains("dark-mode")) {
        if (quantityInput.value.trim() !== "") {
            quantityInput.style.color = "lightgray"; // Dark Mode default text color
        }
        quantityInput.addEventListener("input", function () {
            this.style.color = "white";
        });
    }
});

// Section: Auto-Tab at Character Limit
function getFieldCharacterLimit(field) {
    const nativeLimit = field.maxLength;
    if (nativeLimit > 0) return nativeLimit;

    const customLimit = Number.parseInt(field.dataset.maxlength || "", 10);
    return Number.isFinite(customLimit) && customLimit > 0 ? customLimit : 0;
}

function getFieldCharacterCount(field) {
    if (field instanceof HTMLInputElement && field.type === "number") {
        return field.value.replace(/[^\d]/g, "").length;
    }
    return field.value.length;
}

function findNextAutoTabTarget(currentField) {
    const form = currentField.closest("form");
    if (!form) return null;

    const fields = Array.from(form.querySelectorAll("input, textarea, select"));
    const availableFields = fields.filter((field) => {
        if (!(field instanceof HTMLElement)) return false;
        if (field.hidden || field.disabled) return false;
        if (field.offsetParent === null) return false;
        if (field instanceof HTMLInputElement && ["hidden", "file", "checkbox", "radio", "button", "submit", "reset"].includes(field.type)) {
            return false;
        }
        return true;
    });

    const currentIndex = availableFields.indexOf(currentField);
    if (currentIndex === -1) return null;
    return availableFields[currentIndex + 1] || null;
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("input", function (event) {
        if (!autoTabEnabled) return;
        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) return;
        if (event.isComposing) return;
        if (typeof event.inputType === "string" && event.inputType.startsWith("delete")) return;

        const targetField = event.target;
        const fieldLimit = getFieldCharacterLimit(targetField);
        if (!fieldLimit) return;

        const charCount = getFieldCharacterCount(targetField);
        if (charCount < fieldLimit) return;

        const nextField = findNextAutoTabTarget(targetField);
        if (!nextField) return;
        nextField.focus();
    });
});

// Section: Mobile Keypads (Phone, DOB, Credit Card)
document.addEventListener("DOMContentLoaded", function () {
    const isMobileDevice =
        window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobileDevice) return;

    const keypadTargets = document.querySelectorAll('[data-mobile-keypad="numeric"]');
    keypadTargets.forEach((input) => {
        input.setAttribute("inputmode", "numeric");
    });
});

// Section: Phone Number Formatting
// Phone Number Format Input Value Automations //
let errorTimeout; // Stores the timeout reference

document.getElementById("phone").addEventListener("input", function (event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '').slice(0, 10); // Keep max 10 digits
    let formattedValue = '';

    // Auto-format as user types
    if (value.length > 3 && value.length <= 6) {
        formattedValue = value.replace(/(\d{3})(\d{1,3})/, '$1-$2');
    } else if (value.length > 6) {
        formattedValue = value.replace(/(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3');
    } else {
        formattedValue = value;
    }

    input.value = formattedValue;

    // Show error message if an invalid character was typed
    if (event.inputType === "insertText" && /[^0-9]/.test(event.data)) {
        document.getElementById("error-message").style.display = "block";

        // Reset the timer so it stays visible for 2 seconds
        clearTimeout(errorTimeout);
        errorTimeout = setTimeout(() => {
            document.getElementById("error-message").style.display = "none";
        }, 2000); // Message disappears after 2 seconds
    }
});

// Section: Paste Guard
// Prevent users from pasting invalid input
document.getElementById("phone").addEventListener("paste", function (event) {
    event.preventDefault();
    let pastedData = (event.clipboardData || window.clipboardData).getData("text").replace(/\D/g, '').slice(0, 10); // Keep max 10 digits
    let formattedValue = '';

    if (pastedData.length > 3 && pastedData.length <= 6) {
        formattedValue = pastedData.replace(/(\d{3})(\d{1,3})/, '$1-$2');
    } else if (pastedData.length > 6) {
        formattedValue = pastedData.replace(/(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3');
    } else {
        formattedValue = pastedData;
    }

    event.target.value = formattedValue;
});

// Section: Birthday Formatting (MM/DD/YYYY)
const bdayInput = document.getElementById("bday");

function formatBirthdayValue(rawValue) {
    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

if (bdayInput) {
    bdayInput.addEventListener("input", function (event) {
        event.target.value = formatBirthdayValue(event.target.value);
    });

    bdayInput.addEventListener("paste", function (event) {
        event.preventDefault();
        const pastedData = (event.clipboardData || window.clipboardData).getData("text");
        event.target.value = formatBirthdayValue(pastedData);
    });
}

// Section: Card Number Formatting (#### #### #### ####)
const cardNumberInput = document.getElementById("card-number");

function formatCardNumberValue(rawValue) {
    const digits = rawValue.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
}

if (cardNumberInput) {
    cardNumberInput.addEventListener("input", function (event) {
        event.target.value = formatCardNumberValue(event.target.value);
    });

    cardNumberInput.addEventListener("paste", function (event) {
        event.preventDefault();
        const pastedData = (event.clipboardData || window.clipboardData).getData("text");
        event.target.value = formatCardNumberValue(pastedData);
    });
}

// Section: Card Expiration Formatting (MM/YY)
const cardExpInput = document.getElementById("card-exp");

function formatCardExpValue(rawValue) {
    const digits = rawValue.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

if (cardExpInput) {
    cardExpInput.addEventListener("input", function (event) {
        event.target.value = formatCardExpValue(event.target.value);
    });

    cardExpInput.addEventListener("paste", function (event) {
        event.preventDefault();
        const pastedData = (event.clipboardData || window.clipboardData).getData("text");
        event.target.value = formatCardExpValue(pastedData);
    });
}
