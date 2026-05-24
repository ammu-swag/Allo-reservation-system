# Allo Reservation System

A full-stack inventory reservation system built with Next.js, Prisma, PostgreSQL, and Neon.

This project simulates temporary stock reservations during checkout to prevent overselling in high-concurrency environments.

---

# Features

- Product listing with warehouse inventory
- Real-time available stock tracking
- Reserve inventory during checkout
- Confirm reservation (purchase success)
- Release reservation (cancel/failure)
- Automatic reservation expiry handling
- Concurrency-safe reservation logic
- PostgreSQL database integration
- Responsive frontend with live countdown timer

---

# Tech Stack

- Next.js (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Tailwind CSS
- Axios

---

# API Endpoints

## Products

### GET `/api/products`

Returns all products with warehouse stock information.

---

## Reservations

### POST `/api/reservations`

Creates a reservation.

Request Body:

```json
{
  "inventoryId": "inventory_id",
  "quantity": 1
}
```

Returns:
- 200 on success
- 409 if stock unavailable

---

### GET `/api/reservations/:id`

Fetch reservation details.

---

### POST `/api/reservations/:id/confirm`

Confirms reservation after payment success.

Returns:
- 410 if reservation expired

---

### POST `/api/reservations/:id/release`

Releases reservation and restores stock.

---

# Concurrency Handling

Reservation creation uses Prisma database transactions to ensure inventory consistency under concurrent requests.

Available stock is calculated using:

```ts
availableUnits = totalUnits - reservedUnits
```

During reservation:
- inventory is checked inside a transaction
- reserved units are incremented atomically
- reservation is created only if stock is available

This prevents overselling when multiple users attempt to reserve the last available unit simultaneously.

---

# Reservation Expiry

Reservations automatically expire after 10 minutes.

A lazy cleanup approach is implemented:
- whenever a reservation is fetched
- expired reservations are automatically released
- reserved inventory is restored back to stock

This avoids requiring background workers while still maintaining correct stock availability.

---

# Local Setup

## Install dependencies

```bash
npm install
```

---

## Configure environment variables

Create `.env`

```env
DATABASE_URL=your_neon_database_url
```

---

## Run migrations

```bash
npx prisma migrate dev
```

---

## Seed database

```bash
npm run seed
```

---

## Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Deployment

Frontend deployed on Vercel.

Database hosted on Neon PostgreSQL.

---

# Future Improvements

- Redis distributed locking
- Idempotency keys
- Background worker for reservation expiry
- Authentication
- Multi-item cart reservations
- Improved UI/UX
