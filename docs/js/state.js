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

  // idk if we need this
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

// --- "No orders ready today" toast toggle ---
window.setNoSameDayReadyToast = function (isOn = true, opts = {}) {
  const id = "ssNoSameDayToast";

  // Date label (local user time)
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);

  // If user already dismissed it today, don't show again
  const dismissKey = `ss_noSameDayToast_dismissed_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  if (isOn && localStorage.getItem(dismissKey) === "1") return;

  // Remove if toggled off
  if (!isOn) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    return;
  }

  // Prevent duplicates
  if (document.getElementById(id)) return;

  const message =
    opts.message ||
    `Sorry we can’t have orders ready today:(. You can still order, and we’ll DM you when it’s ready (usually 1–2 days).`;

  // Build toast
  const wrap = document.createElement("div");
  wrap.id = id;
  wrap.className =
    "fixed inset-x-0 bottom-4 z-[60] px-4 flex justify-center ss-toast-enter";

  wrap.innerHTML = `
    <div
      class="w-full max-w-md bg-white/95 backdrop-blur-sm rust-border border-4 rounded-2xl shadow-2xl p-4 paper-texture"
      role="dialog"
      aria-live="polite"
      aria-label="Important order notice"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1">
          <p class="handwritten text-xl md:text-2xl deep-blue font-bold leading-tight">
            ${opts.title || "Quick Heads-Up"} • ${dateLabel}
          </p>
          <p class="handwritten text-lg md:text-xl text-gray-700 mt-2 leading-snug">
            ${message}
          </p>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          type="button"
          class="rust-bg text-white px-5 py-2 rounded-lg handwritten text-xl font-bold hover:opacity-90 transition-opacity"
          data-ss-toast-ok
        >
          Got it!
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);

  // Close handler
  wrap.querySelector("[data-ss-toast-ok]")?.addEventListener("click", () => {
    try { localStorage.setItem(dismissKey, "1"); } catch (_) {}
    wrap.classList.remove("ss-toast-enter");
    wrap.classList.add("ss-toast-exit");
    setTimeout(() => wrap.remove(), 180);
  });
};

