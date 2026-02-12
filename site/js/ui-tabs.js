window.setTab = function (which) {
  const tabFood = document.getElementById("tab-food");
  const tabDessert = document.getElementById("tab-dessert");
  const menuHeading = document.getElementById("menu-heading");
  const menuFood = document.getElementById("menu-food");
  const menuDessert = document.getElementById("menu-dessert");

  const isFood = which === "food";
  menuFood.classList.toggle("hidden", !isFood);
  menuDessert.classList.toggle("hidden", isFood);
  menuHeading.textContent = isFood ? "Food Menu" : "Dessert Menu";

  tabFood.classList.toggle("bg-white/70", isFood);
  tabFood.classList.toggle("bg-white/40", !isFood);

  tabDessert.classList.toggle("bg-white/70", !isFood);
  tabDessert.classList.toggle("bg-white/40", isFood);
};
