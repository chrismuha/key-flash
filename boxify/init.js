document.addEventListener("DOMContentLoaded", () => {
    const enabled = (() => { try { return JSON.parse(localStorage.getItem('boxify.enabled') || '[]'); } catch { return []; } })();
    Boxify.init({ selector: ".ui-item", gridSelector: "#inventory", enabled });

    const btn = document.getElementById("reset-all");
    btn?.addEventListener("click", () => {
        localStorage.removeItem("boxify.counts");
        location.reload();
    });
});
