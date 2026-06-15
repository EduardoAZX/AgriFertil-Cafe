/**
 * main.js — AgriFértil BEAUVE100®
 * Scroll suave, FAQ accordion, modais, carrossel hero, animações.
 */

// ============================================================
// CARROSSEL HERO
// ============================================================
(function initCarousel() {
  const slides = document.querySelectorAll(".hero__slide");
  const dots   = document.querySelectorAll(".hero__dot");
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove("active");
    dots[current]?.classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current]?.classList.add("active");
  }

  function autoPlay() {
    timer = setInterval(() => goTo(current + 1), 5500);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      clearInterval(timer);
      goTo(i);
      autoPlay();
    });
  });

  slides[0].classList.add("active");
  dots[0]?.classList.add("active");
  autoPlay();
})();

// ============================================================
// FAQ ACCORDION
// ============================================================
(function initFaq() {
  const items = document.querySelectorAll(".faq__item");
  items.forEach((item) => {
    const btn    = item.querySelector(".faq__question");
    const answer = item.querySelector(".faq__answer");
    if (!btn || !answer) return;

    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // fecha todos
      items.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq__question")?.setAttribute("aria-expanded", "false");
      });
      // abre o clicado se estava fechado
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });

    // teclado
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();

// ============================================================
// MODAIS
// ============================================================
(function initModals() {
  function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const firstFocusable = overlay.querySelector("button, [href], input, [tabindex]");
    firstFocusable?.focus();
  }

  function closeModal(overlay) {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Botões que abrem modal
  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.modal));
  });

  // Botões de fechar dentro do modal
  document.querySelectorAll(".modal__close, [data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const overlay = btn.closest(".modal-overlay");
      if (overlay) closeModal(overlay);
    });
  });

  // Fechar clicando fora do modal
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Fechar com Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openOverlay = document.querySelector(".modal-overlay.open");
      if (openOverlay) closeModal(openOverlay);
    }
  });
})();

// ============================================================
// ANIMAÇÕES — IntersectionObserver
// ============================================================
(function initReveal() {
  const els = document.querySelectorAll(".reveal, .faq__item");
  if (!els.length || !window.IntersectionObserver) {
    els.forEach((el) => {
      el.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  els.forEach((el) => observer.observe(el));
})();

// ============================================================
// SCROLL SUAVE — âncoras internas
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href === "#") return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
