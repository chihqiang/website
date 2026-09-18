// ============================================
// tailog theme - JavaScript
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // ---- 代码复制按钮 ----
  // figure.highlight: Hexo 高亮代码块；.article-content > pre: 独立 pre 代码块（直接子元素，避免重复匹配 figure 内部的 pre）
  document.querySelectorAll("figure.highlight, .article-content > pre").forEach(function (el) {
    // figure.highlight 结构: <figure><table><tr><td class="gutter"><pre>行号</pre></td><td class="code"><pre>代码</pre></td></tr></table></figure>
    // 必须取 td.code 里的 pre，否则会取到行号
    let block;
    if (el.tagName === "FIGURE") {
      block = el.querySelector("td.code pre") || el.querySelector(".code pre");
    } else {
      block = el;
    }
    if (!block) return;

    const wrapper = el;
    wrapper.style.position = "relative";

    // 避免重复添加
    if (wrapper.querySelector(".copy-btn")) return;

    // 在添加按钮之前提取纯代码文本，避免按钮文字混入
    let codeText = "";
    const lines = block.querySelectorAll(".line");
    if (lines.length > 0) {
      // Hexo highlight: 每行代码在 <span class="line"> 中
      codeText = Array.from(lines).map(function (l) { return l.textContent; }).join("\n");
    } else {
      // 独立 pre: 代码可能在 <code> 子元素中，或直接在 pre 内
      const codeEl = block.querySelector("code");
      codeText = codeEl ? codeEl.textContent : block.textContent;
    }
    // 去除尾部空白
    codeText = codeText.replace(/\n+$/, "");

    const btn = document.createElement("button");
    btn.textContent = "复制";
    btn.className = "copy-btn";

    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(codeText).then(() => {
        btn.textContent = "已复制";
        setTimeout(() => (btn.textContent = "复制"), 1500);
      });
    });

    wrapper.appendChild(btn);
  });

  // ---- 移动端菜单切换 ----
  const mobileMenuBtn = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // ---- 回到顶部按钮 ----
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 400) {
        backToTopBtn.classList.remove("opacity-0", "invisible");
        backToTopBtn.classList.add("opacity-100", "visible");
      } else {
        backToTopBtn.classList.add("opacity-0", "invisible");
        backToTopBtn.classList.remove("opacity-100", "visible");
      }
    });

    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---- 阅读进度条 ----
  const progressBar = document.getElementById("reading-progress");
  if (progressBar) {
    function updateProgress() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = progress + "%";
    }
    window.addEventListener("scroll", updateProgress);
    updateProgress();
  }

  // ---- 深色模式切换 ----
  const themeToggleBtn = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");

  function updateThemeIcons() {
    if (document.documentElement.classList.contains("dark")) {
      sunIcon?.classList.remove("hidden");
      moonIcon?.classList.add("hidden");
    } else {
      sunIcon?.classList.add("hidden");
      moonIcon?.classList.remove("hidden");
    }
  }

  updateThemeIcons();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
      updateThemeIcons();
    });
  }

  // ---- 文章目录 TOC 生成 ----
  generateTOC();

  // ---- 图片灯箱 ----
  initLightbox();

  // ---- 复制链接分享 ----
  initShareButtons();

  // ---- 代码块语言标签 ----
  initCodeLangLabel();

  // ---- 鼠标光晕跟随 ----
  initCursorGlow();

  // ---- 滚动渐入动画 ----
  initScrollReveal();
});

// ============================================
// TOC 目录生成与滚动高亮
// ============================================
function generateTOC() {
  const content = document.getElementById("article-content");
  const tocNav = document.getElementById("toc");
  if (!content || !tocNav) return;

  const headings = content.querySelectorAll("h2, h3");
  if (headings.length === 0) {
    tocNav.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-600">暂无目录</p>';
    return;
  }

  // 为每个标题生成 ID
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = "heading-" + index;
    }
  });

  // 构建 TOC 列表
  let tocHTML = '<ul class="space-y-1">';
  headings.forEach((heading) => {
    const level = heading.tagName.toLowerCase();
    const indent = level === "h3" ? "ml-3" : "";
    tocHTML +=
      '<li class="' + indent + '">' +
      '<a href="#' + heading.id + '" class="toc-link block py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate" data-target="' + heading.id + '">' +
      heading.textContent +
      "</a></li>";
  });
  tocHTML += "</ul>";
  tocNav.innerHTML = tocHTML;

  // 点击平滑滚动
  tocNav.querySelectorAll(".toc-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  // 滚动高亮当前标题
  const tocLinks = tocNav.querySelectorAll(".toc-link");
  function updateActiveTOC() {
    let activeIndex = -1;
    const scrollPos = window.pageYOffset + 100;
    headings.forEach((heading, index) => {
      if (heading.offsetTop <= scrollPos) {
        activeIndex = index;
      }
    });
    tocLinks.forEach((link, index) => {
      if (index === activeIndex) {
        link.classList.add("toc-active");
      } else {
        link.classList.remove("toc-active");
      }
    });
  }
  window.addEventListener("scroll", updateActiveTOC);
  updateActiveTOC();
}

