(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
                dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img[data-fallback]"));
        images.forEach(function (image) {
            function markFallback() {
                var parent = image.closest(".poster-shell, .hero-slide, .rank-thumb, .related-thumb");
                if (parent) {
                    parent.classList.add("is-fallback");
                }
            }

            image.addEventListener("error", markFallback);
            if (image.complete && image.naturalWidth === 0) {
                markFallback();
            }
        });
    }

    function setupHorizontalScrollers() {
        var wrappers = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-wrap]"));
        wrappers.forEach(function (wrapper) {
            var list = wrapper.querySelector("[data-scroll-list]");
            var previous = wrapper.querySelector("[data-scroll-prev]");
            var next = wrapper.querySelector("[data-scroll-next]");
            if (!list) {
                return;
            }

            if (previous) {
                previous.addEventListener("click", function () {
                    list.scrollBy({ left: -420, behavior: "smooth" });
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    list.scrollBy({ left: 420, behavior: "smooth" });
                });
            }
        });
    }

    function setupLocalFilters() {
        var groups = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
        groups.forEach(function (group) {
            var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-filter-value]"));
            var targetSelector = group.getAttribute("data-target") || "[data-movie-card]";
            var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-value");
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    cards.forEach(function (card) {
                        var cardType = card.getAttribute("data-type") || "";
                        var shouldShow = value === "全部" || cardType.indexOf(value) !== -1;
                        card.style.display = shouldShow ? "" : "none";
                    });
                });
            });
        });
    }

    function setupBackToTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }

        window.addEventListener("scroll", function () {
            button.classList.toggle("is-visible", window.scrollY > 480);
        }, { passive: true });

        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    ready(function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupImageFallbacks();
        setupHorizontalScrollers();
        setupLocalFilters();
        setupBackToTop();
    });
})();
