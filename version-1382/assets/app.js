(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function renderSearchResults(box, query) {
    if (!box || !window.SiteSearchData) {
      return;
    }
    var q = text(query).trim();
    if (!q) {
      box.classList.remove("is-open");
      box.innerHTML = "";
      return;
    }
    var results = window.SiteSearchData.filter(function (item) {
      return text(item.title).indexOf(q) !== -1 ||
        text(item.genre).indexOf(q) !== -1 ||
        text(item.tags).indexOf(q) !== -1 ||
        text(item.region).indexOf(q) !== -1;
    }).slice(0, 6);
    box.innerHTML = results.map(function (item) {
      return "<a href=\"./" + item.url + "\"><img src=\"" + item.image + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\"><span><strong>" + item.title + "</strong><em>" + item.genre + "</em></span></a>";
    }).join("");
    box.classList.toggle("is-open", results.length > 0);
  }

  function initSiteSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var box = form.querySelector("[data-search-results]");
      if (!input) {
        return;
      }
      input.addEventListener("input", function () {
        renderSearchResults(box, input.value);
      });
      input.addEventListener("focus", function () {
        renderSearchResults(box, input.value);
      });
      input.addEventListener("blur", function () {
        window.setTimeout(function () {
          if (box) {
            box.classList.remove("is-open");
          }
        }, 180);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var q = input.value.trim();
        if (q) {
          window.location.href = "./movies.html?q=" + encodeURIComponent(q);
        }
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var grid = panel.parentElement.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .ranking-row"));
      if (input && query) {
        input.value = query;
      }
      function apply() {
        var q = text(input && input.value).trim();
        var y = text(year && year.value).trim();
        var t = text(type && type.value).trim();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type")
          ].map(text).join(" ");
          var okQuery = !q || haystack.indexOf(q) !== -1;
          var okYear = !y || text(card.getAttribute("data-year")).indexOf(y) !== -1;
          var okType = !t || text(card.getAttribute("data-type")).indexOf(t) !== -1;
          card.classList.toggle("is-hidden", !(okQuery && okYear && okType));
        });
      }
      [input, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.SitePlayer = {
    init: function (videoId, streamUrl) {
      ready(function () {
        var video = document.getElementById(videoId);
        if (!video) {
          return;
        }
        var box = video.closest(".player-box");
        var trigger = box ? box.querySelector(".play-trigger") : null;
        var attached = false;
        var hls = null;
        function attach() {
          if (attached) {
            return;
          }
          attached = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
          } else {
            video.src = streamUrl;
          }
        }
        function play() {
          attach();
          if (box) {
            box.classList.add("is-playing");
          }
          var result = video.play();
          if (result && result.catch) {
            result.catch(function () {
              if (box) {
                box.classList.remove("is-playing");
              }
            });
          }
        }
        if (trigger) {
          trigger.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        window.addEventListener("beforeunload", function () {
          if (hls) {
            hls.destroy();
          }
        });
      });
    }
  };

  ready(function () {
    initMenu();
    initSiteSearch();
    initHero();
    initFilters();
  });
})();
