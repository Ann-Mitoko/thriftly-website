# INTEGRATION_LOG.md: Thriftly (Team 4) consuming PharmaLink (Team 3)

- **Partner base URL:** `https://pharmalink-iap-production.up.railway.app` (paths start with `/api`)
- **Feature built:** "Nearby Health Services" panel on `thriftly.html`: pharmacy list, medicine search, per-pharmacy stock
- **Auth:** None required for GET endpoints. Team 3's README uses a login token for editing their own stock; API key support planned for future iterations.
- **Our server route:** `/health-services/*` (browser -> Thriftly Express server -> Team 3 Railway backend)

---

## First call (outside our app)

| Time | Command | Status | Matched their contract? |
|---|---|---|---|
| `2026-10-14 10:15 EAT` | `curl.exe -i "https://pharmalink-iap-production.up.railway.app/api/health"` | `HTTP/1.1 200 OK` | Yes — returns `{"status":"ok"}` as documented in their OpenAPI spec. |
| `2026-10-14 10:17 EAT` | `curl.exe -s "https://pharmalink-iap-production.up.railway.app/api/pharmacies"` | `HTTP/1.1 200 OK` | Partial match — returns array of pharmacy objects, but missing `id` field in the initial payload (fixed in subsequent release). |

---

## Bugs and surprises

| # | What broke (symptom) | Root cause | Fix | Whose code, who fixed |
|---|---|---|---|---|
| 1 | Our server logged `"partner returned 400 for /api/stock/search"` after a search with only a medicine typed | Team 3's search endpoint requires **BOTH** `medicine` and `location` query parameters. Their initial link sheet omitted this requirement; their README specified it. | Frontend panel updated to enforce both fields before dispatching request; location field rendered as a dropdown populated with Team 3's supported Nairobi areas (e.g., Gikomba, Toi Market, Kilimani, Eastleigh). | Our misreading of an unclear link sheet; fixed on our frontend, documented by Team 3. |
| 2 | Searches returned `[]` ("nothing matched") | Search endpoint only returns items with `status = 'in_stock'` and `quantity > 0`. Team 3's shared Railway database had minimal seeded inventory rows. | Requested Team 3 to populate additional seed records for common medicines (Paracetamol, Amoxicillin). Thriftly UI updated with a explicit empty-state prompt explaining no stock was found in that area. | Data gap on Team 3's side; resolved by Team 3 seeding sample database rows. |
| 3 | Our need "Statement 3: reservations" was missing from the link sheet | Initial link sheet listed only GET endpoints. Their README later documented `POST /reservations` accepting unauthenticated requests with patient initials. | Decision: We adopt Team 3's public `POST /reservations` format (passing `pharmacy_id`, `patient_initials`, `pickup_window_start`, `pickup_window_end`) rather than blocking on custom auth, ensuring immediate pickup reservation capability from Thriftly's market map. | Communication gap; resolved by adopting Team 3's documented endpoint shape. |
| 4 | Team 3's own documents disagree (`CONTRACT_DEVIATIONS` vs README) | `CONTRACT_DEVIATIONS.md` states `GET /inventory` returns `[medicine, quantity, price]`; README shows `[id, medicine, quantity, price, status]`. `distance` behavior differed ("numeric fallback" vs `null`). | Inspected live Railway JSON payload in terminal; confirmed live API returns `id` and `status`. Aligned `healthPanel.js` parsing logic to expect full object keys and notified Team 3 to update `CONTRACT_DEVIATIONS.md`. | Team 3 documentation discrepancy; code handled by Team 4, docs updated by Team 3. |

---

## Tests done on purpose

| Test | What I did | What happened |
|---|---|---|
| **Partner down** | Set `PARTNER_URL=https://invalid-pharmalink-url.railway.app` in `server/.env` and restarted Express server. | Thriftly UI displayed friendly fallback banner: *"Nearby Health Services are temporarily unavailable."* Terminal logged `ENOTFOUND` error without server crash. |
| **Nothing matches** | Searched for non-existent medicine `"Zithromax"` in area `"Kilimani"`. | UI displayed clean response state: *"No results. The request worked, but nothing matched (only medicines currently in stock are listed)."* |
| **Partner back** | Restored correct `PARTNER_URL` in `server/.env` and reloaded page. | Live health service data and pharmacy pins rendered automatically without any frontend or backend code alterations. |
| **Wrong ID** | Dispatched call to `/health-services/inventory?pharmacy_id=99999`. | Confirmed Team 3 backend returns `HTTP 200` with an empty JSON array `[]` (not 404). Thriftly UI displayed *"No stock listed for this pharmacy."* |

---

## As a provider (Team 5 calling us)

| # | What broke | Root cause | Fix | Whose code |
|---|---|---|---|---|
| 1 | Team 5 received `HTTP 401 Unauthorized` on `POST /purchases` | Team 5 dispatched `Authorization: Bearer <token>` without including the mandatory `X-API-Key` header added during Week 9 security enforcement. | Instructed Team 5 to pass both `X-API-Key: <issued-key>` and `Authorization: Bearer thriftly-dev-token-2026` headers on purchase write requests. Updated README quickstart examples. | Team 5 client request header configuration; resolved by Team 5 with Team 4 guidance. |
| 2 | Team 5 reported `HTTP 400 Bad Request` when logging bulk item purchase | Team 5 submitted `totalAmount` calculation that differed from `price * quantity` due to client-side discount rounding. | Team 4 clarified strict server rule (total must equal unit price × quantity exactly). Team 5 adjusted invoice calculator to match line-item total before sending POST body. | Team 5 rounding mismatch; fixed by Team 5. |

---

## Collaboration evidence

- **2026-10-12:** DMed Team 3 lead regarding missing `id` primary key in `GET /pharmacies` output; Team 3 deployed update to Railway backend within 2 hours.
- **2026-10-14:** Notified Team 3 that `GET /stock-search` returned 400 when missing `location`; agreed to mandate both `medicine` and `location` inputs on Thriftly frontend.
- **2026-10-16:** Issued unique API key (`thriftly-team5-key-8f2a`) to Team 5 for BillingSys integration testing.
- **2026-10-18:** Verified end-to-end flow with Team 5: BillingSys successfully onboarded Thriftly vendors (`GET /vendors`) and logged confirmed stock purchases (`POST /purchases`).