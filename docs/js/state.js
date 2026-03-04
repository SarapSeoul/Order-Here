// App state (kept in one place)
window.orderState = {};
window.CATALOG.forEach(i => {
  const defaultVariant = i.hasVariant ? (i.variants?.[0]?.key ?? null) : null;
  window.orderState[i.id] = { qty: 0, variant: defaultVariant };
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

// ===============================
// View navigation: Menu <-> Checkout
// ===============================
window.showMenu = function () {
  const menu = document.getElementById("menuPage");
  const checkout = document.getElementById("checkoutPage");
  if (menu) menu.classList.remove("hidden");
  if (checkout) checkout.classList.add("hidden");

  // hide success overlay if it was left open
  document.getElementById("successMessage")?.classList.add("hidden");

  window.location.hash = "#menu-select";
  try { window.updateFloatingCheckoutButton?.(); } catch (_) {}
};

window.showCheckout = function () {
  const menu = document.getElementById("menuPage");
  const checkout = document.getElementById("checkoutPage");
  if (menu) menu.classList.add("hidden");
  if (checkout) checkout.classList.remove("hidden");

  window.location.hash = "#order-section";

  // focus name field
  setTimeout(() => {
    document.getElementById("customerName")?.focus?.();
  }, 200);
};

// ===============================
// Weekly fulfillment messaging
// ===============================
window.SS_TIMEZONE = "America/New_York";

function fmtShortDateET(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: window.SS_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getWeekdayET(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: window.SS_TIMEZONE,
    weekday: "short",
  }).formatToParts(date);

  const wk = parts.find(p => p.type === "weekday")?.value || "";
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wk] ?? date.getDay();
}

function getNextSaturdayET(from = new Date()) {
  const dow = getWeekdayET(from);
  const daysUntilSat = (6 - dow + 7) % 7;
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + daysUntilSat);
  return d;
}

function getSaturdayAfterNextET(from = new Date()) {
  const nextSat = getNextSaturdayET(from);
  const d = new Date(nextSat.getTime());
  d.setDate(d.getDate() + 7);
  return d;
}

function getDaysLeftToOrderET(from = new Date()) {
  const dow = getWeekdayET(from);
  if (dow >= 1 && dow <= 5) return 6 - dow;
  return 0;
}

window.updateScheduleBanner = function () {
  const line1 = document.getElementById("scheduleLine1");
  const line2 = document.getElementById("scheduleLine2");
  const banner = document.getElementById("scheduleBanner");
  if (!line1 || !line2 || !banner) return;

  const now = new Date();
  const dow = getWeekdayET(now);
  const hoursLabel = "10:00 AM – 8:00 PM ET";

  if (dow >= 1 && dow <= 5) {
    const thisSat = getNextSaturdayET(now);
    const daysLeft = getDaysLeftToOrderET(now);

    line1.textContent = `Next orders go out on: ${fmtShortDateET(thisSat)}`;

    if (daysLeft <= 1) line2.textContent = `⏳ Last day to order for this Saturday!`;
    else line2.textContent = `⏳ Only ${daysLeft} days left to order for this Saturday!`;
    return;
  }

  const nextSat = getSaturdayAfterNextET(now);
  line1.textContent = `We fulfill orders on Saturdays only :(`;
  line2.textContent = `Orders placed today will be served on ${fmtShortDateET(nextSat)} • ${hoursLabel}`;
};

// ===============================
// Floating checkout button logic
// ===============================
window.updateFloatingCheckoutButton = function () {
  const btn = document.getElementById("floatingCheckoutBtn");
  const label = document.getElementById("floatingCheckoutLabel");
  if (!btn || !label) return;

  const totalQty = Object.values(window.orderState).reduce((sum, st) => sum + (st.qty || 0), 0);

  if (totalQty <= 0) {
    btn.classList.add("hidden");
    return;
  }

  label.textContent = totalQty === 1 ? "Checkout (1 item)" : `Checkout (${totalQty} items)`;
  btn.classList.remove("hidden");
};

window.bindFloatingCheckoutButton = function () {
  const btn = document.getElementById("floatingCheckoutBtn");
  if (!btn || btn.__ssBound) return;
  btn.__ssBound = true;

  btn.addEventListener("click", () => {
    window.showCheckout();
  });
};

// --- Out-of-stock toggles ---
window.setOutOfStock = function (id, isOutOfStock = true) {
  const item = window.CATALOG.find(x => x.id === id);
  if (!item) return;

  item.outOfStock = !!isOutOfStock;

  if (item.outOfStock && window.orderState?.[id]) {
    window.orderState[id].qty = 0;
    const qtyEl = document.getElementById(`qty-${id}`);
    if (qtyEl) qtyEl.textContent = "0";
  }

  if (typeof window.renderMenus === "function") window.renderMenus();
  if (typeof window.updateSummary === "function") window.updateSummary();
};

window.toggleOutOfStock = function (id) {
  const item = window.CATALOG.find(x => x.id === id);
  if (!item) return;
  window.setOutOfStock(id, !item.outOfStock);
};