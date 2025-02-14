function toggleNavbar() {
    const navbar = document.querySelector('.navbar');
    const content = document.querySelector('.content');
    navbar.classList.toggle('active');
    content.classList.toggle('shifted');
}