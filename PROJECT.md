# PlaasMark — project overview

This document summarises the **PlaasMark** web app as it exists in the repository today: stack, structure, features, and how to run it.

---

## Tech stack

| Area         | Choice                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| Framework    | **Next.js 16** (App Router, **not** Pages Router)                                                            |
| UI           | **styled-components** (no Tailwind)                                                                          |
| Language     | **TypeScript** (`.tsx` / `.ts`)                                                                              |
| React        | **19**                                                                                                       |
| Database ORM | **Prisma** with **MySQL** (`DATABASE_URL`)                                                                   |
| PWA          | Manual **service worker** (`public/sw.js`) + `app/manifest.ts` (not `next-pwa`, for Turbopack compatibility) |
| Formatting   | **Prettier**                                                                                                 |
| Git hooks    | **Husky** + **lint-staged** (pre-commit: format staged files, lint all, production build)                    |

---

## Scripts & port

- **Development:** `npm run dev` → **http://localhost:3002** (`next dev -p 3002`)
- **Production:** `npm run build` then `npm run start` → same port **3002**
- **Lint:** `npm run lint` (`eslint .`)
- **Format:** `npm run format` (Prettier, whole repo); **`npm run format:check`** (check only, no writes)
- **PWA icons:** `npm run icons` (runs `scripts/generate-pwa-icons.mjs` before `build` as well)
- **Database:** `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:studio`, **`npm run db:seed`** (runs `prisma/seed.mjs` — clears `Product` rows then inserts sample data)
- **Postinstall:** `prisma generate` (client after `npm install`)
- **Prepare:** `husky` (installs Git hooks after `npm install`)

### Git pre-commit

On every **`git commit`**, **`.husky/pre-commit`** runs:

1. **`lint-staged`** — ESLint `--fix` + Prettier on staged `*.{ts,tsx,js,mjs,cjs}`; Prettier only on staged `*.{json,md,css,yml,yaml}`.
2. **`npm run lint`** — full ESLint pass on the repo.
3. **`npm run build`** — same as CI: icons script + `next build`.

If any step fails, the commit is aborted. Emergency skip (not for routine use):  
`HUSKY=0 git commit …`

Environment template: **`.env.example`** (includes `PORT` / `DATABASE_URL` notes). Use **`.env.local`** for local secrets (gitignored).

---

## Folder structure (main)

```
app/                    # App Router routes & layouts
  layout.tsx            # Root layout, metadata, Shell + styled registry
  viewport.ts           # themeColor etc.
  manifest.ts           # PWA web app manifest
  page.tsx              # Home — product grid (fetches /api/products)
  cart/page.tsx         # Cart page
  checkout/page.tsx    # Checkout → POST /api/orders, clearCart, success
  login/page.tsx        # Login shell (imports LoginForm — ensure ./LoginForm exists)
  api/health/db/route.ts # GET — DB connectivity check (Prisma)
  api/products/route.ts  # GET — JSON list of products (Prisma)
  api/orders/route.ts    # POST — create Order + OrderItems; returns orderId

components/             # Reusable UI
  Shell.tsx             # Header + main + PageWrapper + Container + PWA helpers
  Header.tsx            # Logo link, cart link + badge, menu button
  Container.tsx         # max-width 1200px, horizontal padding
  PageWrapper.tsx       # Vertical page spacing
  ProductCard.tsx       # Product tile + “Voeg by mandjie”
  PwaInstallPrompt.tsx  # beforeinstallprompt install bar
  ServiceWorkerRegister.tsx # registers /sw.js in production

lib/
  db.ts                 # Prisma singleton
  styled-registry.tsx   # SSR for styled-components + ThemeProvider + CartProvider
  cart-context.tsx      # React cart state (add/remove, no persistence)

styles/
  theme.ts              # Colour tokens (primary/secondary/accent/background/text)
  global.ts             # GlobalStyles (reset, body, fonts)

types/
  product.ts            # Product type
  cart.ts               # Cart line item type
  styled.d.ts           # DefaultTheme augmentation for styled-components

prisma/
  schema.prisma         # Models + MySQL datasource
  migrations/           # SQL migration history (init + future changes)
  seed.mjs              # Sample products (bread, cheese, meat, dairy, etc.)

public/
  sw.js                 # Service worker (precache + offline fallback)
  offline.html          # Offline fallback page
  logo.png              # Brand + favicon (referenced from layout / header)
  icons/                # Generated PWA icons (192 / 512 / maskable) via Sharp script

scripts/
  generate-pwa-icons.mjs
```

---

## Features (what works today)

### Layout & branding

- **Shell:** sticky **Header**, **Main**, **PageWrapper**, **Container** (mobile-first).
- **Header:** **PlaasMark** home link using **`/logo.png`** (Next `Image`), cart icon with item count badge, menu control (placeholder).
- **Theme:** central **theme** object + **ThemeProvider**; colours include primary green `#2E5E3E`, accent orange, light background `#F5F5F0`, text tokens.

### Home page

- Heading **“Vars produkte”**.
- **Data:** client `fetch("/api/products")` with **loading**, **error**, and **empty** states.
- **Responsive grid:** 2 columns (default), 3 from `768px`, 4 from `1024px`.
- **ProductCard** per row from the database via **`GET /api/products`** (Prisma `product.findMany`).
- **Add to cart:** “Voeg by mandjie” sends `productId`, `name`, `price`, `vendorId`, `vendorName` to **cart context** (merge by `productId`, quantity).

