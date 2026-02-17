// Menu catalog (data only)
// category values: plates | sides | desserts | featured | party
window.CATALOG = [
  // PLATES
  {
    id: "bbqplate",
    category: "plates",
    showIn: ["featured", "main"],
    name: "K-Style Filipino Pork BBQ Plate",
    price: 10,
    desc: "Smoky grilled skewers marinated in a bold Filipino-style blend infused with gochujang, served with rice.",
    hasVariant: true,
    variants: [
      { key: "pork", label: "Pork", multiplier: 1 },
      { key: "chicken", label: "Chicken", multiplier: 1 },
    ],
    img: "./img/bbq-plate.png",
  },

  // SNACKS & SIDES
  {
    id: "siopao4",
    category: "sides",
    name: "Kimchi Pork Asado Siopao (4ct)",
    price: 8,
    desc: "Fluffy steamed buns filled with sweet-savory Filipino pork asado, infused with a kick of kimchi.",
    img: "./img/siopao.png",
  },
  {
    id: "rangoons6",
    category: "sides",
    name: "Stuffed Crab Rangoons (6ct)",
    price: 8,
    desc: "Golden-fried wontons stuffed with rich cream cheese and crab, crisp outside and creamy inside.",
    img: "./img/rangoons.png",
  },
  {
    id: "lumpia6",
    category: "sides",
    name: "Crispy Lumpia (6ct)",
    price: 8,
    desc: "Golden-fried spring rolls with savory filling, served with sweet chili sauce.",
    img: "./img/lumpia.png",
  },

  // DESSERTS
  {
    id: "turon4",
    category: "desserts",
    name: "Golden Turon (4ct)",
    price: 6,
    desc: "Crispy caramelized banana jackfruit rolls, topped with a brown sugar glaze.",
    note: "*Ube ice cream (extra)",
    img: "./img/turon.png",
  },
  {
    id: "sago",
    category: "desserts",
    name: "Mango Mahal Sago",
    price: 4,
    desc: "Chilled mango coconut cream with soft sago pearls and juicy Philippine mangoes.",
    img: "./img/sago.jpg",
  },
  {
    id: "flan",
    category: "desserts",
    name: "Caramel Silk Leche Flan",
    price: 4,
    desc: "Silky smooth caramel custard, rich and decadent. By slice, or whole dish made to order!",
    hasVariant: true,
    variants: [
      { key: "slice", label: "Slice", multiplier: 1 },
      { key: "whole", label: "Whole Dish", multiplier: 4 },
    ],
    img: "./img/flan.png",
  },

  // FEATURED (ShareBoxes)
  {
    id: "bundle-kapamilya",
    category: "featured",
    name: "Kapamilya ShareBox",
    price: 30,
    desc: "1 BBQ Plate (pork or chicken) + 9 Lumpia + 2 Mango Mahal Sago. Perfect to share.",
    hasVariant: true,
    variants: [
      { key: "pork", label: "BBQ Plate: Pork", multiplier: 1 },
      { key: "chicken", label: "BBQ Plate: Chicken", multiplier: 1 },
    ],
    img: "./img/sharebox-1.png",
  },
  {
    id: "bundle-kilig",
    category: "featured",
    name: "Kilig ShareBox",
    price: 18,
    desc: "1 BBQ Plate (pork or chicken) + 6 Crab Rangoons + 2 Turon",
    hasVariant: true,
    variants: [
      { key: "pork", label: "BBQ Plate: Pork", multiplier: 1 },
      { key: "chicken", label: "BBQ Plate: Chicken", multiplier: 1 },
    ],
    img: "./img/sharebox-2.png",
  },

  // PARTY TRAYS
  {
    id: "party-lumpia-30",
    category: "party",
    name: "Lumpia Party Tray (30 pcs)",
    price: 30,
    desc: "Party tray (pre-order 3+ days ahead).",
    img: "./img/party-lumpia.png",
  },
  {
    id: "party-lumpia-60",
    category: "party",
    name: "Lumpia Party Tray (60 pcs)",
    price: 50,
    desc: "Party tray (pre-order 3+ days ahead).",
    img: "./img/party-lumpia.png",
  },
  {
    id: "party-rangoon-30",
    category: "party",
    name: "Crab Rangoon Party Tray (30 pcs)",
    price: 30,
    desc: "Party tray (pre-order 3+ days ahead).",
    img: "./img/party-rangoon.png",
  },
  {
    id: "party-rangoon-60",
    category: "party",
    name: "Crab Rangoon Party Tray (60 pcs)",
    price: 50,
    desc: "Party tray (pre-order 3+ days ahead).",
    img: "./img/party-rangoon.png",
  },
  {
    id: "party-siopao-12",
    category: "party",
    name: "Siopao Tray (12 pcs)",
    price: 22,
    desc: "Party tray (pre-order 3+ days ahead).",
    img: "./img/siopao.png",
  },
  {
    id: "party-siopao-24",
    category: "party",
    name: "Siopao Tray (24 pcs)",
    price: 40,
    desc: "Party tray (pre-order 3+ days ahead).",
    img: "./img/siopao.png",
  },
  {
    id: "party-bbq-15",
    category: "party",
    name: "Pork BBQ Skewer Tray (15 skewers)",
    price: 40,
    desc: "Party tray (pre-order 3+ days ahead).",
    img: "./img/party-bbq.jpg",
  },
];
