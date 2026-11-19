/* ============================================================
   MOTO DASH · 介绍页交互
   无依赖、无构建、无追踪
   ============================================================ */

(function () {
  "use strict";

  /**
   * 发布前在这里替换 APK 地址。
   * 留空时，页面上的“下载 APK”会给出“即将提供”的提示。
   */
  const DOWNLOAD_URL =
    "https://github.com/baagee/moto-dash-app-pages/releases/latest/download/moto-dash.apk";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const staticPreview = new URLSearchParams(window.location.search).has("static");

  // ?static=1 用于截图与静态预览：跳过滚动揭示并把懒加载图片全部取回。
  if (staticPreview) {
    $$('img[loading="lazy"]').forEach((img) => {
      img.loading = "eager";
      img.removeAttribute("loading");
    });
  }

  /* ---------- 页头、滚动进度与当前区块 ---------- */

  const head = $("#siteHead");
  const nav = $("#siteNav");
  const navToggle = $("#navToggle");
  const navBackdrop = $("#navBackdrop");
  const scrollProgress = $("#scrollProgress");
  const toTop = $("#toTop");

  const navLinks = $$("a[href^='#']", nav);
  const navSections = navLinks.map((link) => document.querySelector(link.getAttribute("href")));
  const HEADER_OFFSET = 150;

  const setActiveSection = () => {
    let active = null;

    navSections.forEach((section) => {
      if (section && section.getBoundingClientRect().top <= HEADER_OFFSET) {
        active = section;
      }
    });

    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) active = navSections[navSections.length - 1] || active;

    navLinks.forEach((link) => {
      const isActive = Boolean(active) && link.getAttribute("href") === `#${active.id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

    if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress.toFixed(4)})`;
    if (toTop) toTop.classList.toggle("is-visible", scrollTop > 700);
    head.classList.toggle("is-solid", scrollTop > 12);
    setActiveSection();
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScrollUI();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateScrollUI();
    if (window.innerWidth > 860) closeNav(false);
  });
  window.addEventListener("load", updateScrollUI);
  updateScrollUI();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- 移动端菜单 ---------- */

  const closeNav = (restoreFocus = false) => {
    if (!nav.classList.contains("is-open")) return;

    nav.classList.remove("is-open");
    if (navBackdrop) navBackdrop.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");

    if (restoreFocus) navToggle.focus({ preventScroll: true });
  };

  const openNav = () => {
    nav.classList.add("is-open");
    if (navBackdrop) navBackdrop.classList.add("is-open");
    document.body.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "关闭菜单");

    const firstLink = nav.querySelector("a");
    if (firstLink) firstLink.focus({ preventScroll: true });
  };

  const toggleNav = () => {
    if (nav.classList.contains("is-open")) closeNav(true);
    else openNav();
  };

  navToggle.addEventListener("click", toggleNav);
  navLinks.forEach((link) => link.addEventListener("click", () => closeNav(false)));
  if (navBackdrop) navBackdrop.addEventListener("click", () => closeNav(true));

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(event.target) || navToggle.contains(event.target)) return;
    closeNav(true);
  });

  /* ---------- 年份 ---------- */

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- 主题筛选 ---------- */

  const themeCards = $$(".theme-card");
  const filterButtons = $$(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });

      themeCards.forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.cat !== filter;
      });

      updateScrollUI();
    });
  });

  /* ---------- 图片灯箱与主题浏览 ---------- */

  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxTitle = $("#lightboxTitle");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");
  const lightboxCounter = $("#lightboxCounter");
  const lightboxHint = $("#lightboxHint");
  const galleryTriggers = $$('[data-gallery="themes"]');
  const backgroundChrome = [
    head,
    document.querySelector("main"),
    document.querySelector(".site-foot"),
    toTop,
  ].filter(Boolean);

  let lightboxGallery = [];
  let galleryIndex = -1;
  let lastFocused = null;

  const setBackgroundInert = (state) => {
    backgroundChrome.forEach((element) => {
      element.inert = state;
    });
  };

  const renderGallery = (index) => {
    const trigger = lightboxGallery[index];
    if (!trigger) return;

    const { full, title, alt } = trigger.dataset;
    lightboxImg.src = full;
    lightboxImg.alt = alt || title || "";
    lightboxTitle.textContent = title || "";
    galleryIndex = index;

    const total = lightboxGallery.length;
    lightboxCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    lightboxCounter.hidden = false;
    lightboxHint.textContent = "← → 切换 · Esc 关闭";
  };

  const openLightbox = (button) => {
    const { full, title, alt, gallery } = button.dataset;
    if (!full) return;

    if (gallery) {
      lightboxGallery = galleryTriggers.filter((item) => {
        const card = item.closest(".theme-card");
        return item.dataset.gallery === gallery && (!card || !card.hidden);
      });

      const index = lightboxGallery.indexOf(button);
      galleryIndex = index >= 0 ? index : 0;
      const hasSiblings = lightboxGallery.length > 1;
      lightboxPrev.hidden = !hasSiblings;
      lightboxNext.hidden = !hasSiblings;
      renderGallery(galleryIndex);
    } else {
      lightboxGallery = [];
      galleryIndex = -1;
      lightboxImg.src = full;
      lightboxImg.alt = alt || title || "";
      lightboxTitle.textContent = title || "";
      lightboxCounter.textContent = "";
      lightboxCounter.hidden = true;
      lightboxPrev.hidden = true;
      lightboxNext.hidden = true;
      lightboxHint.textContent = "按 Esc 或点击背景关闭";
    }

    lastFocused = button;
    setBackgroundInert(true);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.body.classList.add("lightbox-open");
    lightboxClose.focus({ preventScroll: true });
  };

  const stepLightbox = (delta) => {
    if (!lightboxGallery.length) return;
    const next =
      (galleryIndex + delta + lightboxGallery.length) % lightboxGallery.length;
    renderGallery(next);
  };

  const closeLightbox = () => {
    if (!lightbox.classList.contains("is-open")) return;

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.classList.remove("lightbox-open");
    setBackgroundInert(false);

    if (lastFocused) lastFocused.focus({ preventScroll: true });
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-full]");
    if (!trigger || lightbox.classList.contains("is-open")) return;

    event.preventDefault();
    openLightbox(trigger);
  });

  lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => stepLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => stepLightbox(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.classList.contains("is-open")) {
      if (event.key === "Escape") {
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft" && lightboxGallery.length) {
        event.preventDefault();
        stepLightbox(-1);
        return;
      }

      if (event.key === "ArrowRight" && lightboxGallery.length) {
        event.preventDefault();
        stepLightbox(1);
        return;
      }

      if (event.key === "Tab") {
        const focusable = [lightboxPrev, lightboxNext, lightboxClose].filter(
          (element) => element && !element.hidden
        );
        if (!focusable.length) return;

        event.preventDefault();
        const currentIndex = focusable.indexOf(document.activeElement);
        if (currentIndex === -1) {
          focusable[event.shiftKey ? focusable.length - 1 : 0].focus();
          return;
        }

        const nextIndex = event.shiftKey
          ? (currentIndex - 1 + focusable.length) % focusable.length
          : (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
        return;
      }
    }

    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav(true);
    }
  });

  /* ---------- 冷车动态红区 ---------- */

  const redlineDemo = $("#redlineDemo");
  if (redlineDemo) {
    const slider = $("#coolantSlider");
    const coolantValue = $("#coolantValue");
    const redlineValue = $("#redlineValue");
    const kValue = $("#kValue");
    const zoneBar = $("#zoneBar");
    const zones = $$("i", zoneBar);

    const MAX_RPM = 12000;
    const TARGET_C = Number(redlineDemo.dataset.target || 70);
    const RAMP_C = 30;
    const COLD_RATIO = 0.6;
    // 热车时的四段色区起点：0 / 6000 / 8000 / 10000 RPM
    const SOURCE = [0, 6000, 8000, 10000];

    const number = new Intl.NumberFormat("en-US");

    const render = (coolant) => {
      const rampStart = TARGET_C - RAMP_C;
      const t = Math.min(1, Math.max(0, (coolant - rampStart) / RAMP_C));
      const k = COLD_RATIO + (1 - COLD_RATIO) * t;

      const bounds = SOURCE.map((value) => value * k);
      const widths = [
        bounds[1] / MAX_RPM,
        (bounds[2] - bounds[1]) / MAX_RPM,
        (bounds[3] - bounds[2]) / MAX_RPM,
        (MAX_RPM - bounds[3]) / MAX_RPM,
      ];

      zones.forEach((zone, index) => {
        zone.style.width = `${(widths[index] * 100).toFixed(3)}%`;
        zone.classList.toggle("is-hot", k > 0.96);
      });

      coolantValue.textContent = String(coolant);
      redlineValue.textContent = number.format(Math.round(bounds[3] / 100) * 100);
      kValue.textContent = k.toFixed(2);
      kValue.classList.toggle("hot", k > 0.96);
    };

    slider.addEventListener("input", () => render(Number(slider.value)));
    render(Number(slider.value));
  }

  /* ---------- 日夜对比 ---------- */

  const compare = $("#compare");
  if (compare) {
    const range = $("#compareRange", compare);
    const night = $("#compareNight", compare);
    const handle = $("#compareHandle", compare);

    const render = (value) => {
      night.style.clipPath = `inset(0 0 0 ${value}%)`;
      handle.style.left = `${value}%`;
    };

    range.addEventListener("input", () => render(Number(range.value)));
    render(Number(range.value));
  }

  /* ---------- 下载 ---------- */

  const toast = $("#toast");
  let toastTimer = 0;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3200);
  };

  const downloadLinks = $$("[data-download]");
  if (DOWNLOAD_URL) {
    downloadLinks.forEach((link) => {
      link.href = DOWNLOAD_URL;
      link.removeAttribute("data-pending");
      link.removeAttribute("target");
    });
    const hint = $(".dl-hint");
    if (hint) {
      hint.classList.remove("is-pending");
      hint.innerHTML =
        "APK 下载地址始终指向 GitHub Releases 的最新版。<br>安装前请确认来源为本页面。";
    }
  } else {
    downloadLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showToast("下载地址即将提供，先看看下面的功能与主题。");
        const downloadSection = $("#download");
        if (downloadSection) {
          downloadSection.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
          });
        }
      });
    });
  }

  /* ---------- 滚动揭示 ---------- */

  const revealItems = $$(".reveal");

  if ("IntersectionObserver" in window && !reducedMotion && !staticPreview) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach((item) => {
      item.classList.add("is-pending");
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-in"));
  }
})();
