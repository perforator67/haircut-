/**
 * КОНТУР — барбершоп.
 * Ванильный JS: шапка при скролле, мобильное меню, появление секций,
 * модальное окно записи с имитацией отправки формы.
 * Без зависимостей, без сборки.
 */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Шапка: фон при скролле ---------- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var setHeaderState = function () {
      if (window.scrollY > 12) {
        header.setAttribute("data-scrolled", "");
      } else {
        header.removeAttribute("data-scrolled");
      }
    };
    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector("[data-burger]");
  var nav = document.querySelector("[data-nav]");

  function closeNav() {
    if (!nav || !burger) return;
    nav.removeAttribute("data-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openNav() {
    if (!nav || !burger) return;
    nav.setAttribute("data-open", "");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var isOpen = burger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    nav.querySelectorAll("[data-nav-link]").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 860) closeNav();
    });
  }

  /* ---------- Появление секций при скролле ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Модальное окно записи ---------- */
  var modal = document.querySelector("[data-modal]");
  var openers = document.querySelectorAll("[data-open-modal]");
  var closers = modal ? modal.querySelectorAll("[data-modal-close]") : [];
  var form = document.querySelector("[data-booking-form]");
  var successPanel = document.querySelector("[data-booking-success]");
  var lastFocused = null;

  function trapFocus(e) {
    if (!modal || modal.hidden) return;
    if (e.key !== "Tab") return;

    var focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeNav();

    // показываем форму, скрываем экран успеха (на случай повторного открытия)
    if (form) form.hidden = false;
    if (successPanel) successPanel.hidden = true;

    var firstField = modal.querySelector("input, select");
    if (firstField) firstField.focus();

    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
    trapFocus(e);
  }

  openers.forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  closers.forEach(function (btn) {
    btn.addEventListener("click", closeModal);
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Реального бэкенда нет — это демонстрационная форма для портфолио.
      // Имитируем успешную отправку заявки.
      form.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        var heading = successPanel.querySelector(".modal__title");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus();
        }
      }
      form.reset();
    });
  }

  /* ---------- Плавный скролл к якорям с учётом высоты шапки ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      var headerHeight = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  });
})();
