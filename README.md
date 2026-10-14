# Thriftly API

Thriftly is a Nairobi marketplace for second-hand clothing sold by verified stall owners at Gikomba, Toi Market and other markets. This API lets another application **look up Thriftly's verified vendors and their product listings**, and **record a confirmed stock purchase** against a product. It was built for the BillingSys billing system, but any app that needs vendor/product data or wants to log a purchase can use it.

- **Base URL (local):** `http://localhost:5000`
- **Format:** JSON requests and responses
- **Full reference:** open [`docs/index.html`](docs/index.html) in a browser (generated from [`openapi.yaml`](openapi.yaml))

---

## Quickstart (60 seconds)

Once the API is running (see [Run it locally](#run-it-locally)), paste this into a terminal:

```bash
curl http://localhost:5000/vendors/5
```

You should get back:

```json
{"id":5,"name":"Suit Up Thrift","category":"Bulk","market":"Gikomba Market","description":"Wholesale suits, blazers and dress shirts for resellers stocking office and event wear. Minimum order applies.","phone":"+254701234567","email":"suitup@example.com","verified":true}
```

If you see that, everything works. If you get `Failed to connect` or `Connection refused`, the server isn't running yet — go to [Run it locally](#run-it-locally).

---

## Authentication

| Endpoint type | Token needed? |
|---|---|
| `GET` endpoints (vendors, products) | **No** — public, read-only |
| `POST /purchases` and `GET /purchases` | **Yes** |

For `/purchases`, send this header on every request:

```
Authorization: Bearer thriftly-dev-token-2026
```

> This is a **placeholder shared token**, not real authentication. Real login and per-user tokens are not built yet. Missing or wrong token → `401`.

---

## Endpoints at a glance

| Method | Path | What it does | Status |
|---|---|---|---|
| GET | `/vendors` | List all verified vendors | ✅ Working |
| GET | `/vendors/{id}` | One vendor by ID | ✅ Working |
| GET | `/products` | List products (optional filters) | ✅ Working |
| GET | `/products/{id}` | One product by ID | ✅ Working |
| POST | `/purchases` | Record a confirmed purchase | ✅ Working |
| GET | `/purchases` | Purchase history (optional filters) | ✅ Working |
| PUT, DELETE | `/vendors/{id}`, `/products/{id}` | Update / delete | ⏳ Planned — **not built** |
| GET | `/purchases/{id}` | Look up a past purchase | ⏳ Planned — **not built** |

The ⏳ endpoints appear in `openapi.yaml` and the docs page but are **not implemented**. Calling them returns a plain `404 Not Found` (an HTML page, not the JSON error format below).

---

## Examples

### List all verified vendors

```bash
curl http://localhost:5000/vendors
```

Returns an array of all verified vendors, sorted by name. First item shown:

```json
[
  {
    "id": 2,
    "name": "Fresh Threads KE",
    "category": "Streetwear",
    "market": "Gikomba Market",
    "description": "Streetwear and urban fashion from global thrift hauls. Jordans, hoodies, cargo pants â€” fresh drops every weekend.",
    "phone": "+254798001234",
    "email": "freshthreads@example.com",
    "verified": true
  }
]
```

`category` is one of `Vintage`, `Streetwear`, `Kids`, `Accessories`, `Bulk`.

`description` says what the vendor specialises in. There is **no street address**: vendors trade from market stalls, so `market` is the location Thriftly has.

### Get one vendor

```bash
curl http://localhost:5000/vendors/5
```

→ `200 OK`

```json
{"id":5,"name":"Suit Up Thrift","category":"Bulk","market":"Gikomba Market","description":"Wholesale suits, blazers and dress shirts for resellers stocking office and event wear. Minimum order applies.","phone":"+254701234567","email":"suitup@example.com","verified":true}
```

### List products

```bash
curl "http://localhost:5000/products?category=Kids"
```

Optional filters: `category` (same values as above) and `vendorId` (integer). `brand` is `null` for unbranded items. → `200 OK`

```json
[
  {"id":5,"vendorId":3,"name":"School Uniform Set, Size 8","category":"Kids","brand":null,"price":350,"currency":"KES","quantityAvailable":6},
  {"id":6,"vendorId":3,"name":"Toddler Play Romper","category":"Kids","brand":null,"price":200,"currency":"KES","quantityAvailable":10}
]
```

### Get one product

```bash
curl http://localhost:5000/products/9
```

→ `200 OK`

```json
{"id":9,"vendorId":5,"name":"Charcoal Blazer, Size 42","category":"Bulk","brand":null,"price":1800,"currency":"KES","quantityAvailable":12}
```

### Record a purchase

**macOS / Linux / Git Bash:**

```bash
curl -X POST http://localhost:5000/purchases \
  -H "Authorization: Bearer thriftly-dev-token-2026" \
  -H "Content-Type: application/json" \
  -d '{"vendorId":5,"productId":9,"quantity":1,"totalAmount":1800,"currency":"KES"}'
```

**Windows (Command Prompt or PowerShell):**

```
curl.exe -X POST http://localhost:5000/purchases -H "Authorization: Bearer thriftly-dev-token-2026" -H "Content-Type: application/json" -d "{\"vendorId\":5,\"productId\":9,\"quantity\":1,\"totalAmount\":1800,\"currency\":\"KES\"}"
```

→ `201 Created`

```json
{"id":"1","referenceNumber":"THR-PC-E46C3697","vendorId":5,"productId":9,"quantity":1,"totalAmount":1800,"currency":"KES","status":"confirmed","createdAt":"2026-10-12T06:30:53.559Z"}
```

Your `referenceNumber`, `id` and `createdAt` will differ. Request body fields (all required):

| Field | Type | Rule |
|---|---|---|
| `vendorId` | integer | Must be an existing vendor |
| `productId` | integer | Must be an existing product **belonging to that vendor** |
| `quantity` | integer | At least 1, and no more than the product's `quantityAvailable` |
| `totalAmount` | number | Greater than 0 |
| `currency` | string | Non-empty, e.g. `"KES"` |

> **A purchase changes data.** Each successful call reduces that product's `quantityAvailable` by `quantity`. The Charcoal Blazer starts with 12, so the example above works 12 times before it's out of stock (then you'll get a `400`). To reset the data, see [Reset the database](#reset-the-database).

### List purchase history

```bash
curl http://localhost:5000/purchases -H "Authorization: Bearer thriftly-dev-token-2026"
```

Returns every recorded purchase, newest first. Each record includes the product's current `productName` and `brand` (`null` if unbranded) and a `unitPrice` (`totalAmount` ÷ `quantity`). → `200 OK`

```json
[
  {
    "id": "2",
    "referenceNumber": "THR-PC-5517FA9B",
    "vendorId": 1,
    "productId": 1,
    "productName": "Denim Jacket, Size M",
    "brand": "Levi's",
    "quantity": 2,
    "unitPrice": 750,
    "totalAmount": 1500,
    "currency": "KES",
    "status": "confirmed",
    "createdAt": "2026-10-14T19:08:16.000Z"
  },
  {
    "id": "1",
    "referenceNumber": "THR-PC-6CB6384E",
    "vendorId": 5,
    "productId": 9,
    "productName": "Charcoal Blazer, Size 42",
    "brand": null,
    "quantity": 1,
    "unitPrice": 1800,
    "totalAmount": 1800,
    "currency": "KES",
    "status": "confirmed",
    "createdAt": "2026-10-14T19:08:16.000Z"
  }
]
```

`id`, `referenceNumber` and `createdAt` will differ on your machine. Optional filters, which can be combined:

| Query parameter | Type | Meaning |
|---|---|---|
| `vendorId` | integer | Only purchases from this vendor |
| `productId` | integer | Only purchases of this product |
| `from` | date or date-time | Only purchases at or after this moment, e.g. `2026-10-01` |
| `to` | date or date-time | Only purchases at or before this moment |

Example: `curl "http://localhost:5000/purchases?vendorId=5" -H "Authorization: Bearer thriftly-dev-token-2026"`. No matches gives `200` with an empty array `[]`. A non-numeric `vendorId` or an unreadable date gives `400`.

---

## Errors

Every error from the working endpoints has the same shape:

```json
{ "error": "not_found", "message": "No vendor found with the given id" }
```

`error` is a stable code you can branch on; `message` is human-readable text.

| Status | `error` | When it happens | Example `message` |
|---|---|---|---|
| 400 | `invalid_request` | Missing field, wrong type, or quantity above stock (`POST /purchases`); bad filter value (`GET /purchases`) | `totalAmount is required` |
| 401 | `unauthorized` | Missing or wrong token (any `/purchases` request) | `Bearer token missing or invalid` |
| 404 | `not_found` | ID doesn't exist | `No vendor found with the given id` |
| 405 | `method_not_allowed` | Wrong HTTP method on `/purchases` | `Only POST is supported on this endpoint` |
| 500 | `server_error` | Something broke on our side (e.g. database down) | `Failed to fetch vendors` |

Real failing examples:

```bash
curl -i http://localhost:5000/vendors/9999
```
```
HTTP/1.1 404 Not Found
{"error":"not_found","message":"No vendor found with the given id"}
```

```bash
# Same purchase request, but with "totalAmount" left out
HTTP/1.1 400 Bad Request
{"error":"invalid_request","message":"totalAmount is required"}
```

```bash
# Quantity above what is in stock
HTTP/1.1 400 Bad Request
{"error":"invalid_request","message":"quantity exceeds available stock"}
```

```bash
# POST /purchases with no Authorization header
HTTP/1.1 401 Unauthorized
{"error":"unauthorized","message":"Bearer token missing or invalid"}
```

---

## Run it locally

Assumes a completely clean machine.

**You need:** [Node.js](https://nodejs.org) 18 or newer, and MySQL or MariaDB running locally (XAMPP's MySQL works — start it from the XAMPP control panel).

**1. Get the code**

```bash
git clone <this-repo-url>
cd <repo-folder>
```

**2. Create the database** (creates `thriftly_db` with 6 vendors and 10 products)

```bash
mysql -u root < thriftly_schema.sql
```

If your MySQL root user has a password, use `mysql -u root -p < thriftly_schema.sql`. On XAMPP/Windows, run this from XAMPP's **Shell** button if `mysql` isn't recognised in a normal terminal.

**3. Install and configure the server**

```bash
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Open `server/.env`. If your MySQL root user has a password, put it after `DB_PASSWORD=`. Otherwise leave it empty.

**4. Start the API**

```bash
npm start
```

You should see `Server running on http://localhost:5000` (a dotenv tip line above it is normal). Leave this terminal open, then run the [Quickstart](#quickstart-60-seconds) command in a second terminal.

### Reset the database

Purchases use up stock. To restore the original data:

```bash
mysql -u root -e "DROP DATABASE IF EXISTS thriftly_db;"
mysql -u root < thriftly_schema.sql
```

### Troubleshooting

| Problem | Fix |
|---|---|
| `Access denied for user 'root'` in the server terminal | Your MySQL root user has a password (or uses socket login). Set `DB_PASSWORD` in `server/.env`, or create a user with a password and set `DB_USER` too |
| `ECONNREFUSED` | MySQL isn't running — start it (XAMPP control panel) |
| `Unknown database 'thriftly_db'` | Step 2 wasn't run, or `DB_NAME` in `.env` isn't `thriftly_db` |
| `500 server_error` on every request | Same causes as above — check the server terminal for the real error message |
| `Port 5000 already in use` | Change `PORT` in `server/.env` and use that port in the URLs |
