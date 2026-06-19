const searchIndex = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
const bodyBase = document.body ? (document.body.dataset.base || '') : '';

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '');
}

function joinPath(base, href) {
  if (!href) {
    return '#';
  }
  if (/^(https?:)?\/\//.test(href) || href.startsWith('#')) {
    return href;
  }
  return `${base}${href}`;
}

function setupMobileMenu() {
  const button = document.querySelector('[data-menu-button]');
  const drawer = document.querySelector('[data-mobile-drawer]');
  if (!button || !drawer) {
    return;
  }
  button.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupGlobalSearch() {
  document.querySelectorAll('.global-search').forEach((form) => {
    const input = form.querySelector('.global-search-input');
    const panel = form.querySelector('.search-suggestions');
    if (!input || !panel) {
      return;
    }

    const render = () => {
      const query = normalizeText(input.value);
      if (!query) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return;
      }

      const results = searchIndex
        .filter((item) => normalizeText(`${item.title}${item.year}${item.region}${item.genre}${item.category}`).includes(query))
        .slice(0, 8);

      if (!results.length) {
        panel.classList.add('is-open');
        panel.innerHTML = '<p class="empty-search">未找到匹配影片</p>';
        return;
      }

      panel.innerHTML = results.map((item) => {
        const href = joinPath(bodyBase, item.href);
        const image = joinPath(bodyBase, `${item.image}.jpg`);
        return `
          <a href="${href}">
            <img src="${image}" alt="${item.title} 封面" loading="lazy" />
            <span>
              <strong>${item.title}</strong>
              <small>${item.year} · ${item.region} · ${item.genre}</small>
            </span>
          </a>`;
      }).join('');
      panel.classList.add('is-open');
    };

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('blur', () => {
      window.setTimeout(() => panel.classList.remove('is-open'), 160);
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = normalizeText(input.value);
      const first = searchIndex.find((item) => normalizeText(`${item.title}${item.year}${item.region}${item.genre}${item.category}`).includes(query));
      if (first) {
        window.location.href = joinPath(bodyBase, first.href);
      }
    });
  });
}

function setupLocalFilters() {
  const searchInput = document.querySelector('[data-local-search]');
  const cards = Array.from(document.querySelectorAll('.searchable-card'));
  const counter = document.querySelector('[data-result-counter]');
  const filterControls = Array.from(document.querySelectorAll('[data-filter]'));
  if (!cards.length || (!searchInput && !filterControls.length)) {
    return;
  }

  const update = () => {
    const query = normalizeText(searchInput ? searchInput.value : '');
    const filters = Object.fromEntries(filterControls.map((control) => [control.dataset.filter, control.value]));
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalizeText(`${card.dataset.title}${card.dataset.year}${card.dataset.region}${card.dataset.type}${card.dataset.genre}${card.dataset.category}`);
      const matchSearch = !query || haystack.includes(query);
      const matchFilters = Object.entries(filters).every(([key, value]) => !value || card.dataset[key] === value);
      const isVisible = matchSearch && matchFilters;
      card.classList.toggle('is-hidden', !isVisible);
      if (isVisible) {
        visible += 1;
      }
    });

    if (counter) {
      counter.textContent = `显示 ${visible} / ${cards.length} 部`;
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', update);
  }
  filterControls.forEach((control) => control.addEventListener('change', update));
  update();
}

function setupHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }
  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
  const prev = slider.querySelector('[data-hero-prev]');
  const next = slider.querySelector('[data-hero-next]');
  if (slides.length < 2) {
    return;
  }

  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === current));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === current));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 6000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  if (prev) {
    prev.addEventListener('click', () => {
      show(current - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      show(current + 1);
      start();
    });
  }
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  start();
}

async function loadHlsLibrary() {
  const moduleUrl = new URL('../vendor/video-vendor-dru42stk.js', import.meta.url).href;
  const module = await import(moduleUrl);
  return module.H;
}

function setupPlayers() {
  document.querySelectorAll('.video-player').forEach((player) => {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');
    const message = player.querySelector('[data-player-message]');
    const source = player.dataset.video;
    let started = false;

    if (!video || !cover || !source) {
      return;
    }

    const setMessage = (text) => {
      if (message) {
        message.textContent = text || '';
      }
    };

    const startPlayback = async () => {
      if (started) {
        try {
          await video.play();
        } catch (error) {
          setMessage('浏览器阻止自动播放，请再次点击播放按钮。');
        }
        return;
      }

      started = true;
      player.classList.add('is-loading');
      setMessage('正在加载播放源...');

      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          player.classList.add('is-playing');
          setMessage('');
          await video.play();
          return;
        }

        const Hls = await loadHlsLibrary();
        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          player.hlsInstance = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            player.classList.add('is-playing');
            setMessage('');
            try {
              await video.play();
            } catch (error) {
              setMessage('播放已就绪，请点击视频画面继续。');
            }
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              setMessage('播放源加载异常，请刷新页面或稍后重试。');
            }
          });
          return;
        }

        video.src = source;
        player.classList.add('is-playing');
        setMessage('');
        await video.play();
      } catch (error) {
        started = false;
        player.classList.remove('is-playing');
        setMessage('播放器初始化失败，请检查网络或播放源。');
      } finally {
        player.classList.remove('is-loading');
      }
    };

    cover.addEventListener('click', startPlayback);
    video.addEventListener('click', () => {
      if (!started) {
        startPlayback();
      }
    });
  });
}

setupMobileMenu();
setupGlobalSearch();
setupLocalFilters();
setupHeroSlider();
setupPlayers();