// ============================================
// 图片灯箱（点击文章内图片放大查看）
// ============================================
function initLightbox() {
  const content = document.getElementById("article-content");
  if (!content) return;

  const images = content.querySelectorAll("img");
  if (images.length === 0) return;

  // 创建灯箱 DOM
  const lightbox = document.createElement("div");
  lightbox.className =
    "fixed inset-0 z-[100] hidden items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out";
  lightbox.innerHTML =
    '<img class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" alt="预览" />';
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector("img");

  // 给文章内图片添加点击事件
  images.forEach(function (img) {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", function () {
      lightboxImg.src = img.src;
      lightbox.classList.remove("hidden");
      lightbox.classList.add("flex");
      document.body.style.overflow = "hidden";
    });
  });

  // 点击关闭
  lightbox.addEventListener("click", function () {
    lightbox.classList.add("hidden");
    lightbox.classList.remove("flex");
    document.body.style.overflow = "";
  });

  // ESC 关闭
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.classList.contains("hidden")) {
      lightbox.classList.add("hidden");
      lightbox.classList.remove("flex");
      document.body.style.overflow = "";
    }
  });
}

// ============================================
// 分享按钮（复制链接）
// ============================================
function initShareButtons() {
  const buttons = document.querySelectorAll(".share-btn.copy-link");
  if (buttons.length === 0) return;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const url = btn.getAttribute("data-url");
      if (!url) return;

      const fullUrl = window.location.origin + "/" + url;
      navigator.clipboard.writeText(fullUrl).then(function () {
        var originalHTML = btn.innerHTML;
        btn.innerHTML =
          '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> 已复制';
        setTimeout(function () {
          btn.innerHTML = originalHTML;
        }, 1500);
      });
    });
  });
}

// ============================================
// 代码块语言标签
// ============================================
function initCodeLangLabel() {
  document.querySelectorAll("figure.highlight").forEach(function (figure) {
    // 从 class 中提取语言名，如 "highlight bash"
    var classes = figure.className.split(/\s+/);
    var lang = "";
    for (var i = 0; i < classes.length; i++) {
      if (classes[i] !== "highlight") {
        lang = classes[i];
        break;
      }
    }
    if (!lang) return;

    var label = document.createElement("span");
    label.textContent = lang;
    label.className =
      "code-lang-label absolute top-2 right-14 text-[10px] font-mono uppercase tracking-wide text-slate-500 dark:text-slate-500 pointer-events-none select-none z-10";
    figure.style.position = "relative";
    figure.appendChild(label);
  });
}

