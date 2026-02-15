// Menu catalog (data only)
window.CATALOG = [
  { id:"porkbbq", section:"food", name:"K-Style Filipino Pork BBQ", price:9, desc:"Smoky grilled pork skewers marinated in a bold Filipino-style blend infused with gochujang, served with rice." },
  { id:"siopao", section:"food", name:"Kimchi Pork Asado Siopao", price:2, unit:"pc", desc:"Fluffy steamed buns filled with sweet-savory Filipino pork asado, infused with a kick of kimchi." },
  { id:"rangoons", section:"food", name:"Stuffed Crab Rangoons (6ct)", price:8, desc:"Golden-fried wontons stuffed with rich cream cheese and crab, crisp outside and creamy inside." },
  { id:"lumpia", section:"food", name:"Crispy Lumpia (6ct)", price:8, desc:"Golden-fried spring rolls with savory filling, served with sweet chili sauce." },

  { id:"turon", section:"dessert", name:"Golden Turon", price:2, unit:"pc", desc:"Crispy caramelized banana jackfruit rolls, topped with a brown sugar glaze.", note:"*Ube ice cream (extra)" },
  { id:"sago", section:"dessert", name:"Mango Mahal Sago", price:4, desc:"Chilled mango coconut cream with soft sago pearls and juicy Philippine mangoes." },
  { id:"flan", section:"dessert", name:"Caramel Silk Leche Flan", price:4, desc:"Silky smooth caramel custard, rich and decadent. By slice, or whole dish made to order!", hasVariant:true, variants:[
    { key:"slice", label:"Slice", multiplier:1 },
    { key:"whole", label:"Whole Dish", multiplier:4 }
  ]}
];
