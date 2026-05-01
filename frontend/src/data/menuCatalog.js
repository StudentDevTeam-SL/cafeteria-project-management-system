/**
 * menuCatalog.js — Shared Menu Data
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all menu items.
 * Imported by: Menu.jsx, Orders.jsx, Employees.jsx
 * Replace this with an Axios GET to /api/menu/ when Django is ready.
 * ─────────────────────────────────────────────────────────────
 */

export const FOOD_PHOTOS = {
  1:  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=280&fit=crop',
  2:  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=280&fit=crop',
  3:  'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=280&fit=crop',
  4:  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=280&fit=crop',
  5:  'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=280&fit=crop',
  6:  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=280&fit=crop',
  7:  'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=280&fit=crop',
  8:  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=280&fit=crop',
  9:  'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=280&fit=crop',
  10: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=280&fit=crop',
  11: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=280&fit=crop',
  12: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=280&fit=crop',
  13: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=280&fit=crop',
  14: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=280&fit=crop',
  15: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=280&fit=crop',
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
