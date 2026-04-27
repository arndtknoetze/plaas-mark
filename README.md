PlaasMark is a simple local marketplace (Next.js + Prisma + MySQL).

## Getting Started

### Prereqs

- Node.js (recommended: LTS)
- MySQL running locally (see `DATABASE_URL` below)

### Configure env

Copy `.env.example` to `.env` and update `DATABASE_URL`.

### Install

```bash
npm install
```

### Database

Apply migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

### Run dev server

```bash
npm run dev
```

App runs on `http://localhost:3002` (see `PORT` in `.env.example`).

## Key routes

- `/`: Home (welcome + top sellers)
- `/shop`: Browse all products (search + store filter)
- `/shop/<slug>--<storeId>`: Store page (stable URL)
- `/register`: Customer/seller registration (OTP verify)
- `/login`: OTP login
- `/profile`: Customer profile or Seller store setup + add products
- `/checkout`: Checkout (requires OTP verification before order)

## OTP (dev)

By default this project can return the OTP in the API response (for local testing only):

```bash
# .env (dev only)
VERIFICATION_OTP_IN_RESPONSE=true
```

Never enable this in production. Hook in an SMS provider in `app/api/verify-phone/request/route.ts`.

## Notes about images

Product/store images can be stored as **data URLs** (simple MVP upload). The DB columns are `LONGTEXT`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
