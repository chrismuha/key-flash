// Shared PDF export helpers for form pages.
(function initPdfExportHelpers() {
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

    window.PdfExportShared = {
        exportTemplatePdf,
    };
})();
