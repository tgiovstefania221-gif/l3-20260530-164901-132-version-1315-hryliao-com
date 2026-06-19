(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
            dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var filterInput = document.querySelector('[data-filter-input]');
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var filterCount = document.querySelector('[data-filter-count]');

    if (filterInput && filterItems.length) {
        filterInput.addEventListener('input', function () {
            var query = filterInput.value.trim().toLowerCase();
            var visibleCount = 0;

            filterItems.forEach(function (item) {
                var text = (item.getAttribute('data-filter') || '').toLowerCase();
                var matched = !query || text.indexOf(query) !== -1;
                item.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (filterCount) {
                filterCount.textContent = String(visibleCount);
            }
        });
    }
})();
