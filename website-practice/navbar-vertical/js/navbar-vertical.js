// Section: Navbar Toggle
function toggleNavbar() {
    const navbar = document.querySelector('.navbar');
    const content = document.querySelector('.content');
    const rectangle = document.querySelector('#rectangle1');
    const gap = document.querySelector('#rectangle-gap');

    navbar.classList.toggle('active');
    content.classList.toggle('shifted');

    const isActive = navbar.classList.contains('active');
    rectangle.style.display = isActive ? "block" : "none";
    gap.style.display = isActive ? "block" : "none";

    // If navbar is active, add event listener to detect clicks outside
    if (isActive) {
        document.addEventListener("click", closeNavbarOutside);
    } else {
        document.removeEventListener("click", closeNavbarOutside);
    }
}

// Section: Close On Outside Click
function closeNavbarOutside(event) {
    const navbar = document.querySelector('.navbar');
    const rectangle = document.querySelector('#rectangle1');
    const gap = document.querySelector('#rectangle-gap');
    const toggleButton = document.querySelector('.toggle-button');

    // Check if the clicked element is NOT inside the navbar, rectangle, gap, or toggle button
    if (!navbar.contains(event.target) && !rectangle.contains(event.target) && !gap.contains(event.target) && !toggleButton.contains(event.target)) {
        navbar.classList.remove('active');
        document.querySelector('.content').classList.remove('shifted');
        rectangle.style.display = "none";
        gap.style.display = "none";

        // Remove event listener after closing
        document.removeEventListener("click", closeNavbarOutside);
    }
}
