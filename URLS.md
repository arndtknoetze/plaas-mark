# PlaasMark — URLs / Routes

This document lists the current **page routes** and **API endpoints** in the app.

## Location scope

Most catalogue and store APIs resolve the active **`Location`** from middleware (header **`x-location-slug`**) and the database — see `lib/location.ts`. Client calls from the browser inherit this automatically; document any direct API testing with the correct host/path so the slug resolves.

---

## Pages (App Router)

- **`/`**
  - Home (welcome / top sellers for the current location)
- **`/shop`**
  - Browse products (search + store filter) for the current location
- **`/shop/<slug>--<storeId>`**
  - Store page (stable URL + QR-friendly). Example: `/shop/botha-bakery--ckz123...`
- **`/cart`**
  - Cart
- **`/checkout`**
  - Checkout (OTP verification may be required to place an order, depending on env)
- **`/my-orders`**
  - Customer orders lookup by phone (scoped to current location)
- **`/activity`**
  - Combined activity feed (buyer orders, seller orders, notifications) grouped by Vandag / Gister / Vroeër
- **`/account/orders`**
  - Seller view: orders that include lines for this member’s stores (same location)
- **`/begin-verkoop`**
  - Onboarding flow to start selling
- **`/register`**
  - Registration + OTP verification
- **`/login`**
  - OTP login (or bypass when OTP is disabled in env)
- **`/profile`**
  - Profile; sellers manage stores and products
  - Supports `?store=<storeId>` to focus a specific store after registration
- **`/admin/orders`** _(dev gated)_
  - Latest orders (requires `ADMIN_ROUTES_ENABLED=true`)

---

## API (Route Handlers)

### Config & health

- **`GET /api/config`**
  - Client-readable flags: `{ disablePhoneOtp: boolean }` (from server env)
- **`GET /api/health/db`**
  - Database connectivity check

### Location

- **`GET /api/location`**
  - Current tenant location: `{ id, name, slug }`

### OTP verification

- **`POST /api/verify-phone/request`**
  - Body: `{ phone }`
  - Creates an OTP challenge; in dev, may return `devCode` when `VERIFICATION_OTP_IN_RESPONSE=true`
- **`POST /api/verify-phone/confirm`**
  - Body: `{ phone, code }`
  - Verifies OTP and returns `{ verificationToken }` (single-use)

### Auth (simple)

- **`POST /api/login`**
  - Body: `{ phone, verificationToken }` — or when OTP is disabled: `{ phone }` only
  - Returns `{ ok: true, session: { name, phone } }`
  - Consumes verification token when OTP is enabled

### Registration

- **`POST /api/register/customer`**
  - Body: `{ name, phone, verificationToken? }` (token omitted when OTP disabled)
  - Upserts `Member`
- **`POST /api/register/seller`**
  - Body: `{ name, phone, brandName, brandColor?, logoUrl?, verificationToken? }`
  - Upserts `Member` and creates the **first store in the current location** with **`isActive: false`** (activate from profile/admin as needed). Location cannot be overridden via body.

### Stores

- **`GET /api/stores`**
  - Active public stores in the current location (filters, catalogue scope)
- **`GET /api/stores/my?phone=<phone>`**
  - Member + their stores **in the current location**
- **`POST /api/stores/my`**
  - Body: `{ phone, name }` — creates a new store for the member in the current location (no location fields in body)
- **`GET /api/stores/<storeId>`**
  - Store details (**active** store in current location)
- **`PATCH /api/stores/<storeId>`**
  - Body includes `{ phone, ...fields }` — update store (ownership via member phone)

### Products

- **`GET /api/products`**
  - Products for the location catalogue (includes `locationId` per row from the store)
- **`POST /api/products`**
  - Body: `{ phone, storeId, title, price, unit?, image? }`
  - Creates a product linked to a store owned by the member **in the current location**

### Orders

- **`GET /api/orders?phone=<phone>`**
  - Orders for the member’s phone **in the current location** (includes `status`, line items)
- **`POST /api/orders`**
  - Body: `{ customer: { name, phone, notes? }, items: CartItem[], verificationToken? }`
  - Each item must include `productId`, `name`, `price`, `quantity`, `vendorId`, `vendorName`, **`locationId`** (must match resolved location); single-location cart enforced
  - When OTP is enabled, `verificationToken` is required; when disabled, verification can be skipped
  - Rate limits include max orders per phone per hour and POSTs per IP per minute
- **`PATCH /api/orders/<orderId>`**
  - Body: `{ phone, status }` — **`status`** ∈ `pending | accepted | ready | completed`
  - Seller-only: `phone` must own a store that appears on a line item (`vendorId`) for this order in the current location

### Seller orders (account UI)

- **`GET /api/account/store-orders?phone=<phone>`**
  - Orders that include at least one line for the member’s stores in this location; items filtered to those stores; includes `customerName`, `customerPhone`

### Activity (combined feed)

- **`GET /api/activity?phone=<phone>`**
  - Single timeline: **customer orders** (current location), **seller orders** (lines for this member’s stores in the current location — same rules as store-orders), and **notifications** (all notifications for this member — not location-scoped)
  - Response: `{ activity: ActivityRow[] }` sorted by **`createdAt` descending**
  - Each row has **`type`**: `"customer_order"` | `"seller_order"` | `"notification"` for rendering
  - **`customer_order`** / **`seller_order`**: include nested **`order`** (same shapes as `/api/orders` and `/api/account/store-orders` line items respectively)
  - **`notification`**: includes `notificationType` (DB type: `order_created`, `new_store_order`, …), `title`, `message`, `read`

### Home

- **`GET /api/top-sellers`**
  - Top sellers for the home page in the current location (uses order line `vendorId` as store id)
