// Section: Export PDF (US Letter)
document.getElementById("exportButton")?.addEventListener("click", async () => {
    await window.PdfExportShared?.exportTemplatePdf({
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
    });
});
