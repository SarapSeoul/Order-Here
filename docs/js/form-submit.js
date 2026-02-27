window.formatDM = function (data) {
  let msg = `🍽️ NEW ORDER - SarapSeoul\n\n`;
  msg += `👤 Name: ${data.name}\n`;
  msg += `✅ Preferred contact: ${data.contactMethod === "phone" ? "Phone" : "Instagram DM"}\n`;

  if (data.contactMethod === "instagram") {
    msg += `📷 IG: @${data.instagram}\n`;
    if (data.phone) msg += `📞 Phone (optional): ${data.phone}\n`;
  } else {
    msg += `📞 Phone: ${data.phone}\n`;
    if (data.instagram) msg += `📷 IG (optional): @${data.instagram}\n`;
  }

  // ✅ NEW
  if (data.paymentMethod) {
    const labelMap = { zelle: "Zelle", cashapp: "Cash App", venmo: "Venmo" };
    msg += `💳 Payment: ${labelMap[data.paymentMethod] || data.paymentMethod}\n`;
  }

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
  if (!form) return;

  const fulfillment = document.getElementById("fulfillment");
  const addressWrap = document.getElementById("addressWrap");
  const address = document.getElementById("address");
  const deliveryFeeNotice = document.getElementById("deliveryFeeNotice");

  const contactMethod = document.getElementById("contactMethod");
  const instagram = document.getElementById("instagram");
  const phone = document.getElementById("phone");

  // ✅ NEW
  const paymentMethodEl = document.getElementById("paymentMethod");

  const igStar = document.getElementById("igRequiredStar");
  const phoneStar = document.getElementById("phoneRequiredStar");
  const successContactEl = document.getElementById("successContactMethod");

  const submitBtn = document.getElementById("submitBtn") || form.querySelector('button[type="submit"]');
  const loadingOverlay = document.getElementById("loadingOverlay");
  const success = document.getElementById("successMessage");

  let isSubmitting = false;

  function showLoading() {
    if (loadingOverlay) loadingOverlay.classList.remove("hidden");
    if (submitBtn) submitBtn.disabled = true;
    form.setAttribute("aria-busy", "true");
  }

  function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
    if (submitBtn) submitBtn.disabled = false;
    form.setAttribute("aria-busy", "false");
  }

  function syncContactRequirements() {
    const method = contactMethod?.value || "instagram";

    const igRequired = method === "instagram";
    const phoneRequired = method === "phone";

    if (instagram) instagram.required = igRequired;
    if (phone) phone.required = phoneRequired;

    igStar?.classList.toggle("hidden", !igRequired);
    phoneStar?.classList.toggle("hidden", !phoneRequired);

    if (successContactEl) {
      successContactEl.textContent = phoneRequired ? "phone" : "Instagram";
    }
  }

  // Initial sync + on change
  try { syncContactRequirements(); } catch (_) {}
  contactMethod?.addEventListener("change", syncContactRequirements);

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
    if (isSubmitting) return;

    syncContactRequirements();

    const hasItems = Object.values(window.orderState).some(x => x.qty > 0);
    if (!hasItems) {
      alert("Please select at least one item.");
      return;
    }

    // Contact validation
    const method = contactMethod?.value || "instagram";
    const igVal = (instagram?.value || "").trim().replace(/^@/, "");
    const phoneVal = (phone?.value || "").trim();

    if (method === "instagram" && !igVal) {
      alert("Please enter your Instagram username (required for Instagram DM contact).");
      instagram?.focus?.();
      return;
    }
    if (method === "phone" && !phoneVal) {
      alert("Please enter your phone number (required for phone contact).");
      phone?.focus?.();
      return;
    }

    if (fulfillment.value === "delivery" && !address.value.trim()) {
      alert("Please enter a delivery address.");
      return;
    }

    // ✅ NEW: payment method validation
    const paymentMethod = (paymentMethodEl?.value || "").trim();
    if (!paymentMethod) {
      alert("Please select a payment method (Zelle, Cash App, or Venmo).");
      paymentMethodEl?.focus?.();
      return;
    }

    isSubmitting = true;
    showLoading();

    try {
      const payload = {
        name: document.getElementById("customerName").value.trim(),
        contactMethod: method,
        instagram: igVal,
        phone: phoneVal,
        fulfillment: fulfillment.value,
        address: fulfillment.value === "delivery" ? address.value.trim() : "Pickup",

        // ✅ NEW
        paymentMethod: paymentMethod, // "zelle" | "cashapp" | "venmo"

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
  variant: item.hasVariant ? (st.variant || null) : null,  // ✅ add this
  name,
  qty: st.qty,
  unitPrice: item.price, // can remain (backend ignores)
  total: itemTotal,      // can remain (backend ignores)
});
 }
      });
       

      const dm = window.formatDM(payload);
      try { await navigator.clipboard.writeText(dm); } catch (_) {}

      const result = await window.sendToGoogleSheets(payload);

if (!result.ok) {
  alert("Order failed: " + result.error);
  return;
}

console.log("Order Created:", result.data);
alert(`Order submitted! Order ID: ${result.data.orderId}`);

      hideLoading();
      if (success) {
        success.classList.remove("hidden");
        lucide.createIcons();
      }

      if (method === "instagram") {
        setTimeout(() => {
          window.open(`https://ig.me/m/${window.APP_CONFIG.INSTAGRAM_HANDLE}`, "_blank");
        }, 1200);
      }
    } catch (err) {
      console.error("Order submit error:", err);
      alert("Something went wrong while sending your order. Please try again.");
      hideLoading();
    } finally {
      isSubmitting = false;
    }
  });

  window.__orderUI = window.__orderUI || {};
  window.__orderUI.hideLoading = hideLoading;
  window.__orderUI.showLoading = showLoading;
  window.__orderUI.syncContactRequirements = syncContactRequirements;
};
