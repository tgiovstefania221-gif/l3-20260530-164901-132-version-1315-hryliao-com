(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    var search = document.querySelector(".nav-search");
    if (!toggle || !menu || !search) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      search.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-dots button"));
    var previous = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function attachHls(video, source) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    video.src = source;
  }

  function initPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var source = config.source;
    var attached = false;

    function start() {
      if (!video || !source) {
        return;
      }
      if (!attached) {
        attachHls(video, source);
        attached = true;
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    }
  }

  window.MoviePlayer = {
    init: initPlayer
  };

  function initSearch() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-search-category]");
    var year = document.querySelector("[data-search-year]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    if (!form || !input || !results || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function safe(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function render(items) {
      results.innerHTML = "";
      if (status) {
        status.textContent = "找到 " + items.length + " 部影片";
      }
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有匹配内容，请尝试其他关键词。</div>';
        return;
      }
      items.forEach(function (item) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.innerHTML = [
          '<a class="poster-link" href="' + safe(item.url) + '">',
          '<img src="' + safe(item.cover) + '" alt="' + safe(item.title) + '" loading="lazy">',
          '<span class="quality-badge">高清</span>',
          '<span class="play-mark">▶</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<div class="movie-meta">' + safe(item.year) + ' · ' + safe(item.type) + ' · ' + safe(item.region) + '</div>',
          '<h3><a href="' + safe(item.url) + '">' + safe(item.title) + '</a></h3>',
          '<p>' + safe(item.oneLine) + '</p>',
          '<div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + safe(tag) + '</span>'; }).join("") + '</div>',
          '</div>'
        ].join("");
        results.appendChild(article);
      });
    }

    function apply() {
      var keyword = normalize(input.value);
      var cat = category ? category.value : "";
      var yearValue = year ? year.value : "";
      var matched = window.SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([item.title, item.region, item.type, item.year, item.category, item.oneLine, item.tags.join(" ")].join(" "));
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var categoryOk = !cat || item.categorySlug === cat;
        var yearOk = !yearValue || item.year === yearValue;
        return keywordOk && categoryOk && yearOk;
      });
      render(matched);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    initMenu();
    initCarousel();
    initBackTop();
    initSearch();
  });
})();
