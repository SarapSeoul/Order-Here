// App state (kept in one place)
window.orderState = {};
window.CATALOG.forEach(i => {
  window.orderState[i.id] = { qty: 0, variant: i.hasVariant ? "slice" : null };
});

// helpers
window.getDeliveryFeeLabel = function () {
  return "TBD (based on distance)";
};

window.calcItemTotal = function (item, qty, variantKey) {
  if (!item.hasVariant) return qty * item.price;
  const v = item.variants.find(x => x.key === variantKey) || item.variants[0];
  return qty * item.price * (v?.multiplier ?? 1);
};

window.scrollToMenuSelections = function () {
  const el = document.getElementById("menu-select");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// --- Out-of-stock toggles ---
window.setOutOfStock = function (id, isOutOfStock = true) {
  const item = window.CATALOG.find(x => x.id === id);
  if (!item) return;

  item.outOfStock = !!isOutOfStock;

  // If turning OFF availability, zero out any selected qty immediately
  if (item.outOfStock && window.orderState?.[id]) {
    window.orderState[id].qty = 0;
    const qtyEl = document.getElementById(`qty-${id}`);
    if (qtyEl) qtyEl.textContent = "0";
  }

  // Re-render UI if available
  if (typeof window.renderMenus === "function") window.renderMenus();
  if (typeof window.updateSummary === "function") window.updateSummary();
};

window.toggleOutOfStock = function (id) {
  const item = window.CATALOG.find(x => x.id === id);
  if (!item) return;
  window.setOutOfStock(id, !item.outOfStock);
};
