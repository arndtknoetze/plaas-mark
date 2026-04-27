# PlaasMark — Data models (Prisma)

This document summarizes the **current database models** as defined in `prisma/schema.prisma`, plus the important relationships and how the app uses them.

## Core marketplace

### `Customer`

- **Purpose**: A buyer who places orders.
- **Key fields**
  - `id`: `uuid`
  - `name`: string
  - `phone`: string (**unique**)
- **Relations**
  - `orders`: `Order[]` (1 customer → many orders)

### `Seller`

- **Purpose**: A person/business who can manage one or more stores.
- **Key fields**
  - `id`: `cuid`
  - `name`: string
  - `phone`: string (**unique**) — used as the current “simple auth identity”
  - `brandName`: string (legacy high-level brand name; first store is created from this)
  - `brandColor`: hex string (default `#2E5E3E`)
  - `logoUrl`: `LongText?` (supports **data URLs**)
  - `createdAt`, `updatedAt`
- **Relations**
  - `stores`: `Store[]` (1 seller → many stores)

### `Store`

- **Purpose**: A “shop” under a seller. Sellers can have multiple stores.
- **Key fields**
  - `id`: `cuid`
  - `sellerId`: FK → `Seller.id`
  - `name`: string (display name)
  - `slug`: string (used in routes)
  - `isActive`: boolean (default `false`)
  - `brandColor`: hex string
  - `logoUrl`: `LongText?` (supports data URLs)
  - `addressText`: text (pickup/delivery address, free-form)
  - `email`, `whatsapp`, `instagram`, `facebook`, `website`: strings (optional)
  - `hoursText`: text (free-form operating hours)
  - `createdAt`, `updatedAt`
- **Indexes / constraints**
  - `@@unique([sellerId, slug])` (slug must be unique per seller)
  - `@@index([sellerId])`, `@@index([slug])`
- **Routing**
  - Store pages use **stable URLs**: `/shop/<slug>--<storeId>`

### `Product`

- **Purpose**: A sellable item shown on `/shop`.
- **Key fields**
  - `id`: `cuid`
  - `title`: string
  - `price`: `Decimal(10,2)`
  - `unit`: string? (e.g. “per kg”, “per loaf”)
  - `vendorId`: string (currently used as **storeId**)
  - `vendorName`: string (store name snapshot for display)
  - `image`: `LongText?` (supports **data URL uploads**)
  - `createdAt`, `updatedAt`
- **Important note**
  - `vendorId/vendorName` are not a Prisma relation yet; they behave like a “denormalized link” to `Store`.

## Ordering

### `Order`

- **Purpose**: A checkout transaction.
- **Key fields**
  - `id`: `cuid`
  - `customerId`: FK → `Customer.id`
  - `notes`: text? (delivery instructions etc.)
  - `createdAt`
- **Relations**
  - `customer`: `Customer`
  - `items`: `OrderItem[]`

### `OrderItem`

- **Purpose**: Line items captured at purchase time.
- **Key fields**
  - `id`: `cuid`
  - `orderId`: FK → `Order.id` (cascade delete)
  - `productId`: string (Product id at time of ordering)
  - `name`, `price`, `quantity`: snapshots
  - `vendorId`, `vendorName`: snapshots (currently storeId/storeName)
- **Indexes**
  - `@@index([orderId])`

## OTP verification (no full auth)

### `PhoneOtpChallenge`

- **Purpose**: Temporary 6-digit OTP challenge per phone.
- **Key fields**
  - `phone`: string
  - `code`: string (6 digits)
  - `expiresAt`: DateTime
  - `createdAt`
- **Notes**
  - When requesting a new OTP, old challenges are deleted for that phone.

### `PhoneVerifyToken`

- **Purpose**: Short-lived token issued after correct OTP; used as a one-time proof for actions.
- **Key fields**
  - `token`: string (**unique**)
  - `phone`: string
  - `expiresAt`: DateTime
  - `createdAt`
- **Usage in app**
  - Used to gate: seller/customer registration, login, and order placement.
  - Consumed (deleted) once used successfully.

## Rate limiting

### `RateLimitBucket`

- **Purpose**: Fixed-window counter buckets (e.g. IP-based limits).
- **Key fields**
  - `scope`: string (e.g. `"orders_post_ip"`)
  - `bucketKey`: string (e.g. IP)
  - `windowId`: string (e.g. UTC minute key)
  - `count`: int
  - `expiresAt`: DateTime
- **Constraints**
  - `@@unique([scope, bucketKey, windowId])`
  - `@@index([expiresAt])`

## Current “session” (client storage, not DB)

### `plaasmark-session` (localStorage)

- **Stored by**: login and registration flows
- **Shape**
  - `{ role: "customer" | "seller", name: string, phone: string }`
- **Used for**
  - Showing/hiding header items
  - Determining seller vs customer profile view
  - Calling seller-only APIs by sending `phone` (MVP, not secure yet)

## Known next-normalization steps (optional future improvements)

- Replace `Product.vendorId/vendorName` with a real relation: `Product.storeId → Store.id`
- Replace “phone in request body” authorization with a real auth layer (session cookies/JWT/etc.)
