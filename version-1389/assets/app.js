(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "search.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupLocalFilters() {
    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var year = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    if (!cards.length) {
      return;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var y = year ? year.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.textContent).toLowerCase();
        var matchesText = !q || text.indexOf(q) !== -1;
        var matchesRegion = !r || card.getAttribute("data-region") === r;
        var matchesYear = !y || card.getAttribute("data-year") === y;
        card.style.display = matchesText && matchesRegion && matchesYear ? "" : "none";
      });
    }

    [input, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function cardTemplate(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
    return [
      '<article class="movie-card" data-filter-card data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-tags="' + escapeHtml(tags.join(" ")) + '">',
      '<a class="poster-link" href="' + escapeHtml(movie.file) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-overlay"><span class="play-circle">▶</span></span>',
      '</a>',
      '<div class="card-body">',
      '<h2 class="card-title"><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p class="card-desc">' + escapeHtml(movie.one_line) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<div class="card-tags">' + tags.map(function (tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-page-input]");
    var title = document.querySelector("[data-search-title]");
    if (input) {
      input.value = q;
    }
    if (title) {
      title.textContent = q ? "搜索结果：" + q : "影片搜索";
    }

    function render(value) {
      var keyword = String(value || "").trim().toLowerCase();
      var list = window.SEARCH_INDEX.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return [movie.title, movie.one_line, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.length ? list.map(cardTemplate).join("") : '<div class="empty-state">没有找到匹配的影片</div>';
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(q);
  }

  function setupPlayers() {
    document.querySelectorAll(".movie-player").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var stream = player.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      function attach() {
        if (loaded || !video || !stream) {
          return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1600);
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function start() {
        attach().then(function () {
          player.classList.add("is-playing");
          video.controls = true;
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        });
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      player.addEventListener("click", function (event) {
        if (!loaded && event.target === player) {
          start();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupSearchForms();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
