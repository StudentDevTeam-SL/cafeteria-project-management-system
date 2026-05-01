# test.md — Cafeteria Management Testing Guide

## 1. How to Run the App for Testing

```bash
# Navigate to the project folder
cd "c:\Users\pc\Desktop\New folder (2)"

# Start the development server
npm run dev
# OR if PowerShell blocks it:
cmd /c "npm run dev"

# Open in browser:
# http://localhost:5173
```

---

## 2. Login Testing

### 2.1 Admin Login
1. Go to `http://localhost:5173/login`
2. Click the **"👑 Admin"** quick-login button
3. It fills `admin` / `admin` automatically
4. Click **Sign In**
5. **Expected:** Redirected to `/dashboard` with full admin sidebar

### 2.2 Employee Login
1. Click the **"👤 Employee"** quick-login button
2. Fills `employee` / `employee`
3. Click **Sign In**
4. **Expected:** Redirected to `/dashboard`, Salaries + Employees links are **hidden** (admin only)

### 2.3 Wrong Credentials
1. Type any wrong username/password
2. **Expected:** Red error alert appears below the title

---

## 3. Menu Page Testing

### 3.1 View Menu Items
- Go to `/menu`
- **Expected:** 15 food items displayed in grid, each with Unsplash photo, rating, price, category badge

### 3.2 Filter by Category
1. Click **"🥗 Salads"** tab
2. **Expected:** Only salad items visible (3 items)
3. Click **"☕ Beverages"**
4. **Expected:** Only drink items visible

### 3.3 Search
1. Type "burger" in the search box
2. **Expected:** Only "Classic Beef Burger" shows

### 3.4 Toggle Availability
1. Click the toggle switch icon on any card
2. **Expected:** Card shows "Unavailable" overlay, icon changes from green to gray

### 3.5 ✨ Add Menu Item with Photo Upload
1. Click **"+ Add Item"** button
2. The **Add Menu Item modal** opens
3. **To upload from your device:**
   - Click the dashed upload box (📷 icon area)
   - A file picker opens
   - Select any `.jpg`, `.png`, or `.webp` image from your computer
   - **Expected:** Photo preview appears immediately below the upload zone
4. **To use an internet URL:**
   - Paste a URL like `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=280&fit=crop`
   - **Expected:** Preview updates as you type
5. **To remove the photo:**
   - Hover over the preview
   - Click **"Remove"** button
6. Fill in Name, Price, Category, Description
7. Click **"Add to Menu"**
8. **Expected:** New card appears in the grid with your uploaded photo

### 3.6 Edit Menu Item
1. Click the ✏️ edit icon on any card
2. Modal opens pre-filled with item data
3. Change the price to `20.00`
4. Click **"Update Item"**
5. **Expected:** Card updates price to $20.00

### 3.7 Delete Menu Item & Undo
1. Click the 🗑️ delete icon on any card
2. **Expected:** Item disappears from the grid, and a notification popup appears at the bottom right with a 7-second timer bar.
3. Click **"Undo"** before the timer runs out.
4. **Expected:** The item instantly reappears in the grid.

---

## 4. Employees Page Testing

### 4.1 Filter Employees by Status
1. Go to `/employees`
2. Click the **"Active"** tab next to the search bar.
3. **Expected:** Only employees with a green "active" status are shown.
4. Click **"Inactive"**.
5. **Expected:** Only inactive employees are shown.

### 4.2 Quick Status Toggle
1. On any Employee Card, click the **Toggle Switch** icon in the bottom right corner.
2. **Expected:** The employee's status instantly changes from Active (green) to Inactive (gray) without opening any edit menus.

### 4.3 Delete Employee & Undo
1. Click the 🗑️ delete icon on an employee card.
2. **Expected:** Employee is removed, and a 7-second Undo popup appears. Click "Undo" to restore them.

---

## 4. Orders + Payment Testing

### 4.1 View Orders
- Go to `/orders`
- **Expected:** Table with 7 sample orders, each with status badge, payment method

### 4.2 Filter Orders
1. Click **"Processing"** tab
2. **Expected:** Only 2 orders shown

### 4.3 View Order Details
1. Click the 👁️ eye icon on any order row
2. **Expected:** Detail modal opens with items, total, employee, and payment method

