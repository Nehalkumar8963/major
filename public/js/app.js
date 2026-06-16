document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
  const categoryButtons = document.querySelectorAll("[data-category-url]");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("wander-theme", nextTheme);
    });
  }

  if (mobileMenu && mobileMenuToggle) {
    const syncMenuState = (open) => {
      mobileMenu.hidden = !open;
      mobileMenuToggle.setAttribute("aria-expanded", String(open));
    };

    mobileMenuToggle.addEventListener("click", () => {
      syncMenuState(mobileMenu.hidden);
    });

    document.addEventListener("click", (event) => {
      if (mobileMenu.hidden) return;
      const clickedInside = mobileMenu.contains(event.target) || mobileMenuToggle.contains(event.target);
      if (!clickedInside) syncMenuState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        syncMenuState(false);
      }
    });
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextUrl = button.dataset.categoryUrl;
      if (nextUrl) {
        window.location.href = nextUrl;
      }
    });
  });

  const currentPath = window.location.pathname;
  document.querySelectorAll(".mobile-nav__item").forEach((item) => {
    try {
      const itemPath = new URL(item.href).pathname;
      if (itemPath === currentPath) {
        item.classList.add("is-active");
      }
    } catch (error) {
      // Ignore anchors and other non-URL links.
    }
  });
});
