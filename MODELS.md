# PlaasMark — Data models (Prisma)

This document summarizes the **current database models** as defined in `prisma/schema.prisma`, plus important relationships and how the app uses them.

## Multi-tenant locations

Each deployment/path can serve a **`Location`** (town/area). Stores, catalogue products, and orders are scoped to a location. Middleware resolves the active location (see `lib/location.ts`) and APIs use it when reading or writing data.

### `Location`

- **Purpose**: Tenant area for catalogue, stores, and orders (`locationId` on `Store` and `Order`).
- **Key fields**
  - `id`: `cuid`
  - `name`: string
  - `slug`: string (**unique**) — used with request routing / `x-location-slug`
  - `createdAt`
- **Relations**
  - `stores`: `Store[]`
  - `orders`: `Order[]`

### `Member`

- **Purpose**: One account per phone — can buy (`Order`) and/or sell (`Store`). Replaces separate “customer” vs “seller” tables.
- **Key fields**
  - `id`: `cuid`
  - `name`: string
  - `phone`: string (**unique**) — used as the current “simple auth identity”
  - `createdAt`
- **Relations**
  - `stores`: `Store[]`
  - `orders`: `Order[]`
  - `notifications`: `Notification[]`

### `Notification`

- **Purpose**: In-app messages for a **member** (orders, store activity, etc.).
- **Key fields**
  - `id`: `cuid`
  - `memberId`: FK → `Member.id` (cascade delete)
  - `type`: string — app-defined; use `lib/notification-types.ts` for known values
  - `title`: string
  - `message`: string (`@db.Text`)
  - `read`: boolean (default `false`)
  - `createdAt`
- **Conventional `type` values** (string column, not a DB enum):
  - `order_created`
  - `order_update`
  - `new_store_order`
- **Indexes**
  - `@@index([memberId])`

### `Store`

- **Purpose**: A shop belonging to a **member** in a **location**.
- **Key fields**
  - `id`: `cuid`
  - `memberId`: FK → `Member.id` (cascade delete)
  - `locationId`: FK → `Location.id`
  - `name`, `slug`: strings (slug unique per member: `@@unique([memberId, slug])`)
  - `isActive`: boolean (default **`true`** in schema; first store from seller registration is created **`false`** until activated)
  - `brandColor`: hex string (default `#2E5E3E`)
  - `logoUrl`: `LongText?` (supports data URLs)
  - `addressText`, `email`, `whatsapp`, `instagram`, `facebook`, `website`, `hoursText`: optional contact / hours fields
  - `createdAt`, `updatedAt`
- **Indexes / constraints**
  - `@@unique([memberId, slug])`
  - `@@index([memberId])`, `@@index([locationId])`, `@@index([slug])`
- **Routing**
  - Store pages use stable URLs: `/shop/<slug>--<storeId>`

### `Product`

- **Purpose**: A sellable item in the location catalogue.
- **Key fields**
  - `id`: `cuid`
  - `title`: string
  - `price`: `Decimal(10,2)`
  - `unit`: string? (e.g. “per kg”)
  - `vendorId`: FK → **`Store.id`** (`vendor*` naming kept for historical/API compatibility)
  - `vendorName`: string (store name snapshot for display)
  - `image`: `LongText?` (data URL uploads supported)
  - `createdAt`, `updatedAt`
- **Relations**
  - `store`: `Store` via `vendorId`

## Ordering

### `Order`

- **Purpose**: Checkout transaction for the **member** who placed it, in one **location**.
- **Key fields**
  - `id`: `cuid`
  - `memberId`: FK → `Member.id` (cascade delete)
  - `locationId`: FK → `Location.id`
  - `status`: string — **`pending` | `accepted` | `ready` | `completed`** (see `lib/order-status.ts`; DB default `pending`)
  - `notes`: string? (delivery instructions, etc.)
  - `createdAt`
- **Relations**
  - `member`: `Member`
  - `location`: `Location`
  - `items`: `OrderItem[]`
- **Indexes**
  - `@@index([memberId])`, `@@index([locationId])`

### `OrderItem`

- **Purpose**: Line items captured at purchase time (snapshots).
- **Key fields**
  - `id`: `cuid`
  - `orderId`: FK → `Order.id` (cascade delete)
  - `productId`: string (product id at order time)
  - `name`, `price`, `quantity`: snapshots
  - `vendorId`, `vendorName`: snapshots (**store id / store name** at order time)
- **Indexes**
  - `@@index([orderId])`

## OTP verification (no full auth)

### `PhoneOtpChallenge`

- **Purpose**: Temporary 6-digit OTP challenge per phone.
- **Key fields**
  - `id`: `cuid`
  - `phone`: string
  - `code`: string
  - `expiresAt`: DateTime
  - `createdAt`
- **Notes**
  - New requests for the same phone replace prior challenges (see verify-phone API).

### `PhoneVerifyToken`

- **Purpose**: Short-lived token after correct OTP; one-time proof for sensitive actions (when OTP is enabled).
- **Key fields**
  - `id`: `cuid`
  - `token`: string (**unique**)
  - `phone`: string
  - `expiresAt`: DateTime
  - `createdAt`
- **Usage**
  - Registration, login, and order placement consume a valid token (or use env bypass — see `isPhoneOtpDisabled()`).

## Rate limiting

### `RateLimitBucket`

- **Purpose**: Fixed-window counters (e.g. IP-based limits on `POST /api/orders`).
- **Key fields**
  - `id`: `cuid`
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
  - `{ name: string, phone: string }`
- **Used for**
  - Header / UI state
  - Calling phone-identified APIs (MVP; not a secure session mechanism)

## Optional future improvements

- Replace “phone in body/query” authorization with real sessions (cookies/JWT, etc.).
- Further normalize naming (`vendorId` → `storeId` in API payloads) if you want stricter consistency.
