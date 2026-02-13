window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  // IG footer link
  const igLink = document.getElementById("igLink");
  igLink.href = `https://instagram.com/${window.APP_CONFIG.INSTAGRAM_HANDLE}`;

  // tabs: switch + scroll
  document.getElementById("tab-food").addEventListener("click", () => {
    window.setTab("food");
    window.scrollToMenuSelections();
  });
  document.getElementById("tab-dessert").addEventListener("click", () => {
    window.setTab("dessert");
    window.scrollToMenuSelections();
  });

  // render + init
  window.renderMenus();

  //MAKE THINGS OUT OF STOCK
  window.setOutOfStock("lumpia", true);
  window.setOutOfStock("porkbbq", true);
  window.setOutOfStock("flan", true);
  window.setOutOfStock("sago", true);

  window.updateSummary();
  window.setTab("food");

  // form wiring
  window.attachFormSubmit();

  // reset button
  document.getElementById("resetBtn").addEventListener("click", () => {
    Object.keys(window.orderState).forEach(id => {
      window.orderState[id].qty = 0;
      const el = document.getElementById(`qty-${id}`);
      if (el) el.textContent = "0";
    });

    document.getElementById("orderForm").reset();

    const addressWrap = document.getElementById("addressWrap");
    const address = document.getElementById("address");
    const deliveryFeeNotice = document.getElementById("deliveryFeeNotice");

    addressWrap.classList.add("hidden");
    if (deliveryFeeNotice) deliveryFeeNotice.classList.add("hidden");
    address.required = false;

    document.getElementById("successMessage").classList.add("hidden");

    // ensure any loading UI is cleared
    try { window.__orderUI?.hideLoading?.(); } catch (_) {}
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.disabled = false;
    document.getElementById("orderForm")?.setAttribute("aria-busy", "false");

    window.updateSummary();
    window.location.hash = "#order-section";
  });
});
