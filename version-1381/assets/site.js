(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
      index = nextIndex % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupHomeSearch() {
    var form = document.querySelector("[data-home-search-form]");

    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var input = form.querySelector("input");
      var query = input ? input.value.trim() : "";
      var target = "search.html";

      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }

      window.location.href = target;
    });
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var count = document.querySelector("[data-search-count]");

    if (!panel || cards.length === 0) {
      return;
    }

    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var genre = panel.querySelector("[data-filter-genre]");

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery && keyword) {
      keyword.value = initialQuery;
    }

    function contains(source, term) {
      return source.toLowerCase().indexOf(term.toLowerCase()) !== -1;
    }

    function applyFilter() {
      var keywordValue = keyword ? keyword.value.trim() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var genreValue = genre ? genre.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardGenre = card.getAttribute("data-genre") || "";

        var matched = true;

        if (keywordValue && !contains(searchText, keywordValue)) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }

        if (genreValue && !contains(cardGenre, genreValue)) {
          matched = false;
        }

        card.classList.toggle("hidden-by-filter", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前匹配 " + visible + " 部影片";
      }
    }

    [keyword, year, region, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupHomeSearch();
    setupFilters();
  });
})();