// ============================================
// 搜索功能
// ============================================
function DOMContentLoadedSearch() {
  const inputField = document.getElementById("inputField");
  const articleList = document.getElementById("articleList");
  const searchOverlay = document.getElementById("searchOverlay");
  const inputContainer = document.getElementById("inputContainer");
  const searchButton = document.getElementById("searchButton");

  if (!inputField || !searchButton) return;

  let selectedIndex = -1;
  let currentResults = [];

  function openSearch() {
    inputContainer.classList.remove("hidden");
    searchOverlay.classList.remove("hidden");
    inputField.value = "";
    articleList.innerHTML = "";
    selectedIndex = -1;
    setTimeout(() => inputField.focus(), 50);
  }

  function hideSearch() {
    inputContainer.classList.add("hidden");
    searchOverlay.classList.add("hidden");
    inputField.value = "";
    articleList.innerHTML = "";
    selectedIndex = -1;
  }

  function updateSelection() {
    const items = articleList.querySelectorAll(".result-item");
    items.forEach((item, i) => {
      if (i === selectedIndex) {
        item.classList.add("active");
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        item.classList.remove("active");
      }
    });
  }

  searchButton.addEventListener("click", openSearch);
  searchOverlay.addEventListener("click", hideSearch);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideSearch();
    // 快捷键 Cmd/Ctrl + K 打开搜索
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (inputContainer.classList.contains("hidden")) {
        openSearch();
      } else {
        hideSearch();
      }
    }
    // 搜索结果键盘导航
    if (!inputContainer.classList.contains("hidden")) {
      const items = articleList.querySelectorAll(".result-item");
      if (items.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection();
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const url = items[selectedIndex].getAttribute("data-url");
        if (url) window.location.href = url;
      }
    }
  });

  let debounceTimer;
  let articles = [];
  let articlesLoaded = false;

  inputField.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    selectedIndex = -1;
    debounceTimer = setTimeout(() => {
      const keyword = this.value.trim().toLowerCase();
      if (keyword === "") {
        articleList.innerHTML = "";
        return;
      }
      if (!articlesLoaded) {
        fetch("/search.json")
          .then((res) => res.json())
          .then((data) => {
            articles = data;
            articlesLoaded = true;
            filterAndDisplayArticles(keyword);
          })
          .catch((err) => console.error("load search.json err", err));
      } else {
        filterAndDisplayArticles(keyword);
      }
    }, 200);
  });

  function filterAndDisplayArticles(keyword) {
    const filteredArticles = articles
      .filter(
        (article) =>
          article.title.toLowerCase().includes(keyword) ||
          (article.content && article.content.toLowerCase().includes(keyword))
      )
      .slice(0, 10);

    articleList.innerHTML =
      filteredArticles.length > 0
        ? filteredArticles
            .map(
              (article) => `
            <div class="result-item" data-url="${article.url}">
              <div class="result-title">${article.title}</div>
              ${article.excerpt ? `<div class="result-excerpt">${article.excerpt}</div>` : ""}
              ${article.date ? `<div class="result-date">${article.date}</div>` : ""}
            </div>`
            )
            .join("")
        : '<div class="no-results">未找到相关内容，换个关键词试试？</div>';

    const resultItems = articleList.querySelectorAll(".result-item");
    resultItems.forEach((item) => {
      item.addEventListener("click", () => {
        const url = item.getAttribute("data-url");
        if (url) window.location.href = url;
      });
    });
  }
}

// ============================================
// 无限加载（归档页）— 基于 IntersectionObserver
// ============================================
function createLoadMore({
  total,
  startIndex = 3,
  loadCount = 3,
  trigger = null,
  rootMargin = 600,
  immediate = false,
  onLoad = () => {},
  onFinish = () => {},
}) {
  let currentIndex = startIndex;
  let finished = false;
  let observer = null;
  let scrollHandler = null;

  function loadMore() {
    if (finished || currentIndex >= total) return;
    const end = Math.min(currentIndex + loadCount, total);
    for (let i = currentIndex; i < end; i++) {
      onLoad(i);
    }
    currentIndex = end;
    if (currentIndex >= total) {
      finished = true;
      onFinish?.();
      stop();
    }
  }

  // 检查 trigger 是否在预加载区域内，是则继续加载
  // 用于首次加载填满屏幕、以及大屏连续加载
  function checkAndLoad() {
    if (finished || !trigger) return;
    var rect = trigger.getBoundingClientRect();
    // 元素被隐藏（display:none）时 rect 全为 0，跳过
    if (rect.top === 0 && rect.height === 0) return;
    if (rect.top <= window.innerHeight + rootMargin) {
      loadMore();
      // 加载后如果 trigger 仍在预加载区域内，继续加载（填满大屏）
      if (!finished) requestAnimationFrame(checkAndLoad);
    }
  }

  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  function start() {
    if (!trigger || finished || currentIndex >= total) return;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            loadMore();
            if (!finished) requestAnimationFrame(checkAndLoad);
          }
        },
        { rootMargin: rootMargin + "px 0px 0px 0px" }
      );
      observer.observe(trigger);
    } else {
      // 降级方案：基于 scroll 位置
      scrollHandler = throttle(checkAndLoad, 100);
      window.addEventListener("scroll", scrollHandler);
      window.addEventListener("resize", scrollHandler);
    }

    // 首次立即检查（处理 trigger 已在视口内的情况）
    if (immediate) {
      requestAnimationFrame(checkAndLoad);
    }
  }

  function stop() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (scrollHandler) {
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", scrollHandler);
    }
  }

  return { loadMore, start, stop };
}

