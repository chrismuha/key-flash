// Section: Export PDF (US Letter)
document.getElementById('exportButton').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        format: "letter", // Set PDF to US Letter size
    });

    // Load the template image
    const templateURL = 'https://via.placeholder.com/612x792'; // Replace with your template URL
    const templateImage = await fetch(templateURL)
        .then(response => response.blob())
        .then(blob => createImageBitmap(blob));

    // Add the template image as the background
    const canvas = document.createElement('canvas');
    canvas.width = 612; // US Letter width in points
    canvas.height = 792; // US Letter height in points
    const context = canvas.getContext('2d');
    context.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    doc.addImage(imageData, 'PNG', 0, 0, 216, 279); // Fit image to US Letter size (8.5 x 11 inches)

    // Overlay custom content
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Hello, this is content over the template!", 20, 50);

    // Save the PDF
    doc.save("custom-letter-template.pdf");
});
// Section: Theme Switcher (Light/Dark)
const themeOptions = Array.from(document.querySelectorAll('.themes-switcher div[data-theme]'));
const systemThemeOption = document.querySelector('.themes-switcher .system-theme-option');
const systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
const isMobileThemeSwitcher =
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

let selectedThemeMode = 'light';

if (!isMobileThemeSwitcher && systemThemeOption) {
    systemThemeOption.style.display = 'none';
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
        const mode = this.dataset.theme || 'light';
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

// Section: Quantity Input Styling
document.addEventListener("DOMContentLoaded", function () {
    let quantityInput = document.getElementById("quantity");

    if (quantityInput.value.trim() !== "") {
        quantityInput.style.color = "gray"; // Light Mode default text color
    }

    quantityInput.addEventListener("input", function () {
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
    let value = input.value.replace(/\D/g, ''); // Remove all non-numeric characters
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
    let pastedData = (event.clipboardData || window.clipboardData).getData("text").replace(/\D/g, ''); // Remove non-numeric
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
