window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const igLink = document.getElementById("igLink");
  igLink.href = `https://instagram.com/${window.APP_CONFIG.INSTAGRAM_HANDLE}`;

  document.querySelectorAll(".ss-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      window.setCategory(btn.dataset.cat);
      window.scrollToMenuSelections();
    });
  });

  // Back to menu button (checkout view)
  document.getElementById("backToMenuBtn")?.addEventListener("click", () => {
    window.showMenu();
  });

  try { window.updateScheduleBanner?.(); } catch (_) {}
  try { window.bindFloatingCheckoutButton?.(); } catch (_) {}
  setInterval(() => {
    try { window.updateScheduleBanner?.(); } catch (_) {}
  }, 60 * 60 * 1000);

  // default category
  window.setCategory("featured");

  window.updateSummary();
  window.attachFormSubmit();

  // Start on menu view
  try { window.showMenu?.(); } catch (_) {}

  document.getElementById("resetBtn").addEventListener("click", () => {
    Object.keys(window.orderState).forEach(id => {
      window.orderState[id].qty = 0;
      const el = document.getElementById(`qty-${id}`);
      if (el) el.textContent = "0";
    });

    document.getElementById("orderForm").reset();

    try { window.__orderUI?.syncContactRequirements?.(); } catch (_) {}

    const addressWrap = document.getElementById("addressWrap");
    const address = document.getElementById("address");
    const deliveryFeeNotice = document.getElementById("deliveryFeeNotice");

    addressWrap.classList.add("hidden");
    if (deliveryFeeNotice) deliveryFeeNotice.classList.add("hidden");
    address.required = false;

    document.getElementById("successMessage").classList.add("hidden");

    try { window.__orderUI?.hideLoading?.(); } catch (_) {}
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.disabled = false;
    document.getElementById("orderForm")?.setAttribute("aria-busy", "false");

    window.updateSummary();

    // ✅ Go back to menu view after reset
    window.showMenu();
  });
});