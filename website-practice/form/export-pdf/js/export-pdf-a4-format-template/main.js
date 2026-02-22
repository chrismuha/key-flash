document.getElementById("exportButton")?.addEventListener("click", async () => {
    await window.PdfExportShared?.exportTemplatePdf({
        templateURL: "https://via.placeholder.com/595x842",
        canvasWidth: 595,
        canvasHeight: 842,
        imageWidth: 210,
        imageHeight: 297,
        text: "Hello, this is content over the template!",
        textX: 20,
        textY: 50,
        fileName: "custom-template.pdf",
    });
});
