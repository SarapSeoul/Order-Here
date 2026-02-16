window.updateSummary = function () {
  const summaryDiv = document.getElementById("orderSummary");
  const totalPriceEl = document.getElementById("totalPrice");
  const isDelivery = document.getElementById("fulfillment")?.value === "delivery";

  let lines = "";
  let subtotal = 0;
  let hasItems = false;

  window.CATALOG.forEach(item => {
    const st = window.orderState[item.id];
    if (st.qty > 0) {
      hasItems = true;

      const itemTotal = window.calcItemTotal(item, st.qty, st.variant);
      subtotal += itemTotal;

      let label = item.name;
      if (item.hasVariant) {
        const v = item.variants.find(x => x.key === st.variant);
        label += ` (${v ? v.label : st.variant})`;
      }

      lines += `
        <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
          <span class="font-medium">${st.qty}x ${label}</span>
          <span class="font-bold text-gray-700">$${itemTotal.toFixed(2)}</span>
        </div>
      `;
    }
  });

  if (!lines) {
    summaryDiv.innerHTML = `<p class="text-gray-500 italic">No items selected yet. Add items above.</p>`;
    totalPriceEl.textContent = `$0.00`;

    // NEW: hide floating checkout
    try { window.updateFloatingCheckoutButton?.(); } catch (_) {}
    return;
  }

  if (isDelivery) {
    const feeLabel = window.getDeliveryFeeLabel();
    lines += `
      <div class="flex justify-between items-center pt-3 mt-3 border-t border-gray-300">
        <span class="font-semibold text-gray-700">Delivery fee</span>
        <span class="font-bold text-gray-700">${feeLabel}</span>
      </div>
      <div class="flex justify-between items-center mt-2">
        <span class="font-semibold text-gray-700">Estimated total</span>
        <span class="font-bold text-gray-700">Subtotal + delivery fee</span>
      </div>
    `;
  }

  summaryDiv.innerHTML = lines;
  totalPriceEl.textContent = `$${subtotal.toFixed(2)}`;

  // NEW: show/update floating checkout
  try { window.updateFloatingCheckoutButton?.(); } catch (_) {}
};
