const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    mainNav.classList.toggle('is-open');
  });
}

const topSearchForms = document.querySelectorAll('.top-search');

topSearchForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    const input = form.querySelector('input[name="q"]');
    if (!input || !input.value.trim()) {
      event.preventDefault();
      input?.focus();
    }
  });
});