### 4.4 Change Order Status
1. Open an order with **"Pending"** or **"Processing"** status
2. Click **"✓ Mark Completed"**
3. **Expected:** Modal closes, row status badge changes to green "Completed"

### 4.5 ✨ New Order + Payment Flow (Full Test)
1. Click **"+ New Order"** button
2. Enter an employee name, e.g. `Mohammed Ali`
3. Fill in item name: `Caesar Salad`, qty: `2`, price: `9.00`
4. Click **"+ Add row"** for a second item
5. Fill: `Espresso`, qty: `1`, price: `3.50`
6. **Expected total:** `$21.50` shown at the bottom
7. Click **"Proceed to Payment"**
8. **Payment Modal opens** — 4 methods shown:

#### Test: Cash Payment
- Click **Cash**
- A confirmation screen appears
- Click **Pay $21.50**
- **Expected:** Green ✓ success screen, order added to table with "Cash" badge

#### Test: Zaad Payment
- Click **Zaad**
- Enter phone: `+252 63 123 4567` (Observe that the cursor does not jump or lose focus while typing).
- Click **Pay**
- **Expected:** Success animation plays showing "Successfully pay for pay! ✨", order appears with "Zaad" badge

#### Test: PayPal Payment
- Click **PayPal**
- Enter email: `test@paypal.com`
- Click **Pay**
- **Expected:** Success

#### Test: Mastercard Payment
- Click **Card**
- Enter card: `5412 3456 7890 1234` (Mastercard — starts with 5)
- Name: `Ahmed Hassan`
- Expiry: `12/27`
- CVV: `123`
- **Expected:** "MC" badge appears next to the card number
- Click **Pay**
- **Expected:** Success

#### Test: Validation Errors
- Click **Card**, leave all fields empty
- Click **Pay**
- **Expected:** Red error messages under each field

---

## 6. About Page Testing

- Go to `http://localhost:5173/about`
- **Expected:** Completely **different page** from Home (restaurant photo hero, values, team, timeline)
- **NOT the same page** — verifies Home and About are fully separated

---

## 7. Home Page Testing

- Go to `http://localhost:5173/home`
- **Expected:**
  - Background video playing (cafeteria footage)
  - Giant "Cafeteria Management" headline
  - 3D mouse effect: move your mouse over the hero — the text follows slightly
  - 4 stat cards at the bottom of the hero
  - Marquee ticker scrolling below hero
  - Feature cards with 3D tilt on hover
  - Photo grid section with Unsplash images

---

## 8. Footer Testing

- On any public page (Home, About, Contact), scroll to the bottom
- **Expected:**
  - 4-column footer: Brand + Social, Quick Links, Features, Contact Info
  - 6 social media icons (X, Facebook, Instagram, LinkedIn, YouTube, WhatsApp)
  - Hover effect: icons change color and lift up
  - Business hours displayed
  - Privacy Policy / Terms of Service links in bottom bar

---

## 9. Dark Mode Testing

1. Click the 🌙 moon icon in the navbar
2. **Expected:**
   - Page switches to deep navy dark theme
   - All cards use dark glass styling
   - Footer stays dark regardless
3. Click ☀️ to switch back
4. **Expected:** Warm gray light mode (not pure white)

---

## 10. Mobile Responsive Testing

1. Open browser DevTools (F12)
2. Click the mobile device icon
3. Select **iPhone 12 Pro** (390px)
4. **Expected on mobile:**
   - Navbar: shows hamburger menu, desktop links hidden
   - Click hamburger → dropdown drawer opens
   - Home hero: headline text is smaller, stats in 2×2 grid
   - Menu: single column card grid
   - Admin sidebar: collapses to a mobile drawer

---

## 11. Known Issues / Limitations

| Issue                          | Status   | Notes                                       |
|-------------------------------|----------|---------------------------------------------|
| Video may not load            | Known    | Pexels videos depend on internet connection. Falls back to gradient overlay |
| Photos not persisted          | By design| Using mock data — needs Django backend      |
| Payment is not real           | By design| Frontend-only simulation                    |
| Login not JWT-secured         | By design| Uses mock auth — replace with Django JWT   |
| Unsplash images may 404       | Known    | If Unsplash changes URLs; onError fallback is in place |
