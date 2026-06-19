(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function includesValue(source, target) {
        if (!target) {
            return true;
        }
        return normalize(source).indexOf(normalize(target)) !== -1;
    }

    function createCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.setAttribute("data-movie-card", "");
        article.setAttribute("data-type", movie.type || "");

        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join(" ");

        article.innerHTML = [
            "<a class="movie-card-link" href="" + escapeAttribute(movie.href) + "">",
            "    <div class="poster-shell" data-title="" + escapeAttribute(movie.title) + "">",
            "        <img src="" + escapeAttribute(movie.cover) + "" alt="" + escapeAttribute(movie.title) + " 海报" loading="lazy" data-fallback="image">",
            "        <span class="poster-badge">" + escapeHtml(movie.category) + "</span>",
            "        <div class="poster-overlay"><span class="play-chip">▶</span></div>",
            "    </div>",
            "    <div class="movie-card-body">",
            "        <h3 class="line-clamp-2">" + escapeHtml(movie.title) + "</h3>",
            "        <p class="line-clamp-2">" + escapeHtml(movie.oneLine) + "</p>",
            "        <div class="card-meta">",
            "            <span>🔥 " + escapeHtml(movie.heat) + "</span>",
            "            <span>" + escapeHtml(movie.region) + "</span>",
            "            <span>" + escapeHtml(movie.year) + "</span>",
            "        </div>",
            "        <div class="detail-tags">" + tags + "</div>",
            "    </div>",
            "</a>"
        ].join("
");

        return article;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
    }

    function setupSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var results = document.querySelector("[data-search-results]");
        var count = document.querySelector("[data-search-count]");
        var loadMore = document.querySelector("[data-load-more]");
        var allMovies = window.MOVIE_INDEX || [];
        var visibleCount = 0;
        var filtered = [];

        if (!form || !results) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var keywordInput = form.querySelector("[name='q']");
        var typeSelect = form.querySelector("[name='type']");
        var categorySelect = form.querySelector("[name='category']");
        var yearSelect = form.querySelector("[name='year']");

        if (keywordInput) {
            keywordInput.value = params.get("q") || "";
        }
        if (typeSelect) {
            typeSelect.value = params.get("type") || "";
        }
        if (categorySelect) {
            categorySelect.value = params.get("category") || "";
        }
        if (yearSelect) {
            yearSelect.value = params.get("year") || "";
        }

        function getCriteria() {
            return {
                q: keywordInput ? keywordInput.value : "",
                type: typeSelect ? typeSelect.value : "",
                category: categorySelect ? categorySelect.value : "",
                year: yearSelect ? yearSelect.value : "",
            };
        }

        function updateUrl(criteria) {
            var next = new URLSearchParams();
            Object.keys(criteria).forEach(function (key) {
                if (criteria[key]) {
                    next.set(key, criteria[key]);
                }
            });
            var suffix = next.toString();
            window.history.replaceState({}, "", suffix ? "search.html?" + suffix : "search.html");
        }

        function applyFilters() {
            var criteria = getCriteria();
            updateUrl(criteria);
            filtered = allMovies.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ");
                return includesValue(haystack, criteria.q)
                    && includesValue(movie.type, criteria.type)
                    && includesValue(movie.category, criteria.category)
                    && includesValue(movie.year, criteria.year);
            });
            visibleCount = 0;
            results.innerHTML = "";
            renderMore();
        }

        function renderMore() {
            var nextItems = filtered.slice(visibleCount, visibleCount + 60);
            nextItems.forEach(function (movie) {
                results.appendChild(createCard(movie));
            });
            visibleCount += nextItems.length;
            if (count) {
                count.textContent = "共找到 " + filtered.length + " 部影片，已显示 " + visibleCount + " 部";
            }
            if (loadMore) {
                loadMore.style.display = visibleCount < filtered.length ? "inline-flex" : "none";
            }

            var images = Array.prototype.slice.call(results.querySelectorAll("img[data-fallback]"));
            images.forEach(function (image) {
                image.addEventListener("error", function () {
                    var parent = image.closest(".poster-shell");
                    if (parent) {
                        parent.classList.add("is-fallback");
                    }
                });
            });
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilters();
        });

        Array.prototype.slice.call(form.querySelectorAll("select")).forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        if (loadMore) {
            loadMore.addEventListener("click", renderMore);
        }

        applyFilters();
    }

    ready(setupSearchPage);
})();
