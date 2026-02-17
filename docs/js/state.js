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
// NEW: Weekly fulfillment messaging
// ===============================

// Always compute dates in America/New_York (so your countdown matches “EST/ET”)
window.SS_TIMEZONE = "America/New_York";

// Format like: "Sat, Mar 2"
function fmtShortDateET(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: window.SS_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Returns weekday index in ET: 0=Sun ... 6=Sat
function getWeekdayET(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: window.SS_TIMEZONE,
    weekday: "short",
  }).formatToParts(date);

  const wk = parts.find(p => p.type === "weekday")?.value || "";
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wk] ?? date.getDay();
}

// Next Saturday relative to “now” in ET
function getNextSaturdayET(from = new Date()) {
  const dow = getWeekdayET(from); // 0..6
  const daysUntilSat = (6 - dow + 7) % 7; // 0 if Saturday
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + daysUntilSat);
  return d;
}

// Saturday AFTER this coming one (used on Sat/Sun messaging)
function getSaturdayAfterNextET(from = new Date()) {
  const nextSat = getNextSaturdayET(from);
  const d = new Date(nextSat.getTime());
  d.setDate(d.getDate() + 7);
  return d;
}

// Days left until Friday (ET), for urgency line
function getDaysLeftToOrderET(from = new Date()) {
  const dow = getWeekdayET(from); // 0=Sun..6=Sat
  // If Mon(1) -> 4 days until Fri? Actually we want "days left to order" inclusive feel:
  // Mon: 4 days left AFTER today, but most people interpret as "5 days left (Mon-Fri)".
  // We'll do an inclusive label instead:
  // Mon: 5, Tue: 4, Wed: 3, Thu: 2, Fri: 1, else: 0
  if (dow >= 1 && dow <= 5) return 6 - dow; // Mon->5 ... Fri->1
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

  // Mon–Fri
  if (dow >= 1 && dow <= 5) {
    const thisSat = getNextSaturdayET(now); // upcoming Sat
    const daysLeft = getDaysLeftToOrderET(now);

    line1.textContent = `Next orders go out on: ${fmtShortDateET(thisSat)}`;

    if (daysLeft <= 1) {
      line2.textContent = `⏳ Last day to order for this Saturday!`;
    } else {
      line2.textContent = `⏳ Only ${daysLeft} days left to order for this Saturday!`;
    }
    return;
  }

  // Sat/Sun
  const nextSat = getSaturdayAfterNextET(now); // next fulfillment Saturday
  line1.textContent = `We fulfill orders on Saturdays only :(`;
  line2.textContent = `Orders placed today will be served on ${fmtShortDateET(nextSat)} • ${hoursLabel}`;
};

// ===============================
// NEW: Floating checkout button logic
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

// Attach click once (safe to call multiple times)
window.bindFloatingCheckoutButton = function () {
  const btn = document.getElementById("floatingCheckoutBtn");
  if (!btn || btn.__ssBound) return;
  btn.__ssBound = true;

  btn.addEventListener("click", () => {
    const orderSection = document.getElementById("order-section");
    if (orderSection) orderSection.scrollIntoView({ behavior: "smooth", block: "start" });

    // Focus the name field after scroll (small delay)
    setTimeout(() => {
      const nameInput = document.getElementById("customerName");
      nameInput?.focus?.();
    }, 350);
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
