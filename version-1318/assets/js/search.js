(function () {
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    if (!input || !results || !window.MOVIE_INDEX) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function card(movie) {
        var tagText = (movie.tags || []).slice(0, 3).join(' / ') || movie.genre;
        return '' +
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
                '<span class="movie-card__poster">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="movie-card__year">' + escapeHtml(movie.year) + '</span>' +
                    '<span class="movie-card__play">▶</span>' +
                '</span>' +
                '<span class="movie-card__body">' +
                    '<span class="movie-card__category">' + escapeHtml(movie.category) + '</span>' +
                    '<strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<span class="movie-card__line">' + escapeHtml(movie.oneLine) + '</span>' +
                    '<span class="movie-card__meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(tagText) + '</span>' +
                '</span>' +
            '</a>';
    }

    function render() {
        var query = input.value.trim().toLowerCase();
        var matched = window.MOVIE_INDEX.filter(function (movie) {
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();
            return !query || text.indexOf(query) !== -1;
        }).slice(0, 120);

        count.textContent = String(matched.length);

        if (!matched.length) {
            results.innerHTML = '<div class="search-empty">没有找到匹配影片，可以换一个片名、地区、年份或题材继续搜索。</div>';
            return;
        }

        results.innerHTML = matched.map(card).join('');
    }

    input.addEventListener('input', render);
    render();
})();
