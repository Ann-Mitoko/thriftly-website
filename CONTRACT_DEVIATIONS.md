CONTRACT_DEVIATIONS.md

1. Path parameters implemented as query strings, not clean REST paths

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

openapi.yaml's servers.url is still a placeholder (api.thriftly.example.com), and the PHP
endpoints don't yet send CORS headers. Rather than spend this week's time wiring up a router and
CORS just to make the Swagger UI button work, each endpoint was tested directly in the browser
and its JSON response compared field-by-field against the contract's schema (field names, types,
presence of required fields, absence of extra fields, and correct status codes for both success
and not-found cases). All four GET endpoints matched their contract schema exactly on this pass —
no drift found.

No deviations found in: field naming/casing, data types, or status code behavior for the
implemented endpoints — those all matched the contract as written.



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
