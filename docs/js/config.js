// Global config (easy to debug/change)
(function () {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  window.APP_CONFIG = {
    INSTAGRAM_HANDLE: "the_sarapseoul",

    // Local Spring Boot backend
    LOCAL_API_URL: "http://localhost:8080/api/orders",

    // Production backend (you will fill this in later when deployed)
    PROD_API_URL: "https://your-backend-domain.com/api/orders",

    get ORDER_API_URL() {
      return isLocalhost
        ? this.LOCAL_API_URL
        : this.PROD_API_URL;
    }
  };
})();