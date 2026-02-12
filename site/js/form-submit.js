window.formatDM = function (data) {
  let msg = `🍽️ NEW ORDER - SarapSeoul\n\n`;
  msg += `👤 Name: ${data.name}\n`;
  msg += `📷 IG: @${data.instagram}\n`;
  msg += `📞 Phone: ${data.phone}\n`;
  msg += `🚚 ${data.fulfillment.toUpperCase()}: ${data.address}\n\n`;
  msg += `🧾 ITEMS:\n`;
  data.items.forEach(it => {
    msg += `• ${it.qty}x ${it.name} - $${it.total.toFixed(2)}\n`;
  });
  msg += `\n💰 Subtotal: $${data.subtotal.toFixed(2)}\n`;

  if (data.fulfillment === "delivery") {
    msg += `🚚 Delivery fee: ${window.getDeliveryFeeLabel()}\n`;
  }
  if (data.allergies) {
    msg += `\n⚠️ Allergies/Notes: ${data.allergies}\n`;
  }
  msg += `\n— Sent from SarapSeoul Order Page`;
  return msg;
};

window.attachFormSubmit = function () {
  const form = document.getElementById("orderForm");

  const fulfillment = document.getElementById("fulfillment");
  const addressWrap = document.getElementById("addressWrap");
  const address = document.getElementById("address");
  const deliveryFeeNotice = document.getElementById("deliveryFeeNotice");

  fulfillment.addEventListener("change", () => {
    const isDelivery = fulfillment.value === "delivery";
    addressWrap.classList.toggle("hidden", !isDelivery);
    if (deliveryFeeNotice) deliveryFeeNotice.classList.toggle("hidden", !isDelivery);

    address.required = isDelivery;
    if (!isDelivery) address.value = "";

    window.updateSummary();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const hasItems = Object.values(window.orderState).some(x => x.qty > 0);
    if (!hasItems) {
      alert("Please select at least one item.");
      return;
    }

    if (fulfillment.value === "delivery" && !address.value.trim()) {
      alert("Please enter a delivery address.");
      return;
    }

    // Build payload
    const payload = {
      name: document.getElementById("customerName").value.trim(),
      instagram: document.getElementById("instagram").value.trim().replace(/^@/, ""),
      phone: document.getElementById("phone").value.trim(),
      fulfillment: fulfillment.value,
      address: fulfillment.value === "delivery" ? address.value.trim() : "Pickup",
      allergies: document.getElementById("allergies").value.trim(),
      items: [],
      subtotal: 0,
    };

    window.CATALOG.forEach(item => {
      const st = window.orderState[item.id];
      if (st.qty > 0) {
        const itemTotal = window.calcItemTotal(item, st.qty, st.variant);
        payload.subtotal += itemTotal;

        let name = item.name;
        if (item.hasVariant) {
          const v = item.variants.find(x => x.key === st.variant);
          name += ` (${v ? v.label : st.variant})`;
        }

        payload.items.push({
          id: item.id,
          name,
          qty: st.qty,
          unitPrice: item.price,
          total: itemTotal,
        });
      }
    });

    // Copy DM text
    const dm = window.formatDM(payload);
    try { await navigator.clipboard.writeText(dm); } catch (_) {}

    // Send to Sheets
    await window.sendToGoogleSheets(payload);

    // Success UI
    const success = document.getElementById("successMessage");
    success.classList.remove("hidden");
    lucide.createIcons();

    setTimeout(() => {
      window.open(`https://ig.me/m/${window.APP_CONFIG.INSTAGRAM_HANDLE}`, "_blank");
    }, 1200);
  });
};
