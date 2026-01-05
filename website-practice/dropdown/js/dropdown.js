document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    if (!dropdown) return;
    const button = dropdown.querySelector('.dropbtn');
    const menu = dropdown.querySelector('.dropdown-content');

    const closeDropdown = () => {
        menu.classList.remove('show');
        button.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
    };

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = menu.classList.toggle('show');
        button.classList.toggle('active', isOpen);
        button.setAttribute('aria-expanded', isOpen.toString());
    });

    document.addEventListener('click', closeDropdown);
});
