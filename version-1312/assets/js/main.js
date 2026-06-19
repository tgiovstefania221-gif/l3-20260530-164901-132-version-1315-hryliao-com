(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
  var searchPanel = document.querySelector('[data-search-panel]');

  function closeSearchPanel() {
    if (searchPanel) {
      searchPanel.hidden = true;
      searchPanel.innerHTML = '';
    }
  }

  function renderSearch(query) {
    if (!searchPanel) {
      return;
    }

    var keyword = normalize(query);
    if (!keyword) {
      closeSearchPanel();
      return;
    }

    var data = window.SEARCH_INDEX || [];
    var results = data.filter(function (item) {
      var haystack = normalize([item.title, item.region, item.year, item.type, item.genre].join(' '));
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 12);

    searchPanel.hidden = false;

    if (!results.length) {
      searchPanel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
      return;
    }

    searchPanel.innerHTML = results.map(function (item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<span class="search-thumb" style="--poster-image: url(\'' + item.cover + '\');"></span>' +
        '<span><strong>' + escapeHtml(item.title) + '</strong>' +
        '<span>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</span></span>' +
        '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  searchForms.forEach(function (form) {
    var input = form.querySelector('[data-search-input]');

    if (!input) {
      return;
    }

    input.addEventListener('input', function () {
      renderSearch(input.value);
    });

    input.addEventListener('focus', function () {
      renderSearch(input.value);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(input.value);
      var first = searchPanel ? searchPanel.querySelector('.search-result') : null;
      if (first) {
        window.location.href = first.getAttribute('href');
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!searchPanel || searchPanel.hidden) {
      return;
    }

    var withinPanel = searchPanel.contains(event.target);
    var withinForm = event.target.closest && event.target.closest('[data-search-form]');

    if (!withinPanel && !withinForm) {
      closeSearchPanel();
    }
  });

  var localFilter = document.querySelector('[data-local-filter]');
  var localGrid = document.querySelector('[data-local-grid]');

  if (localFilter && localGrid) {
    var localCards = Array.prototype.slice.call(localGrid.querySelectorAll('.movie-card'));

    localFilter.addEventListener('input', function () {
      var keyword = normalize(localFilter.value);

      localCards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));

        card.classList.toggle('is-filter-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  function initPlayer(player) {
    var video = player.querySelector('video[data-hls-url]');
    var button = player.querySelector('[data-player-button]');
    var message = player.querySelector('[data-player-message]');
    var hlsInstance = null;
    var loaded = false;

    if (!video) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function loadVideo() {
      return new Promise(function (resolve, reject) {
        if (loaded) {
          resolve();
          return;
        }

        var url = video.getAttribute('data-hls-url');

        if (!url) {
          setMessage('视频加载失败，请稍后重试');
          reject(new Error('missing url'));
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            loaded = true;
            setMessage('');
            resolve();
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请稍后重试');
              reject(new Error('hls error'));
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          loaded = true;
          setMessage('');
          resolve();
        } else {
          setMessage('视频加载失败，请稍后重试');
          reject(new Error('unsupported'));
        }
      });
    }

    function play() {
      setMessage('');
      loadVideo().then(function () {
        return video.play();
      }).then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      }).catch(function () {
        setMessage('点击视频区域可继续播放');
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
