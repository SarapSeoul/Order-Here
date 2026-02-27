
// NOTE: Kept function name `sendToGoogleSheets` so code doesnt break
// It now sends orders to your Order API (Spring Boot locally; hosted API later).

window.sendToGoogleSheets = async function (payload) {
  // New: use the Order API URL instead of Google Apps Script
  const url = window.APP_CONFIG && window.APP_CONFIG.ORDER_API_URL;

  if (!url) {
    console.log("Order API not configured (APP_CONFIG.ORDER_API_URL is missing).");
    return { ok: false, error: "Order API not configured." };
  }

  // Optional safety: if you left the placeholder PROD URL, warn and stop
  if (String(url).includes("your-backend-domain.com")) {
    console.log("Order API not configured (PROD_API_URL is still a placeholder).");
    return { ok: false, error: "Order API not configured (placeholder URL)." };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Read body once (then parse as JSON if possible)
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        (data && (data.message || data.error)) ||
        text ||
        `Request failed with status ${response.status}`;

      console.error("Order API error:", response.status, message, data);
      return { ok: false, status: response.status, error: message, data };
    }

    // Success
    return { ok: true, status: response.status, data };
  } catch (err) {
    console.error("Order API network error:", err);
    return { ok: false, error: String(err) };
  }
};