// ============================================
// 鼠标光晕跟随
// ============================================
function initCursorGlow() {
  // 触屏设备或降低动画偏好时不启用
  if (window.matchMedia("(hover: none)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  let mouseX = 0,
    mouseY = 0;
  let glowX = 0,
    glowY = 0;
  let rafId = null;
  let active = false;

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!active) {
      active = true;
      glow.classList.add("visible");
      glowX = mouseX;
      glowY = mouseY;
    }
    if (!rafId) rafId = requestAnimationFrame(animate);
  });

  document.addEventListener("mouseleave", function () {
    glow.classList.remove("visible");
    active = false;
  });

  function animate() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.left = glowX + "px";
    glow.style.top = glowY + "px";

    if (Math.abs(mouseX - glowX) > 0.5 || Math.abs(mouseY - glowY) > 0.5) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }
}

// ============================================
// 滚动渐入（视口外元素暂停动画，进入视口后播放）
// ============================================
function initScrollReveal() {
  // 选择所有带入场动画的元素
  const animatedElements = document.querySelectorAll(
    ".fade-up, .tag-card, .timeline-item"
  );
  if (animatedElements.length === 0) return;

  const viewportHeight = window.innerHeight;
  const hiddenTargets = [];

  // 将视口外的元素标记为隐藏，暂停其入场动画
  animatedElements.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    // 元素在视口下方
    if (rect.top > viewportHeight) {
      el.classList.add("reveal-hidden");
      hiddenTargets.push(el);
    }
  });

  if (hiddenTargets.length === 0) return;

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
 entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-hidden");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    hiddenTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // 降级：直接显示
    hiddenTargets.forEach(function (el) {
      el.classList.remove("reveal-hidden");
    });
  }
}

// ============================================
// 导航栏滚动效果
// ============================================
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    if (window.pageYOffset > 10) {
      navbar.classList.add("shadow-sm");
    } else {
      navbar.classList.remove("shadow-sm");
    }
  }
});

// ============================================
// 自适应导航菜单（溢出项收纳到「更多」）
// ============================================
(function initAdaptiveNav() {
  const desktopMenu = document.getElementById("desktop-menu");
  const dropdownMenu = document.getElementById("dropdown-menu");
  const dropdownContent = document.getElementById("dropdown-content");

  if (!desktopMenu || !dropdownMenu || !dropdownContent) return;

  const navItems = Array.from(desktopMenu.querySelectorAll(".nav-item"));
  const menuData = navItems.map((item) => ({
    element: item,
    text: item.textContent.trim(),
    href: item.getAttribute("href"),
    index: parseInt(item.getAttribute("data-index")),
  }));

  function calculateVisibleItems() {
    const availableWidth = window.innerWidth;
    const titleWidth = 200;
    const buttonsWidth = 120;
    const paddingWidth = 64;
    const itemWidth = 90;
    const dropdownWidth = 80;

    const usableWidth = availableWidth - titleWidth - buttonsWidth - paddingWidth;
    if (usableWidth <= 0) return 0;

    let visibleCount = Math.floor((usableWidth - dropdownWidth) / itemWidth);
    if (visibleCount < 0) visibleCount = 0;
    if (visibleCount > menuData.length) visibleCount = menuData.length;
    return visibleCount;
  }

  function updateMenu() {
    const visibleCount = calculateVisibleItems();

    menuData.forEach((item, index) => {
      if (index < visibleCount) {
        item.element.classList.remove("hidden");
      } else {
        item.element.classList.add("hidden");
      }
    });

    if (visibleCount < menuData.length) {
      dropdownMenu.classList.remove("hidden");

      const dropdownItems = menuData.slice(visibleCount);
      dropdownContent.innerHTML = dropdownItems
        .map(
          (item) =>
            `<a href="${item.href}" class="block px-3 py-2 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">${item.text}</a>`
        )
        .join("");
    } else {
      dropdownMenu.classList.add("hidden");
    }
  }

  function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const throttledUpdate = throttle(updateMenu, 100);
  window.addEventListener("resize", throttledUpdate);
  updateMenu();
})();
