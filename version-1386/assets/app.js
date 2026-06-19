(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var localSearch = document.querySelector(".local-search");
    if (localSearch) {
      localSearch.addEventListener("input", function () {
        var keyword = localSearch.value.trim().toLowerCase();
        document.querySelectorAll(".movie-card").forEach(function (card) {
          var haystack = card.getAttribute("data-search") || "";
          card.style.display = haystack.indexOf(keyword) >= 0 ? "" : "none";
        });
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (slides.length) {
      var current = 0;
      var show = function (index) {
        slides[current].classList.remove("is-active");
        current = (index + slides.length) % slides.length;
        slides[current].classList.add("is-active");
      };
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
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    var player = document.querySelector(".player-box");
    if (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var started = false;
      var start = function () {
        if (!video || started) {
          return;
        }
        started = true;
        var url = video.getAttribute("data-play");
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      };
      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
    }

    var searchGrid = document.querySelector(".search-results");
    if (searchGrid && window.SEARCH_MOVIES) {
      var input = document.querySelector("#searchInput");
      var select = document.querySelector("#categorySelect");
      var empty = document.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (input) {
        input.value = initial;
      }
      var render = function () {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var category = select ? select.value : "";
        var items = window.SEARCH_MOVIES.filter(function (item) {
          var matchKeyword = !keyword || item.search.indexOf(keyword) >= 0;
          var matchCategory = !category || item.category === category;
          return matchKeyword && matchCategory;
        }).slice(0, 120);
        searchGrid.innerHTML = items.map(function (item) {
          return [
            '<article class="movie-card">',
            '  <a class="poster-wrap" href="' + item.url + '" aria-label="观看' + item.title + '">',
            '    <img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
            '    <span class="poster-badge">' + item.year + '</span>',
            '  </a>',
            '  <div class="card-body">',
            '    <h2><a href="' + item.url + '">' + item.title + '</a></h2>',
            '    <p class="card-line">' + item.line + '</p>',
            '    <div class="meta-row"><span>' + item.region + '</span><span>' + item.type + '</span></div>',
            '    <div class="tag-row"><span>' + item.categoryName + '</span></div>',
            '  </div>',
            '</article>'
          ].join("");
        }).join("");
        if (empty) {
          empty.style.display = items.length ? "none" : "block";
        }
      };
      if (input) {
        input.addEventListener("input", render);
      }
      if (select) {
        select.addEventListener("change", render);
      }
      render();
    }
  });
})();
