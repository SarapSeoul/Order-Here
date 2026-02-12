window.cardHTML = function (item) {
  const priceLabel = item.unit ? `$${item.price}/${item.unit}` : `$${item.price}`;

  const variantHTML = item.hasVariant ? `
    <div class="mt-3 flex flex-wrap items-center gap-3">
      <label class="handwritten text-lg text-gray-700 font-bold">Type:</label>
      <select data-variant="${item.id}" class="px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-[#B83C1D] focus:outline-none bg-white handwritten text-lg">
        ${item.variants.map(v => `<option value="${v.key}">${v.label}</option>`).join("")}
      </select>
    </div>
  ` : "";

  const noteHTML = item.note ? `<p class="text-sm text-gray-600 italic handwritten mt-2">${item.note}</p>` : "";

  return `
    <div class="menu-card bg-white/55 backdrop-blur-sm rounded-2xl p-6 rust-border border-4 shadow-lg paper-texture">
      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-1">
          <div class="flex justify-between items-start gap-4 mb-2">
            <h3 class="handwritten text-3xl md:text-4xl deep-blue font-bold">${item.name}</h3>
            <span class="handwritten text-3xl text-amber-700 font-bold">${priceLabel}</span>
          </div>

          <p class="text-gray-700 text-lg leading-relaxed handwritten">${item.desc}</p>
          ${noteHTML}
          ${variantHTML}

          <div class="mt-4 flex items-center gap-4">
            <button class="qty-btn w-10 h-10 rounded-full rust-bg text-white flex items-center justify-center text-xl font-bold" data-minus="${item.id}">-</button>
            <span id="qty-${item.id}" class="text-2xl font-bold text-gray-800 w-10 text-center">0</span>
            <button class="qty-btn w-10 h-10 rounded-full rust-bg text-white flex items-center justify-center text-xl font-bold" data-plus="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

window.renderMenus = function () {
  const foodWrap = document.getElementById("menu-food");
  const dessertWrap = document.getElementById("menu-dessert");

  foodWrap.innerHTML = window.CATALOG.filter(i => i.section === "food").map(window.cardHTML).join("");
  dessertWrap.innerHTML = window.CATALOG.filter(i => i.section === "dessert").map(window.cardHTML).join("");

  // plus/minus
  document.querySelectorAll("[data-plus]").forEach(btn => {
    btn.addEventListener("click", () => window.changeQty(btn.dataset.plus, +1));
  });
  document.querySelectorAll("[data-minus]").forEach(btn => {
    btn.addEventListener("click", () => window.changeQty(btn.dataset.minus, -1));
  });

  // variants
  document.querySelectorAll("select[data-variant]").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const id = e.target.dataset.variant;
      window.orderState[id].variant = e.target.value;
      window.updateSummary();
    });
  });
};

window.changeQty = function (id, delta) {
  const next = window.orderState[id].qty + delta;
  if (next < 0) return;
  window.orderState[id].qty = next;
  document.getElementById(`qty-${id}`).textContent = String(next);
  window.updateSummary();
};
