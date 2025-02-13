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
// Helper function to convert Blob to ImageBitmap
async function createImageBitmap(blob) {
    return new Promise((resolve, reject));
}
const img = new Image();
img.onload = () => resolve(img);
// img.onerror = reject;
// img.src = URL.createObjectURL(blob);

document.querySelectorAll('.themes-switcher div').forEach(theme => {
    theme.addEventListener('click', function () {
        document.querySelectorAll('.themes-switcher div').forEach(div => div.classList.remove('active'));
        this.classList.add('active');

        if (this.textContent.trim() === 'Dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
});

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

// Phone Number Format Input Value Automations //
document.getElementById("phone").addEventListener("input", function (event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-numeric characters

    // Format phone number as XXX-XXX-XXXX
    if (value.length > 3 && value.length <= 6) {
        value = value.replace(/(\d{3})(\d{1,3})/, '$1-$2');
    } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3');
    }

    // Update input value
    input.value = value;

    // Validate input and show error message if invalid characters were entered
    if (value !== cleanedValue) {
        document.getElementById("error-message").style.display = "block";
    } else {
        document.getElementById("error-message").style.display = "none";
    }
});