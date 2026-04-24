# PlaasMark — project overview

This document summarises the **PlaasMark** web app as it exists in the repository today: stack, structure, features, and how to run it.

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router, **not** Pages Router) |
| UI | **styled-components** (no Tailwind) |
| Language | **TypeScript** (`.tsx` / `.ts`) |
| React | **19** |
| Database ORM | **Prisma** with **PostgreSQL** by default (`DATABASE_URL`) |
| PWA | Manual **service worker** (`public/sw.js`) + `app/manifest.ts` (not `next-pwa`, for Turbopack compatibility) |

---

## Scripts & port

- **Development:** `npm run dev` → **http://localhost:3002** (`next dev -p 3002`)
- **Production:** `npm run build` then `npm run start` → same port **3002**
- **Lint:** `npm run lint`
- **PWA icons:** `npm run icons` (runs `scripts/generate-pwa-icons.mjs` before `build` as well)
- **Database:** `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:studio`
- **Postinstall:** `prisma generate` (client after `npm install`)

Environment template: **`.env.example`** (includes `PORT` / `DATABASE_URL` notes). Use **`.env.local`** for local secrets (gitignored).

---

## Folder structure (main)

```
app/                    # App Router routes & layouts
  layout.tsx            # Root layout, metadata, Shell + styled registry
  viewport.ts           # themeColor etc.
  manifest.ts           # PWA web app manifest
  page.tsx              # Home — product grid (mock data)
  cart/page.tsx         # Cart page
  login/page.tsx        # Login shell (imports LoginForm — ensure ./LoginForm exists)
  api/health/db/route.ts # GET — DB connectivity check (Prisma)

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
  mock-products.ts      # Hardcoded products for the home grid

styles/
  theme.ts              # Colour tokens (primary/secondary/accent/background/text)
  global.ts             # GlobalStyles (reset, body, fonts)

types/
  product.ts            # Product type
  cart.ts               # Cart line item type
  styled.d.ts           # DefaultTheme augmentation for styled-components

prisma/
  schema.prisma         # Product model + PostgreSQL datasource

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
- **Responsive grid:** 2 columns (default), 3 from `768px`, 4 from `1024px`.
- **ProductCard** per item; data from **`lib/mock-products.ts`** (not the database yet).
- **Add to cart:** “Voeg by mandjie” uses **cart context** (merge by `productId`, quantity).

### Cart

- **React context** (`CartProvider` in styled registry): `productId`, `name`, `price`, `quantity`.
- **No API**, **no localStorage** — in-memory only until refresh.
- **`/cart`:** lists lines, line totals, **Verwyder** per product.

### Progressive Web App

- **`app/manifest.ts`:** name / short_name **PlaasMark**, theme/background colours, standalone, icons under **`/icons/`**.
- **`public/sw.js`:** precache + network-first fetch with offline fallback to **`/offline.html`**.
- **Install prompt** (Chromium `beforeinstallprompt`) with dismiss memory in `sessionStorage`.
- **Service worker** registered only in **production** build.

### Database

- **Prisma** schema: **`Product`** model (`id`, `title`, `price`, `unit`, timestamps).
- **`lib/db.ts`:** shared `PrismaClient` instance.
- **`GET /api/health/db`:** runs a simple query; returns JSON `ok` / error (useful after configuring `DATABASE_URL` and running `prisma db push` or migrations).

### Next.js config

- **`compiler.styledComponents: true`**
- **`serverExternalPackages: ['@prisma/client']`**
- **Headers** for **`/sw.js`** cache control

---

## Routes (App Router)

| Path | Role |
|------|------|
| `/` | Home — product grid (mock) |
| `/cart` | Cart |
| `/login` | Login entry (Suspense + `LoginForm` import — verify `LoginForm` file is present) |
| `/manifest.webmanifest` | Generated from `app/manifest.ts` |
| `/api/health/db` | Database health |

---

## Assets & branding files

- **`public/logo.png`** — header + `metadata.icons` / Apple touch.
- **`public/icons/*.png`** — generated at build (or `npm run icons`) for manifest maskable/any icons.

---

## Not implemented yet (gaps / next steps)

- Products still come from **`mock-products`**, not **`prisma.product`**.
- No auth backend wired; **`/login`** depends on a **`LoginForm`** module in the same folder (add or fix import if the build complains).
- Cart is not persisted and not synced to the server.
- No Tailwind; no `next-pwa` package (manual PWA by design).

---

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local: DATABASE_URL for your Postgres (e.g. plaas-mark database)
npx prisma db push   # or: npm run db:migrate
npm run dev
```

Open **http://localhost:3002** — check **http://localhost:3002/api/health/db** after the database is reachable.

---

*Last updated to match the repository layout and features described above.*
