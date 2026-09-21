CONTRACT_DEVIATIONS.md

1. Products table added to the database this week

The original vendors table only stored a price_range string per vendor (e.g. "Ksh 150-800"),
with no way to represent individual product listings, prices, or stock counts. A new products
table was added (product_id, vendor_id, name, category_id, price, quantity_available) so that
GET /products and GET /products/{id} return real, meaningful data rather than being dropped
from scope. This directly fulfills the Week 2 needs statement: "Team 5 needs to retrieve active
product listings... to reference current pricing and stock when staff create an Invoice or
Expense line item."

2. currency field is hardcoded, not stored per row

The products table has no currency column, since Thriftly only ever deals in Kenyan shillings.
The API returns "currency": "KES" as a constant rather than a stored value. If Thriftly ever
supports multiple currencies, this becomes a real column at that point — not needed today.

No deviations found in: path structure, field naming/casing, data types, status code behavior,
or verification method. Using Express's built-in routing, GET /vendors/{id} and
GET /products/{id} are implemented as true path parameters (req.params.id), matching the
contract exactly rather than the query-string workaround an earlier attempt on this same
integration required. CORS support (already installed via the cors package) let the contract
be verified directly in Swagger Editor's "Try it out" — each endpoint's live response was
checked against its documented schema in the tool the contract was actually written for, rather
than by manual side-by-side comparison in the browser.