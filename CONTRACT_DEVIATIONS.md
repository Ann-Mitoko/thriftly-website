CONTRACT_DEVIATIONS.md

1. Path parameters implemented as query strings, not clean REST paths

SUPERSEDED (Week 8): this described the earlier PHP implementation. The submitted API is the Express
server, which uses true path parameters (/vendors/{id}, /products/{id}) exactly as the contract
promises, so this deviation no longer applies. Kept for the history of how the project got here.

Contract promises GET /vendors/{id} and GET /products/{id}. Since Thriftly's PHP files are served
directly by Apache without URL rewriting configured, these are implemented as
api_vendor_detail.php?id={id} and api_product_detail.php?id={id} instead.

Why the contract didn't hold up: implementing true path-based routing (/vendors/5 instead of
?id=5) requires a front controller or .htaccess rewrite rules, which wasn't part of this week's
scope. The response shape, status codes, and field names are otherwise identical to what the
contract promises — only the URL structure differs.

Fix considered for a future week: add a lightweight router (index.php + .htaccess) so paths match
the contract exactly. Flagged, not yet done.

2. Products table added to the database this week

The original vendors table only stored a price_range string per vendor (e.g. "Ksh 150-800"),
with no way to represent individual product listings, prices, or stock counts. A new products
table was added (product_id, vendor_id, name, category_id, price, quantity_available) so that
GET /products and GET /products/{id} return real, meaningful data rather than being dropped
from scope. This directly fulfills the Week 2 needs statement: "Team 5 needs to retrieve active
product listings... to reference current pricing and stock when staff create an Invoice or
Expense line item."

3. currency field is hardcoded, not stored per row

The products table has no currency column, since Thriftly only ever deals in Kenyan shillings.
The API returns "currency": "KES" as a constant rather than a stored value. If Thriftly ever
supports multiple currencies, this becomes a real column at that point — not needed today.

4. Verification method: manual side-by-side comparison, not Swagger UI "Try it out"

SUPERSEDED (Week 8): this described the PHP implementation. The Express server enables CORS and the
contract's server URL is http://localhost:5000, so endpoints are verified with Swagger Editor's
"Try it out" as intended. Kept for history.

openapi.yaml's servers.url is still a placeholder (api.thriftly.example.com), and the PHP
endpoints don't yet send CORS headers. Rather than spend this week's time wiring up a router and
CORS just to make the Swagger UI button work, each endpoint was tested directly in the browser
and its JSON response compared field-by-field against the contract's schema (field names, types,
presence of required fields, absence of extra fields, and correct status codes for both success
and not-found cases). All four GET endpoints matched their contract schema exactly on this pass —
no drift found.

No deviations found in: field naming/casing, data types, or status code behavior for the
implemented endpoints — those all matched the contract as written.

---

Week 6 additions (POST /purchases)

5. Authentication implemented as a shared token, not real bearer/JWT auth

The contract declares bearerAuth (a JWT-style bearer token) as the security scheme for
POST /purchases. Thriftly has no login/session system built yet, so the actual implementation
checks the Authorization header against a single hardcoded shared secret string, not a real,
issued, verifiable token. This is a stand-in, not the real thing — flagged rather than presented
as done. A real fix requires building actual user authentication first, which is out of this
week's scope.

6. Stock-sufficiency check added, not specified in the contract's schema

PurchaseRequest's schema doesn't mention any relationship between quantity and a product's
available stock. The implementation adds this check anyway: a purchase requesting more than
quantity_available is rejected with 400. This is a reasonable business rule, but it's an addition
beyond what the contract technically promised — noting it so it isn't a surprise if a future
partner integration sends a large quantity expecting only the documented validation (missing
fields, wrong types) to apply.

7. Successful purchases decrement product stock as a side effect

