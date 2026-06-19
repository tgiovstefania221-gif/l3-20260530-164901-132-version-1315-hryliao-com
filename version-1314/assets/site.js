document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mainNav = document.querySelector("[data-main-nav]");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dotsWrap = carousel.querySelector("[data-hero-dots]");
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换推荐影片" + (index + 1));
        dot.addEventListener("click", function () {
          showSlide(index);
        });
        dotsWrap.appendChild(dot);
      });
    }

    showSlide(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filter = document.querySelector("[data-list-filter]");
  if (filter) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    filter.value = initialQuery;

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilter() {
      var query = filter.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var matched = query === "" || haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.style.display = visible === 0 ? "block" : "none";
      }
    }

    filter.addEventListener("input", applyFilter);
    applyFilter();
  }
});
