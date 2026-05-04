/**
 * menuCatalog.js — Shared Menu Data
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all menu items.
 * Imported by: Menu.jsx, Orders.jsx, Employees.jsx
 * Replace this with an Axios GET to /api/menu/ when Django is ready.
 * ─────────────────────────────────────────────────────────────
 */

export const FOOD_PHOTOS = {
  1:  'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=400&h=280&fit=crop', // Grilled Chicken Sandwich
  2:  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=280&fit=crop', // Classic Beef Burger
  3:  'https://images.unsplash.com/photo-1612874687561-1e96a40ce80b?w=400&h=280&fit=crop', // Pasta Carbonara
  4:  'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&h=280&fit=crop', // Eggs Benedict
  5:  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=280&fit=crop', // Fried Rice Bowl
  6:  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=280&fit=crop', // Lamb Kebab Plate
  7:  'https://images.unsplash.com/photo-1599084949512-5eb1b0028fc7?w=400&h=280&fit=crop', // Fish & Chips
  8:  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=280&fit=crop', // Veggie Wrap
  9:  'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=280&fit=crop', // Caesar Salad
  10: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=280&fit=crop', // Greek Salad
  11: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=280&fit=crop', // Veggie Buddha Bowl
  12: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=280&fit=crop', // Tuna Nicoise Salad
  13: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=280&fit=crop', // Double Espresso
  14: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=280&fit=crop', // Iced Caramel Latte
  15: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=280&fit=crop', // Fresh Orange Juice
  16: 'https://images.unsplash.com/photo-1553530666-ba11a7dd0dc0?w=400&h=280&fit=crop', // Mango Smoothie
  17: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=280&fit=crop', // Mint Lemonade
  18: 'https://images.unsplash.com/photo-1544787219-7f47ccb7fae6?w=400&h=280&fit=crop', // Hot Chocolate
  19: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=280&fit=crop', // Chocolate Muffin
  20: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=400&h=280&fit=crop', // Margherita Pizza Slice
  21: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&h=280&fit=crop', // Garlic Bread
  22: 'https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?w=400&h=280&fit=crop', // Chicken Wings
  23: 'https://images.unsplash.com/photo-1590301157890-4810ed35a4d7?w=400&h=280&fit=crop', // Acai Berry Bowl
  24: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=280&fit=crop', // Chocolate Lava Cake
  25: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=280&fit=crop', // Tiramisu
};

export const CATEGORIES = ['All', 'Main Course', 'Beverages', 'Salads', 'Snacks', 'Desserts'];
export const CAT_EMOJI  = { 'Main Course': '🍽️', Beverages: '☕', Salads: '🥗', Snacks: '🍪', Desserts: '🍰' };

/** Initial menu items — replaces with API data when backend is connected */
export const INIT_MENU_ITEMS = [
  { id:1,  name:'Grilled Chicken Sandwich', price:12.50, category:'Main Course', is_active:true,  rating:4.8, desc:'Juicy grilled chicken, fresh lettuce & tomato on toasted brioche' },
  { id:2,  name:'Classic Beef Burger',       price:15.00, category:'Main Course', is_active:true,  rating:4.9, desc:'Premium beef patty, cheddar, caramelised onions & house sauce' },
  { id:3,  name:'Caesar Salad',              price:9.00,  category:'Salads',      is_active:true,  rating:4.7, desc:'Crispy romaine, parmesan, croutons & classic Caesar dressing' },
  { id:4,  name:'Double Espresso',           price:3.50,  category:'Beverages',   is_active:true,  rating:5.0, desc:'Rich double-shot Arabica espresso, perfectly extracted' },
  { id:5,  name:'Fresh Orange Juice',        price:4.50,  category:'Beverages',   is_active:false, rating:4.5, desc:'Freshly squeezed Valencia oranges, no added sugar' },
  { id:6,  name:'Pasta Carbonara',           price:11.25, category:'Main Course', is_active:true,  rating:4.8, desc:'Al dente penne, crispy bacon, egg yolk & pecorino romano' },
  { id:7,  name:'Chocolate Muffin',          price:3.00,  category:'Snacks',      is_active:true,  rating:4.6, desc:'Freshly baked double-chocolate chunk muffin' },
  { id:8,  name:'Iced Caramel Latte',        price:5.50,  category:'Beverages',   is_active:true,  rating:4.9, desc:'Cold brew espresso, steamed milk & house caramel drizzle' },
  { id:9,  name:'Greek Salad',               price:8.50,  category:'Salads',      is_active:true,  rating:4.7, desc:'Tomato, cucumber, olives, feta & extra virgin olive oil' },
  { id:10, name:'Veggie Buddha Bowl',        price:10.50, category:'Salads',      is_active:true,  rating:4.8, desc:'Roasted veggies, quinoa, avocado, tahini & mixed greens' },
  { id:11, name:'Margherita Pizza Slice',    price:6.00,  category:'Snacks',      is_active:true,  rating:4.7, desc:'San Marzano tomato, fresh mozzarella & basil' },
  { id:12, name:'Eggs Benedict',             price:13.00, category:'Main Course', is_active:true,  rating:4.8, desc:'Poached eggs, Canadian bacon, hollandaise on English muffin' },
  { id:13, name:'Fried Rice Bowl',           price:9.50,  category:'Main Course', is_active:true,  rating:4.6, desc:'Jasmine rice, seasonal vegetables, soy & sesame' },
  { id:14, name:'Philly Cheesesteak',        price:14.00, category:'Main Course', is_active:false, rating:4.9, desc:'Shaved ribeye, provolone & sautéed peppers in hoagie roll' },
  { id:15, name:'Acai Berry Bowl',           price:8.00,  category:'Desserts',    is_active:true,  rating:4.9, desc:'Blended acai, granola, fresh berries & honey drizzle' },
];
