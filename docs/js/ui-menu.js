// Builds one menu card (compact + expandable details)
window.cardHTML = function (item) {
  const priceLabel = `$${item.price}`;
  const isOOS = item.outOfStock === true;

  const oosLabelHTML = isOOS
    ? `<span class="handwritten text-xl font-bold text-red-600 ml-3">(OUT OF STOCK)</span>`
    : "";

  const imgHTML = item.img ? `
    <div class="w-full md:w-32 shrink-0">
      <img
        src="${item.img}"
        alt="${item.name}"
        class="w-full h-36 md:h-24 object-cover rounded-2xl rust-border border-4 shadow-md"
        loading="lazy"
      />
    </div>
  ` : "";

  const noteHTML = item.note
    ? `<p class="text-sm text-gray-600 italic handwritten mt-2">${item.note}</p>`
    : "";

  const detailsHTML = (item.desc || item.note) ? `
    <div id="details-${item.id}" class="hidden mt-3 pt-3 border-t border-gray-200">
      ${item.desc ? `<p class="text-gray-700 text-base leading-relaxed handwritten ${isOOS ? "opacity-70" : ""}">${item.desc}</p>` : ""}
      ${noteHTML}
    </div>
  ` : "";

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
    <div
      class="menu-card bg-white/55 backdrop-blur-sm rounded-2xl rust-border border-4 shadow-lg paper-texture ${isOOS ? "opacity-80" : ""}"
      data-card="${item.id}"
      role="button"
      tabindex="0"
      aria-expanded="false"
      aria-controls="details-${item.id}"
    >
      <div class="p-3 md:p-4">
        <div class="flex flex-col md:flex-row gap-4">
          ${imgHTML}

          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start gap-3">
              <div class="min-w-0">
                <div class="flex items-baseline flex-wrap">
                  <h3 class="handwritten text-2xl md:text-3xl deep-blue font-bold truncate">${item.name}</h3>
                  ${oosLabelHTML}
                </div>
                <p class="text-gray-500 text-sm handwritten mt-1">
                  <span class="opacity-80">Click for more details</span>
                </p>
              </div>

              <span class="handwritten text-2xl text-amber-700 font-bold whitespace-nowrap">${priceLabel}</span>
            </div>

            ${variantHTML}

            <div class="mt-3 flex items-center gap-4">
              <button
                class="qty-btn w-8 h-8 rounded-full rust-bg text-white flex items-center justify-center text-lg font-bold ${isOOS ? "opacity-50 cursor-not-allowed" : ""}"
                data-minus="${item.id}"
                ${isOOS ? "disabled" : ""}
                aria-label="Decrease quantity"
              >-</button>

              <span id="qty-${item.id}" class="text-lg font-bold text-gray-800 w-10 text-center">0</span>

              <button
                class="qty-btn w-8 h-8 rounded-full rust-bg text-white flex items-center justify-center text-lg font-bold ${isOOS ? "opacity-50 cursor-not-allowed" : ""}"
                data-plus="${item.id}"
                ${isOOS ? "disabled" : ""}
                aria-label="Increase quantity"
              >+</button>
            </div>

            ${isOOS ? `<p class="handwritten text-base text-red-600 font-bold mt-3">This item is currently unavailable.</p>` : ""}
            ${detailsHTML}
          </div>
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

// Toggle card details
window.toggleCardDetails = function (id) {
  const details = document.getElementById(`details-${id}`);
  const card = document.querySelector(`[data-card="${id}"]`);
  if (!details || !card) return;

  const isOpen = !details.classList.contains("hidden");
  if (isOpen) {
    details.classList.add("hidden");
    card.setAttribute("aria-expanded", "false");
  } else {
    details.classList.remove("hidden");
    card.setAttribute("aria-expanded", "true");
  }
};

// Renders items by active category
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
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.changeQty(btn.dataset.plus, +1);
    });
  });
  wrap.querySelectorAll("[data-minus]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.changeQty(btn.dataset.minus, -1);
    });
  });

  // Bind variant dropdowns + initialize selected value from state
  wrap.querySelectorAll("select[data-variant]").forEach(sel => {
    sel.addEventListener("click", (e) => e.stopPropagation());
    sel.addEventListener("mousedown", (e) => e.stopPropagation());

    const id = sel.dataset.variant;

    if (window.orderState?.[id]?.variant) {
      sel.value = window.orderState[id].variant;
    } else {
      const first = sel.querySelector("option")?.value ?? null;
      window.orderState[id].variant = first;
      if (first) sel.value = first;
    }

    sel.addEventListener("change", (e) => {
      window.orderState[id].variant = e.target.value;
      window.updateSummary();
    });
  });

  // Bind card click to toggle details
  wrap.querySelectorAll("[data-card]").forEach(card => {
    const id = card.dataset.card;

    card.addEventListener("click", () => window.toggleCardDetails(id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.toggleCardDetails(id);
      }
    });
  });
};