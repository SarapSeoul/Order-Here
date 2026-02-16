window.setCategory = function (cat) {
  window.__activeCategory = cat;

  const heading = document.getElementById("menu-heading");
  const map = {
    featured: "Featured",
    menu: "Mains",
    desserts: "Desserts",
    party: "Party Trays",
  };
  if (heading) heading.textContent = map[cat] || "Menu";

  document.querySelectorAll(".ss-cat-btn").forEach(btn => {
    const isActive = btn.dataset.cat === cat;
    btn.classList.toggle("bg-white/70", isActive);
    btn.classList.toggle("bg-white/40", !isActive);
  });

  window.renderMenus();
};
