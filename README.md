# E-2 Market
A premium e-commerce marketplace where buyers can purchase products and sellers can register and manage their inventory, sales, and deliveries.

## Core Features

### 1. Account & Security
- **Email OTP Verification:** Registration requires a 2-step email OTP verification.
- **Forgot Password Flow:** 3-step password recovery (email OTP validation → verify → reset password).
- **Theme Preferences:** Light & Dark mode switch in Navbar, persisting preferences in `localStorage`.
- **Responsive Theme Styling:** Fluid theme color variables across the entire dashboard (slates and purples for dark mode; clean skies and dark slate text for light mode).

### 2. Marketplace & Checkout
- **Dashboard listing:** Dynamic home product search, filter, and categorizations.
- **Amazon-Style Product Page:** High-fidelity page with thumbnail + multi-image gallery, interactive quantity updates, star-breakdowns, and verified reviews.
- **Checkout & Inventory:** Supports single item "Buy Now" and cart checkout with real-time stock deduction, order summaries, and automatic buyer invoice creation.

### 3. Seller Dashboard
- **Your Products:** Register products with a thumbnail and up to 5 gallery images.
- **Pending Orders:** Tracks customer orders. Confirmation requires entering the buyer's delivery OTP.
- **Sold Items:** Archive of successfully delivered orders.

### 4. Verified Reviews
- **Purchase Restriction:** Review forms are locked and only unlock after the order status becomes "delivered".
- **Media Uploads:** Reviewers can upload up to 5 images or videos to their reviews (stored on Cloudinary).
- **Customer Gallery & Lightbox Modal:** Product page gathers reviewed media in one gallery showing reviewer name, rating, and description with prev/next swipe controls.

### 5. Price Comparison
- **Compare Prices button** on every product page searches Google Shopping (via SerpAPI) for the same product across Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, Tata Cliq, JioMart, and more.
- **Precise model matching** — uses alphanumeric model-code extraction (e.g. `27GS75Q`) to filter out unrelated models from results, ensuring only listings for the exact same product are shown.
- **Clean table** — platforms without confirmed listings for the exact model are hidden entirely. If no external comparison is available, a friendly message is shown instead of an empty table.

### 6. Price History
- **Full price tracking** — every product records its price at the time of listing, and appends a new entry whenever the seller updates the price.
- **Interactive line chart** — rendered with the HTML5 Canvas API (no external dependencies). The chart shows a gradient-filled line with dot markers and hover tooltips displaying the exact price and date.
- **Date labels** — every data point is labelled with its date on the X-axis (rotated for legibility), so the full timeline is always visible.
- **Summary stats strip** — shows Current Price, Lowest Ever, Highest Ever, and total number of price changes.
- **Button-gated** — the chart is hidden by default and only appears after the user clicks "Show Price History". A second click collapses it.

---

## Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS (v4), Vanilla CSS (Color Grading Variables)
- **Backend:** Node.js (Express), Multer
- **Database:** MongoDB (Mongoose schemas)
- **Email System:** Nodemailer (SMTP/Gmail OTPs & order notifications)
- **Cloud Storage:** Cloudinary (Product images & review media)
- **Price Data:** SerpAPI — Google Shopping (optional, for live price comparison)

---

## Getting Started

### Configuration

#### Backend Environment (.env in Back-end/)
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://e-2-market.onrender.com
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=8d

# Cloudinary Setup
# NOTE: The keys are spelled CLOUDUNARY (with a 'U') in this codebase's environment configuration.
CLOUDUNARY_CLOUD_NAME=your_cloudinary_name
CLOUDUNARY_API_KEY=your_cloudinary_key
CLOUDUNARY_API_SECRET=your_cloudinary_secret

# Email setup
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Optional: enables live retailer price comparisons through Google Shopping
SERPAPI_KEY=your_serpapi_key
```

### Live price comparison

The product page includes a **Compare Prices** button. It searches Google Shopping for the exact same product model across popular Indian platforms and returns results sorted cheapest first. Set `SERPAPI_KEY` in `Back-end/.env` to retrieve live shopping listings with retailer images, links, delivery details, and ratings. Listings that do not match the product's model code are filtered out automatically. Platforms with no matching listing are hidden from the table.

### Price history

Price history is recorded automatically — no additional configuration is needed. The initial listing price is saved when a product is registered, and a new entry is appended every time the seller changes the price. The history endpoint is public (`GET /products/:productId/price-history`) and requires no authentication.

#### Frontend Environment (.env.local in front-end-next/)
Create a `.env.local` file in the `front-end-next` directory and configure the base API URL to point to your deployed backend address:
```env
NEXT_PUBLIC_API_URL=https://your-deployed-backend-url.com/e-2market/v1
```
*(If left blank or omitted, it defaults to local dev environment: `http://localhost:8000/e-2market/v1`)*

### Running Locally

1. **Start Backend Server:**
   ```bash
   cd Back-end
   npm install
   npm run dev
   ```
2. **Start Frontend Client:**
   ```bash
   cd front-end-next
   npm install
   npm run dev
   ```

