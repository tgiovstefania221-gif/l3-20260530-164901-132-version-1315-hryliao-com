(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  const filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const search = filterPanel.querySelector('[data-filter-search]');
    const region = filterPanel.querySelector('[data-filter-region]');
    const year = filterPanel.querySelector('[data-filter-year]');
    const type = filterPanel.querySelector('[data-filter-type]');

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function filter() {
      const q = valueOf(search);
      const r = valueOf(region);
      const y = valueOf(year);
      const t = valueOf(type);
      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        const matched = (!q || haystack.indexOf(q) !== -1) &&
          (!r || valueOf({ value: card.getAttribute('data-region') || '' }) === r) &&
          (!y || valueOf({ value: card.getAttribute('data-year') || '' }) === y) &&
          (!t || valueOf({ value: card.getAttribute('data-type') || '' }) === t);
        card.classList.toggle('hidden-card', !matched);
      });
    }

    [search, region, year, type].forEach(function (input) {
      if (input) {
        input.addEventListener('input', filter);
        input.addEventListener('change', filter);
      }
    });
    filter();
  }
})();