### Cart

- **React context** (`CartProvider` in styled registry): `productId`, `name`, `price`, `quantity`, `vendorId`, `vendorName` (optional on `addToCart` payload; defaults to empty string); **`clearCart()`** empties the mandjie.
- **No API**, **no localStorage** — in-memory only until refresh.
- **`/cart`:** lists lines, line totals, **Verwyder** per product.

### Progressive Web App

- **`app/manifest.ts`:** name / short_name **PlaasMark**, theme/background colours, standalone, icons under **`/icons/`**.
- **`public/sw.js`:** precache + network-first fetch with offline fallback to **`/offline.html`**.
- **Install prompt** (Chromium `beforeinstallprompt`) with dismiss memory in `sessionStorage`.
- **Service worker** registered only in **production** build.

### Database

- **Prisma** schema: **`Customer`** (`id` UUID, `name`, unique `phone`); **`Product`**; **`Order`** (`customerId` → `Customer`, optional `notes`, `createdAt`); **`OrderItem`** (snapshot per line: `productId`, `name`, `price`, `quantity`, `vendorId`, `vendorName`, linked to order, cascade delete).
- **`lib/db.ts`:** shared `PrismaClient` instance.
- **`GET /api/health/db`:** runs a simple query; returns JSON `ok` / error (useful after configuring `DATABASE_URL`).

#### Why there were no migration files before

Earlier setup used **`prisma db push`**, which syncs the schema to the database **without** writing SQL history under `prisma/migrations/`. That is fine for prototyping; **migrations** are better for production and team review.

#### Migrations in this repo

- **`prisma/migrations/20260425120000_init/migration.sql`** — initial create for `Product`, `Customer`, `Order` (with `customerId` FK), `OrderItem` (MySQL / InnoDB).
- **`prisma/migrations/migration_lock.toml`** — provider lock (**`mysql`**).

**New / empty database**

```bash
npx prisma migrate deploy
# or locally during development:
npm run db:migrate
```

**Database you already filled with `db push` (tables already exist)**  
Tell Prisma this migration is already applied so it does not try to `CREATE TABLE` again:

```bash
npx prisma migrate resolve --applied 20260425120000_init
```

After that, use **`npx prisma migrate dev --name <description>`** for future schema changes (that creates new folders under `prisma/migrations/`).

**From here on:** prefer **`migrate dev` / `migrate deploy`** over **`db push`** unless you intentionally want schema-only sync without history.

**If your database still has the old `Order` columns (`customerName`, `customerPhone`)** from an earlier init: either run **`npx prisma migrate reset`** (dev only, wipes data) or align the tables manually, then run **`migrate deploy`** / **`migrate resolve`** as appropriate.

- **`GET /api/products`:** returns a JSON array of products (`id`, `title`, `price` as number, `unit`); `500` + `{ error }` on failure.
- **`POST /api/orders`:** body `{ customer: { name, phone, notes? }, items: CartItem[] }` — looks up **`Customer`** by unique **`phone`**; reuses that row if found, otherwise **`create`**s a new customer; then creates **`Order`** linked with **`customerId`** plus **`OrderItem`** rows (optional `notes` on order; no payment, no auth). Response **`{ orderId }`** or **`{ error }`** with `4xx`/`5xx`.

### Next.js config

- **`compiler.styledComponents: true`**
- **`serverExternalPackages: ['@prisma/client']`**
- **Headers** for **`/sw.js`** cache control

---

## Routes (App Router)

| Path                    | Role                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `/`                     | Home — product grid (API-backed)                                                         |
| `/cart`                 | Cart                                                                                     |
| `/checkout`             | Checkout — contact form, `POST /api/orders`, clear cart, success                         |
| `/login`                | Login entry (Suspense + `LoginForm` import — verify `LoginForm` file is present)         |
| `/manifest.webmanifest` | Generated from `app/manifest.ts`                                                         |
| `/api/health/db`        | Database health                                                                          |
| `/api/products`         | Product list (JSON)                                                                      |
| `/api/orders`           | `POST` — create order from cart items + customer `name` / `phone`; returns `{ orderId }` |

---

## Assets & branding files

- **`public/logo.png`** — header + `metadata.icons` / Apple touch.
- **`public/icons/*.png`** — generated at build (or `npm run icons`) for manifest maskable/any icons.

---

## Not implemented yet (gaps / next steps)

- No auth backend wired; **`/login`** depends on a **`LoginForm`** module in the same folder (add or fix import if the build complains).
- Cart is not persisted and not synced to the server.
- No Tailwind; no `next-pwa` package (manual PWA by design).

---

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local: DATABASE_URL for MySQL (e.g. mysql://root@localhost:3306/plaas-mark)
npx prisma migrate deploy   # or: npm run db:migrate (applies prisma/migrations/*)
# If you previously used db push on this DB:
# npx prisma migrate resolve --applied 20260425120000_init
npm run db:seed      # optional: fills DB with sample products
npm run dev
```

Open **http://localhost:3002** — check **http://localhost:3002/api/health/db** after the database is reachable.

---

_Last updated to match the repository layout and features described above._
