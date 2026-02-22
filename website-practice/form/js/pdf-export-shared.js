// Shared PDF export helpers for form pages.
(function initPdfExportHelpers() {
    const TEMPLATE_PRESETS = {
        letter: {
            format: "letter",
            templateURL: "https://via.placeholder.com/612x792",
            canvasWidth: 612,
            canvasHeight: 792,
            imageWidth: 216,
            imageHeight: 279,
            text: "Hello, this is content over the template!",
            textX: 20,
            textY: 50,
            fileName: "custom-letter-template.pdf",
        },
        a4: {
            templateURL: "https://via.placeholder.com/595x842",
            canvasWidth: 595,
            canvasHeight: 842,
            imageWidth: 210,
            imageHeight: 297,
            text: "Hello, this is content over the template!",
            textX: 20,
            textY: 50,
            fileName: "custom-template.pdf",
        },
    };

    function createImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    }

    async function exportTemplatePdf(options) {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) return;

        const {
            format,
            templateURL,
            canvasWidth,
            canvasHeight,
            imageWidth,
            imageHeight,
            text,
            textX,
            textY,
            fileName,
        } = options || {};

        const doc = format ? new jsPDF({ format }) : new jsPDF();

        const templateImage = await fetch(templateURL)
            .then((response) => response.blob())
            .then((blob) => createImageFromBlob(blob));

        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const context = canvas.getContext("2d");
        context.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/png");
        doc.addImage(imageData, "PNG", 0, 0, imageWidth, imageHeight);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(text, textX, textY);
        doc.save(fileName);
    }

    async function exportTemplatePreset(name) {
        const preset = TEMPLATE_PRESETS[name];
        if (!preset) return;
        await exportTemplatePdf(preset);
    }

    function bindExportButton(buttonId, presetName) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        button.addEventListener("click", async () => {
            await exportTemplatePreset(presetName);
        });
    }

    window.PdfExportShared = {
        exportTemplatePdf,
        exportTemplatePreset,
        bindExportButton,
    };
})();
