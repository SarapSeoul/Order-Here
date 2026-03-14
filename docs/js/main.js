document.addEventListener("DOMContentLoaded", () => {
  try { lucide.createIcons(); } catch (_) {}

  const homeSection = document.getElementById("home");
  const menuPage = document.getElementById("menuPage");
  const checkoutPage = document.getElementById("checkoutPage");
  const menuSelect = document.getElementById("menu-select");

  const navMenuToggle = document.getElementById("navMenuToggle");
  const navDropdownMenu = document.getElementById("navDropdownMenu");
  const navHomeBtn = document.getElementById("navHomeBtn");
  const navMenuBtn = document.getElementById("navMenuBtn");
  const navCartBtn = document.getElementById("navCartBtn");

  const heroOrderNowBtn = document.getElementById("heroOrderNowBtn");
  const heroOrderNowImg = document.getElementById("heroOrderNowImg");

  const floatingCheckoutBtn = document.getElementById("floatingCheckoutBtn");
  const backToMenuBtn = document.getElementById("backToMenuBtn");
  const igLink = document.getElementById("igLink");

  function closeDropdown() {
    if (!navDropdownMenu) return;
    navDropdownMenu.classList.add("hidden");
    navMenuToggle?.setAttribute("aria-expanded", "false");
    navMenuToggle?.classList.remove("is-pressed");
  }

  function openDropdown() {
    if (!navDropdownMenu) return;
    navDropdownMenu.classList.remove("hidden");
    navMenuToggle?.setAttribute("aria-expanded", "true");
    navMenuToggle?.classList.add("is-pressed");
  }

  function toggleDropdown() {
    if (!navDropdownMenu) return;
    navDropdownMenu.classList.contains("hidden") ? openDropdown() : closeDropdown();
  }

  function showHome() {
    if (homeSection) homeSection.style.display = "";
    menuPage?.classList.remove("hidden");
    checkoutPage?.classList.add("hidden");
    closeDropdown();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    try { window.updateFloatingCheckoutButton?.(); } catch (_) {}
  }

function showMenuView() {
  if (homeSection) homeSection.style.display = "";
  menuPage?.classList.remove("hidden");
  checkoutPage?.classList.add("hidden");
  closeDropdown();

  const banner = document.getElementById("scheduleBanner");

  if (banner) {
    banner.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  try { window.updateFloatingCheckoutButton?.(); } catch (_) {}
}

function showCheckoutView() {
  if (homeSection) homeSection.style.display = "none";
  menuPage?.classList.add("hidden");
  checkoutPage?.classList.remove("hidden");
  closeDropdown();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  setTimeout(() => {
    document.getElementById("customerName")?.focus?.();
  }, 200);
}

  // expose unified navigation globally
  window.showHome = showHome;
  window.showMenu = showMenuView;
  window.showCheckout = showCheckoutView;

  function pressImageButton(buttonEl, imageEl) {
    if (!buttonEl || !imageEl) return;

    const defaultSrc = imageEl.dataset.defaultSrc || imageEl.src;
    const activeSrc = imageEl.dataset.activeSrc || defaultSrc;

    imageEl.src = activeSrc;
    buttonEl.classList.add("is-pressed");

    window.setTimeout(() => {
      imageEl.src = defaultSrc;
      buttonEl.classList.remove("is-pressed");
    }, 160);
  }

  navMenuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown();
  });

  navHomeBtn?.addEventListener("click", showHome);
  navMenuBtn?.addEventListener("click", showMenuView);
  navCartBtn?.addEventListener("click", showCheckoutView);

  heroOrderNowBtn?.addEventListener("click", () => {
    pressImageButton(heroOrderNowBtn, heroOrderNowImg);
    window.setTimeout(showMenuView, 120);
  });

  floatingCheckoutBtn?.addEventListener("click", showCheckoutView);
  backToMenuBtn?.addEventListener("click", showMenuView);

  document.addEventListener("click", (event) => {
    if (!navDropdownMenu || !navMenuToggle) return;

    const clickedInsideDropdown = navDropdownMenu.contains(event.target);
    const clickedToggle = navMenuToggle.contains(event.target);

    if (!clickedInsideDropdown && !clickedToggle) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdown();
    }
  });

  // footer instagram link
  if (igLink && window.APP_CONFIG?.INSTAGRAM_HANDLE) {
    igLink.href = `https://instagram.com/${window.APP_CONFIG.INSTAGRAM_HANDLE}`;
  }

  // category buttons
  document.querySelectorAll(".ss-cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      if (!cat) return;
      window.setCategory?.(cat);
    });
  });

  // initialize app pieces from other files
  try { window.setCategory?.("featured"); } catch (_) {}
  try { window.renderMenus?.(); } catch (_) {}
  try { window.updateSummary?.(); } catch (_) {}
  try { window.updateScheduleBanner?.(); } catch (_) {}
  try { window.bindFloatingCheckoutButton?.(); } catch (_) {}
  try { window.attachFormSubmit?.(); } catch (err) {
    console.error("attachFormSubmit failed:", err);
  }

  // reveal animations
  const revealItems = document.querySelectorAll(".reveal-on-scroll");

  if ("IntersectionObserver" in window && revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  showHome();
});