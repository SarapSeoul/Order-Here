// Builds one menu card
window.cardHTML = function (item) {
  const priceLabel = `$${item.price}`;
  const isOOS = item.outOfStock === true;

  const oosLabelHTML = isOOS
    ? `<span class="handwritten text-2xl font-bold text-red-600 ml-3">(OUT OF STOCK)</span>`
    : "";

  const imgHTML = item.img ? `
    <div class="w-full md:w-56 shrink-0">
      <img
        src="${item.img}"
        alt="${item.name}"
        class="w-full h-48 md:h-44 object-cover rounded-2xl rust-border border-4 shadow-md"
        loading="lazy"
      />
    </div>
  ` : "";

  const noteHTML = item.note
    ? `<p class="text-sm text-gray-600 italic handwritten mt-2">${item.note}</p>`
    : "";

  const variantHTML = item.hasVariant ? `
    <div class="mt-3 flex flex-wrap items-center gap-3">
      <label class="handwritten text-lg text-gray-700 font-bold">Choose:</label>
      <select
        data-variant="${item.id}"
        ${isOOS ? "disabled" : ""}
        class="px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-[#B83C1D] focus:outline-none bg-white handwritten text-lg ${isOOS ? "opacity-60 cursor-not-allowed" : ""}"
      >
        ${(item.variants || []).map(v => `<option value="${v.key}">${v.label}</option>`).join("")}
      </select>
    </div>
  ` : "";

  return `
    <div class="menu-card bg-white/55 backdrop-blur-sm rounded-2xl p-6 rust-border border-4 shadow-lg paper-texture ${isOOS ? "opacity-80" : ""}">
      <div class="flex flex-col md:flex-row gap-6">
        ${imgHTML}

        <div class="flex-1">
          <div class="flex justify-between items-start gap-4 mb-2">
            <div class="flex items-baseline flex-wrap">
              <h3 class="handwritten text-3xl md:text-4xl deep-blue font-bold">${item.name}</h3>
              ${oosLabelHTML}
            </div>
            <span class="handwritten text-3xl text-amber-700 font-bold">${priceLabel}</span>
          </div>

          <p class="text-gray-700 text-lg leading-relaxed handwritten ${isOOS ? "opacity-70" : ""}">${item.desc}</p>
          ${noteHTML}
          ${variantHTML}

          <div class="mt-4 flex items-center gap-4">
            <button
              class="qty-btn w-10 h-10 rounded-full rust-bg text-white flex items-center justify-center text-xl font-bold ${isOOS ? "opacity-50 cursor-not-allowed" : ""}"
              data-minus="${item.id}"
              ${isOOS ? "disabled" : ""}
            >-</button>

            <span id="qty-${item.id}" class="text-2xl font-bold text-gray-800 w-10 text-center">0</span>

            <button
              class="qty-btn w-10 h-10 rounded-full rust-bg text-white flex items-center justify-center text-xl font-bold ${isOOS ? "opacity-50 cursor-not-allowed" : ""}"
              data-plus="${item.id}"
              ${isOOS ? "disabled" : ""}
            >+</button>
          </div>

          ${isOOS ? `<p class="handwritten text-lg text-red-600 font-bold mt-3">This item is currently unavailable.</p>` : ""}
        </div>
      </div>
    </div>
  `;
};

// Updates qty in state + UI, then summary + floating checkout
window.changeQty = function (id, delta) {
  const item = window.CATALOG.find(x => x.id === id);
  if (!item) return;
  if (item.outOfStock) return;

  const next = (window.orderState[id]?.qty || 0) + delta;
  if (next < 0) return;

  window.orderState[id].qty = next;

  const qtyEl = document.getElementById(`qty-${id}`);
  if (qtyEl) qtyEl.textContent = String(next);

  window.updateSummary();

  // GA4 event (only when adding, not removing)
  if (delta > 0) {
    try {
      if (typeof gtag === "function") {
        gtag("event", "add_item_click", {
          item_id: id,
          item_name: item.name || "",
          item_category: item.category || ""
        });
      }
    } catch (_) {}
  }
};


// Renders items by active category:
// featured -> featured
// menu -> plates + sides
// desserts -> desserts
// party -> party
window.renderMenus = function () {
  const wrap = document.getElementById("menu-list");
  if (!wrap) return;

  const active = window.__activeCategory || "featured";

  const items = window.CATALOG.filter(i => {
    if (active === "menu") return i.category === "plates" || i.category === "sides";
    return i.category === active;
  });

  if (items.length === 0) {
    wrap.innerHTML = `
      <div class="bg-white/60 rounded-2xl rust-border border-4 shadow-lg p-6 paper-texture text-center">
        <p class="handwritten text-3xl deep-blue font-bold">Nothing here yet!</p>
        <p class="text-gray-700 mt-2">If you expected items, double-check your catalog category labels.</p>
      </div>
    `;
    return;
  }

  wrap.innerHTML = items.map(window.cardHTML).join("");

  // Bind plus/minus buttons
  wrap.querySelectorAll("[data-plus]").forEach(btn => {
    btn.addEventListener("click", () => window.changeQty(btn.dataset.plus, +1));
  });
  wrap.querySelectorAll("[data-minus]").forEach(btn => {
    btn.addEventListener("click", () => window.changeQty(btn.dataset.minus, -1));
  });

  // Bind variant dropdowns + initialize selected value from state
  wrap.querySelectorAll("select[data-variant]").forEach(sel => {
    const id = sel.dataset.variant;

    if (window.orderState?.[id]?.variant) {
      sel.value = window.orderState[id].variant;
    } else {
      // fallback to first option
      const first = sel.querySelector("option")?.value ?? null;
      window.orderState[id].variant = first;
      if (first) sel.value = first;
    }

    sel.addEventListener("change", (e) => {
      window.orderState[id].variant = e.target.value;
      window.updateSummary();
    });
  });
};