Not part of the documented response shape (PurchaseConfirmation doesn't mention stock), but a
real state change: quantity_available on the referenced product is reduced by quantity after a
successful purchase. This wasn't required by the contract, but was added since a purchase
confirmation that doesn't affect real inventory didn't feel like a genuine write.

8. New endpoints added to openapi.yaml without a corresponding needs statement

PUT /vendors/{id}, DELETE /vendors/{id}, PUT /products/{id}, and DELETE /products/{id} were
added to the contract this week. Unlike every other endpoint in this file, none of these trace
back to a real Week 2 needs statement — Team 5 has not asked for the ability to update or delete
vendor or product data through this API. They are documented in the contract but not yet
implemented, and their inclusion is an honest gap: added speculatively, not from a confirmed
need. GET /purchases/{id} was also added and is considered legitimate (a natural companion to
creating a purchase confirmation), but it is likewise not yet implemented.

---

Week 8 corrections (found by running the Week 8 quickstart against the live API)

These are changes to openapi.yaml made AFTER the contract was sent to Team 5 in Week 4.
Team 5 must be told directly — they built against the earlier version.

9. IDs changed from string to integer

The Week 4 contract typed vendor and product ids as strings with examples like "v_2291" and
"p_5581". The database and every real response use integers (e.g. 5). This was present since
Week 5 and was missed then: the Week 5 check compared field names and presence, not id types.
The contract was updated to type: integer. This is a breaking change for any consumer that sent
string ids — POST /purchases with "vendorId": "v_2291" returns 400. Path ids for /vendors and
/products are now documented as integers; purchase ids remain strings ("1").

10. Category list corrected

The contract's category enum was [Vintage, Streetwear, Formal, Kids, Accessories]. The real
categories are [Vintage, Streetwear, Kids, Accessories, Bulk]. "Formal" never existed, and
"Bulk" (used by Suit Up Thrift) was missing, so a real vendor response violated the contract.

11. Unimplemented ?category and ?market filters removed from GET /vendors

The contract documented these two query parameters but the route ignored them (every request
returned all vendors). No needs statement asked for vendor filtering. They were removed from the
contract rather than built. GET /products?category= and ?vendorId= ARE implemented and unchanged.

12. GET error responses fixed in code (the contract was right)

The contract's Error schema requires both "error" and "message". The GET endpoints returned only
{"error": "..."}. Per the Week 5 rule (fix the code when the contract was reasonable), vendors.js
and products.js now return {"error": "not_found" | "server_error", "message": "..."} to match.

13. Docs now mark unbuilt endpoints as NOT YET IMPLEMENTED

PUT/DELETE on /vendors/{id} and /products/{id}, and GET /purchases/{id}, remain in the contract
(see #8) but are labelled "NOT YET IMPLEMENTED" in the docs site and README so a reader doesn't
try them and fail. Calling them returns Express's default HTML 404, not the JSON error format.

---

Team 5 contract review (their Week 4 questions, answered)

Team 5 reviewed openapi.yaml against what BillingSys actually needs: supplier info (name, address,
email, phone, speciality), product info for their catalog (name, brand, price), and purchase trend
data (brand, quantity, price, name). Unlike entry 8, every change below comes from a confirmed
consumer need. All of them are ADDITIVE: new optional-to-read fields and one new endpoint, so
nothing Team 5 already built against the Week 4 contract breaks.

14. Vendor.description added (answers their "speciality" question)

Thriftly has no separate speciality field, but every vendor has a free-text description that
says what they specialise in (e.g. "Specialises in 80s and 90s women's wear"). It is now returned
as "description" on GET /vendors and GET /vendors/{id}. It is a sentence, not a fixed label.

15. Vendor address NOT added (decision: not provided)

Thriftly stores no street address for vendors. They trade from stalls inside markets (Gikomba
Market, Toi Market, Eastleigh, Kilimani), and the only location data is the market name, which
is already returned as "market". Inventing an address would put false data in Team 5's supplier
records. If Team 5 needs a finer location, the fix is collecting it (for example a stall or
section field in the vendor signup form), which is a data change, not an API change.

16. Product.brand added (nullable)

A nullable brand column was added to products and is returned as "brand" on GET /products and
GET /products/{id}. It is null for unbranded items, which is common in second-hand stock, so
Team 5 must handle null. Existing databases need this one-time change:

    ALTER TABLE products ADD COLUMN brand VARCHAR(100) NULL;

The brand values in thriftly_schema.sql are demo data, not real stock records.

17. GET /purchases added (answers "no read endpoint for purchase data")

Returns purchase history, newest first, with productName, brand, quantity, unitPrice,
totalAmount, currency, status and createdAt. Optional filters: vendorId, productId, from, to.
Things Team 5 should know:
- productName and brand are the product's CURRENT values, not a snapshot from purchase time.
- unitPrice is derived: totalAmount divided by quantity, rounded to 2 decimals.
- It requires the same placeholder bearer token as POST /purchases (see entry 5), so anyone
  holding that shared token can read every purchase. Acceptable for now, not for production.
- There is no pagination; it returns every matching row.

18. Needs documents updated to match

API_NEEDS.md (Team 5 section) and ENDPOINT_LIST.md were updated with the new fields and a
"Purchase History" needs statement, so the new endpoint traces back to a real need.

---

Week 8 fixes found by trying to break POST /purchases and the vendor detail endpoint

Entries 19-21 change behaviour the Week 4 contract was silent about. 20 and 21 are the only ones
that could affect Team 5, so they must be told.

19. Purchases are now atomic and cannot oversell

Before: 15 simultaneous purchases of a product with 3 in stock produced 4 accepted purchases and a
stock level of -1, because stock was checked and then reduced in two separate steps. Now the
product row is locked inside a database transaction, the purchase record and the stock reduction
succeed or fail together, and the same test accepts exactly 3 and leaves stock at 0.

20. totalAmount must equal the product's price x quantity (new 400 case)

Before: the API accepted any total, so a 1800 item could be "bought" with totalAmount 1. Now a
mismatch returns 400 with the expected value in the message, for example
"totalAmount must equal the product price x quantity (expected 1800.00)". AFFECTS TEAM 5: any
request whose total is not exactly price x quantity (for example one that applies a discount) is
now rejected.

21. GET /vendors/{id} returns 404 for vendors that are not verified

Before: the detail endpoint returned vendors still awaiting approval, including their email and
phone, to anyone who guessed the id, while GET /vendors correctly hid them. Now both agree.
AFFECTS TEAM 5: looking up an unverified vendor by id gives 404 instead of a profile with
"verified": false. The "verified" field is therefore always true in responses.
