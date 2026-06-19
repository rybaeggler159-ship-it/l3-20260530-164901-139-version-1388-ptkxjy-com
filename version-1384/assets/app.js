(function () {
    function closestForm(element) {
        return element ? element.closest("form") : null;
    }

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function createSuggestion(item) {
        var link = document.createElement("a");
        link.className = "search-suggestion";
        link.href = "./" + item.url;

        var img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title;
        img.loading = "lazy";

        var copy = document.createElement("span");
        var title = document.createElement("strong");
        title.textContent = item.title;
        var meta = document.createElement("span");
        meta.textContent = item.year + " · " + item.region + " · " + item.genre;

        copy.appendChild(title);
        copy.appendChild(meta);
        link.appendChild(img);
        link.appendChild(copy);
        return link;
    }

    function searchItems(query) {
        var value = normalizeText(query);
        if (!value || !window.SEARCH_ITEMS) {
            return [];
        }
        return window.SEARCH_ITEMS.filter(function (item) {
            var haystack = normalizeText(item.title + " " + item.region + " " + item.genre + " " + item.year + " " + item.type);
            return haystack.indexOf(value) !== -1;
        }).slice(0, 8);
    }

    function bindGlobalSearch() {
        document.querySelectorAll(".site-search").forEach(function (input) {
            var form = closestForm(input);
            var box = form ? form.querySelector(".search-suggestions") : null;

            function render() {
                if (!box) {
                    return;
                }
                var results = searchItems(input.value);
                box.innerHTML = "";
                if (!results.length) {
                    box.classList.remove("is-open");
                    return;
                }
                results.forEach(function (item) {
                    box.appendChild(createSuggestion(item));
                });
                box.classList.add("is-open");
            }

            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            input.addEventListener("blur", function () {
                window.setTimeout(function () {
                    if (box) {
                        box.classList.remove("is-open");
                    }
                }, 180);
            });

            if (form) {
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    var results = searchItems(input.value);
                    if (results.length) {
                        window.location.href = "./" + results[0].url;
                    }
                });
            }
        });
    }

    function bindMobileMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("mobile-open");
            toggle.textContent = document.body.classList.contains("mobile-open") ? "×" : "☰";
        });
    }

    function bindHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var index = 0;

        function setSlide(nextIndex) {
            index = nextIndex % slides.length;
            if (index < 0) {
                index = slides.length - 1;
            }
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(parseInt(dot.getAttribute("data-slide"), 10));
            });
        });

        window.setInterval(function () {
            setSlide(index + 1);
        }, 5200);
    }

    function bindFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector(".list-search");
            var year = panel.querySelector(".filter-year");
            var type = panel.querySelector(".filter-type");
            var scope = panel.parentElement;
            var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));

            function applyFilter() {
                var query = normalizeText(input ? input.value : "");
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";

                items.forEach(function (item) {
                    var text = normalizeText([
                        item.getAttribute("data-title"),
                        item.getAttribute("data-region"),
                        item.getAttribute("data-year"),
                        item.getAttribute("data-type"),
                        item.getAttribute("data-genre"),
                    ].join(" "));
                    var itemYear = item.getAttribute("data-year") || "";
                    var itemType = item.getAttribute("data-type") || "";
                    var yearMatch = !selectedYear || itemYear.indexOf(selectedYear) !== -1 || (selectedYear === "更早" && parseInt(itemYear, 10) < 2018);
                    var typeMatch = !selectedType || itemType.indexOf(selectedType) !== -1;
                    var queryMatch = !query || text.indexOf(query) !== -1;
                    item.classList.toggle("hidden-by-filter", !(queryMatch && yearMatch && typeMatch));
                });
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        bindGlobalSearch();
        bindMobileMenu();
        bindHeroSlider();
        bindFilters();
    });
}());
