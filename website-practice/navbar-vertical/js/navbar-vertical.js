function toggleNavbar() {
    const navbar = document.querySelector('.navbar');
    const content = document.querySelector('.content');
    const rectangle = document.querySelector('#rectangle1');

    navbar.classList.toggle('active');
    content.classList.toggle('shifted');

    // Toggle visibility of #rectangle1
    if (navbar.classList.contains('active')) {
        rectangle.style.display = "block";
    } else {
        rectangle.style.display = "none";
    }
}