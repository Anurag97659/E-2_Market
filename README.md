# E-2 Market
A premium e-commerce marketplace where buyers can purchase products and sellers can register and manage their inventory, sales, and deliveries.

## Core Features

### 1. Account & Security
- **Email OTP Verification:** Registration requires a 2-step email OTP verification.
- **Forgot Password Flow:** 3-step password recovery (email OTP validation -> verify -> reset password).
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

---

## Tech Stack
- **Frontend:** React (Vite), React Router Dom, Vanilla CSS (Color Grading Variables)
- **Backend:** Node.js (Express), Multer
- **Database:** MongoDB (Mongoose schemas)
- **Email System:** Nodemailer (SMTP/Gmail OTPs & order notifications)
- **Cloud Storage:** Cloudinary (Product images & review media)

---

## Getting Started

### Configuration

#### Backend Environment (.env in Back-end/)
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000,https://e-2-market.onrender.com
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

#### Frontend Environment (.env in front-end/)
Create a `.env` file in the `front-end` directory and configure the base API URL to point to your deployed backend address:
```env
REACT_APP_API_URL=https://your-deployed-backend-url.com/e-2market/v1
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
   cd front-end
   npm install
   npm run dev
   ```
