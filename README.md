# Dynamic Product Frontend — React Admin Panel

A production-grade React admin panel for the Dynamic Product & Search system. All form fields, product detail tabs, and search filters are **driven entirely by backend APIs** — no frontend hardcoding of category-specific data.

---

## Project Structure

```
frontend/
├── public/
│   └── index.html                        # Loads Syne + DM Sans + DM Mono fonts
├── src/
│   ├── api/
│   │   └── index.js                      # Axios client + categoryAPI, productAPI, searchAPI
│   ├── components/
│   │   ├── common/
│   │   │   ├── DynamicField.js           # ★ Core: renders any attribute type dynamically
│   │   │   └── TagsInput.js              # Pill-style tags input with keyboard support
│   │   └── layout/
│   │       ├── Sidebar.js                # Fixed sidebar navigation
│   │       └── Sidebar.css
│   ├── pages/
│   │   ├── AddProduct/
│   │   │   ├── AddProduct.js             # ★ Dynamic form — fields change per category
│   │   │   └── AddProduct.css
│   │   ├── ProductDetail/
│   │   │   ├── ProductDetail.js          # ★ Detail page tabs driven by category.detailSections
│   │   │   └── ProductDetail.css
│   │   ├── SearchPage/
│   │   │   ├── SearchPage.js             # ★ Filters fetched from /api/search/filters
│   │   │   └── SearchPage.css
│   │   ├── Categories/
│   │   │   ├── Categories.js             # Admin: create categories + attribute definitions
│   │   │   └── Categories.css
│   │   └── ProductsPage.js               # Product list / home
│   ├── App.js                            # React Router setup
│   ├── index.js                          # Entry point
│   └── index.css                         # Design system (CSS variables + all shared styles)
├── .env.example
└── package.json
```

---

## Pages

### Add Product (`/products/add`) ★ Key Feature

1. Admin selects a **category** (fetched from `GET /api/categories`)
2. The form calls `GET /api/categories/:slug` to load the category's `attributes[]` definition
3. **`DynamicField`** renders the right input type for each attribute:
   - `text` → `<input type="text">`
   - `number` → `<input type="number">`
   - `select` → `<select>` with backend-provided options
   - `multiselect` → pill checkbox grid
   - `boolean` → radio buttons
   - `range` → min/max input pair
4. The **Highlights** section appears only if `category.detailSections` includes `"highlights"`
5. Required attribute validation is run client-side using the category definition

### Product Detail (`/products/:slug`) ★ Key Feature

- Fetches product + category definition from `GET /api/products/:slug`
- Tab bar is built from `category.detailSections` — e.g. Mobile shows `[Highlights, Specifications, Description]`, Bangles shows `[Specifications, Description]`
- Specifications table is built by joining `category.attributes[]` with `product.attributes` map
- Attribute display chips show the top 4 attributes with their labels

### Search (`/search`) ★ Key Feature

- `GET /api/search/filters?category=<slug>` returns dynamic filter definitions
- Filter panel renders accordingly:
  - `multiselect` → checkbox list with real values from DB
  - `range` → min/max number inputs with real min/max from DB
- All filters are passed as query params to `GET /api/search`
- URL is synced with search state (shareable/bookmarkable links)

### Categories (`/categories`)

- View all categories
- Create new categories with full attribute definition builder
- No frontend changes needed when a new category is added to the system

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running on port 5001

### Install & Run

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if backend is not on localhost:5001
npm start
# Opens on http://localhost:3000
```

The `"proxy": "http://localhost:5001"` in `package.json` proxies API calls in development.

---

## Design System

All tokens are in `src/index.css` as CSS variables:

```css
--bg-base: #0a0a0f /* page background */ --accent: #5b5bd6
  /* primary brand color */ --font-display: "Syne" /* headings */
  --font-body: "DM Sans" /* body text */ --font-mono: "DM Mono"
  /* code, tags, chips */;
```

Dark industrial admin aesthetic — no generic purple gradients, no Inter font.

---

## Bonus: Adding a New Category — Zero Frontend Changes

```bash
POST /api/categories
{
  "name": "Headphones",
  "icon": "🎧",
  "attributes": [
    { "key": "driver", "label": "Driver Size", "type": "number", "unit": "mm", "required": true, "filterable": true },
    { "key": "connectivity", "label": "Connectivity", "type": "select", "options": ["Wired", "Bluetooth", "Both"], "filterable": true },
    { "key": "noiseCancelling", "label": "Noise Cancelling", "type": "boolean", "filterable": true }
  ],
  "detailSections": ["highlights", "specifications", "description"]
}
```

That's all. The React app will:

- Show "Headphones" in category selectors
- Render a Driver Size number input, Connectivity dropdown, and Noise Cancelling radio on the Add Product form
- Show Highlights + Specifications + Description tabs on the detail page
- Offer Driver Size range filter and Connectivity/Noise Cancelling checkbox filters in Search
