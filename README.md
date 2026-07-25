# FitBulls Website — Premier Rubbers, Meerut
**Full-stack website for FitBulls gym equipment brand**

## Quick Start
```bash
npm install
node database/seed.js   # only needed if db.json is missing
node server/index.js
```
Open → http://localhost:3000

## Admin Panel
Go to http://localhost:3000 → scroll to footer → click "Admin Panel"
- Username: `admin`
- Password: `fitbulls2024`

## Deploy Free on Render
1. Push repo to GitHub
2. New Web Service on render.com → connect repo
3. Build: `npm install` | Start: `node server/index.js`
4. Live URL in ~2 min ✅

## Stack
- Node.js + Express backend
- JSON file database (lowdb)
- Vanilla HTML/CSS/JS frontend (no build step needed)

## What's Inside
- 6 pages: Home, Products, Product Detail, About, Contact, Admin
- 10 categories, 23 products, color images
- Live search, filter sidebar, testimonial carousel
- Enquiry form, newsletter subscription
- Admin dashboard: enquiries, products, subscribers
