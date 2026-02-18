window.sendToGoogleSheets = async function (payload) {
  const url = window.APP_CONFIG.SCRIPT_URL;
  if (!url || url.includes("YOUR_GOOGLE_APPS_SCRIPT_URL_HERE")) {
    console.log("Sheets integration not configured.");
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Sheets send error:", err);
  }
};
