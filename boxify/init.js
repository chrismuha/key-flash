document.addEventListener("DOMContentLoaded", () => {
    Boxify.init({
        selector: ".ui-item",
        gridSelector: "#inventory"
    });

    const btn = document.getElementById("reset-all");
    btn?.addEventListener("click", () => {
        localStorage.removeItem("boxify.counts");
        location.reload();
    });
});
