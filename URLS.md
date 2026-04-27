# PlaasMark — URLs / Routes

This document lists the current **page routes** and **API endpoints** in the app.

## Pages (App Router)

- **`/`**
  - Home (welcome / welcome back hero + top sellers)
- **`/shop`**
  - Browse all products (search + store filter)
- **`/shop/<slug>--<storeId>`**
  - Store page (stable URL + QR-friendly). Example: `/shop/botha-bakery--ckz123...`
- **`/cart`**
  - Cart
- **`/checkout`**
  - Checkout (OTP verification required to place order)
- **`/my-orders`**
  - “My orders” lookup by phone
- **`/register`**
  - Registration (customer or seller + OTP verification)
- **`/login`**
  - OTP login
- **`/profile`**
  - Profile
  - For sellers: store setup + add products
  - Supports `?store=<storeId>` to focus a specific store after registration
- **`/admin/orders`** _(dev gated)_
  - Latest orders (requires `ADMIN_ROUTES_ENABLED=true`)

## API (Route Handlers)

### Health

- **`GET /api/health/db`**
  - DB connectivity check

### OTP verification

- **`POST /api/verify-phone/request`**
  - Body: `{ phone }`
  - Creates an OTP challenge and (in dev) can return `devCode` when `VERIFICATION_OTP_IN_RESPONSE=true`
- **`POST /api/verify-phone/confirm`**
  - Body: `{ phone, code }`
  - Verifies OTP and returns `{ verificationToken }` (single-use)

### Auth (simple)

- **`POST /api/login`**
  - Body: `{ phone, verificationToken }`
  - Consumes token and returns a simple session payload `{ role, name, phone }`

### Registration

- **`POST /api/register/customer`**
  - Body: `{ name, phone, verificationToken }`
- **`POST /api/register/seller`**
  - Body: `{ name, phone, brandName, brandColor?, logoUrl?, verificationToken }`
  - Creates/upserts Seller and creates the first Store (inactive by default)

### Stores

- **`GET /api/stores/my?phone=<phone>`**
  - Returns seller + their stores (used by `/profile`)
- **`POST /api/stores/my`**
  - Body: `{ phone, name }`
  - Creates a new store for the seller
- **`GET /api/stores/<storeId>`**
  - Returns store details
- **`PATCH /api/stores/<storeId>`**
  - Body includes `{ phone, ...fields }`
  - Updates store (simple ownership check by seller phone)

### Products

- **`GET /api/products`**
  - Returns all products
- **`POST /api/products`**
  - Body: `{ phone, storeId, title, price, unit?, image? }`
  - Creates a product for a store owned by the seller

### Orders

- **`GET /api/orders?phone=<phone>`**
  - Returns orders for customer phone
- **`POST /api/orders`**
  - Body: `{ verificationToken, customer: { name, phone, notes? }, items: [...] }`
  - Places an order
  - Rate limits:
    - Max **5 orders per phone per hour**
    - Max **10 POSTs per IP per minute**

### Home

- **`GET /api/top-sellers`**
  - Returns top sellers for the home page (uses `OrderItem.vendorId` as storeId when available)
