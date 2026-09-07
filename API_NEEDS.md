Team 4:

We consume from team 3:

Invented integration feature: Thriftly's Nairobi market map (which already shows market and vendor locations, per our Lean Canvas) gets a "Nearby Health Services" layer. A shopper browsing the map can see nearby partner pharmacies, check basic medicine availability, and reserve an item for pickup near the market. This is the feature that gives the Pharmalink integration an actual reason to exist inside Thriftly.

Statement 1: Medicine Inventory

Thriftly needs to retrieve available medicine names, quantities, prices, and stock status from Pharmalink in order to show basic availability on the Nearby Health Services layer of the market map, before a shopper decides to visit a partner pharmacy.

Freshness: Near real-time, with updates within minutes, to avoid showing medicines that are no longer in stock.
Volume: Low to moderate, as the layer is only queried when a shopper opens the Nearby Health Services view, not on every market map load.
Authentication: None required; public read-only access is sufficient.

Statement 2: Pharmacy Locations

Thriftly needs to retrieve pharmacy location data from Pharmalink in order to plot partner pharmacy pins on the Nearby Health Services layer and provide directions from a shopper's position in the market.

Freshness: Static/low frequency, as pharmacy locations change infrequently.
Volume: Moderate, primarily accessed when a shopper opens the Nearby Health Services layer on the map.
Authentication: None required; public read-only access is sufficient.

Statement 3: Medicine Reservations

Thriftly needs to create medicine reservations containing the required patient details in order to let a shopper reserve an item for pickup at a partner pharmacy directly from the Nearby Health Services layer, without leaving the Thriftly app.

Freshness: Real-time, since the reservation requires an immediate transactional response and confirmation.
Volume: Low, as the endpoint is accessed only when a shopper actually places a reservation, which is expected to be an occasional action, not a core Thriftly workflow.
Authentication: Required, using an authenticated user token to protect patient details and reservation transactions.

Audit Alignment Gap

Mapped Resources: Medicines, Pharmacy Locations, and Reservations map to Pharmalink's existing domain model and support the Nearby Health Services layer — a secondary feature added specifically to give this integration a real place inside Thriftly.

Identified Gap: Pharmalink's internal stock-management operations (pharmacy authentication, adding stock, updating inventory, deleting medicines) belong to Pharmalink's own administrative portal and are out of scope for Thriftly, which only needs the read-only browsing resources and the authenticated reservation endpoint.

Reflection

Thriftly is a secondhand clothing marketplace, so a health-data integration has no natural fit with our core workflows. Since the assignment requires a working connection between our two apps regardless of real-world overlap, we defined a small, explicit feature — a Nearby Health Services layer on our existing market map — so the Pharmalink integration has an actual screen and user action behind it, rather than needs statements floating with no connection to what Thriftly does. This is a deliberately thin feature, scoped only to make the integration coherent, not a claim that this is a real product priority for Thriftly.


We are consumed by team 5:

Note: Team 5's app, BillingSys_React, is a business billing/invoicing management system (resources: customers, products, suppliers, invoices, expenses, staff users) — not a marketplace-browsing app. The statements below are scoped to what a billing system would realistically pull from Thriftly, rather than assuming they need vendor-browsing or review features.

Statement 1: Vendor Directory

Team 5 needs to retrieve verified vendor profiles (name, contact details, category/speciality) from Thriftly in order to auto-populate a Supplier record when their business onboards a Thriftly vendor as a stock source.

Freshness: Low frequency, as vendor profile details change infrequently.
Volume: Low, accessed only when staff onboard a new supplier.
Authentication: None required for reading public vendor profile fields.

Statement 2: Product Listings

Team 5 needs to retrieve active product listings (name, category, price, available quantity) from Thriftly in order to reference current pricing and stock when staff create an Invoice or Expense line item for goods sourced from a Thriftly vendor.

Freshness: Near real-time, with updates within minutes, since price and stock affect what staff enter into a financial record.
Volume: Moderate, accessed whenever staff build a new invoice or expense tied to Thriftly stock.
Authentication: None required; public read-only access is sufficient.

Statement 3: Purchase Confirmation

Team 5 needs to create a purchase confirmation on Thriftly whenever their business completes a stock purchase from a Thriftly vendor, in order to generate a matching Expense entry with an accurate total and a reference number.

Freshness: Real-time, since the confirmation requires an immediate transactional response.
Volume: Low, accessed only when a purchase is finalized.
Authentication: Required, using an authenticated business account token to protect transaction data.

Audit Alignment Gap

Mapped Resources: Vendor profile fields and product listing fields map directly to Thriftly's existing vendor and listing resources, and support Team 5's supplier-onboarding and expense-recording workflows.

Identified Gap: Team 5's original request (verified vendors filtered by category for seller listings, market locations for a stall map, and buyer/vendor reviews) matched a marketplace-browsing app, not their actual billing system — their schema has no screen for browsing sellers or leaving reviews. That request has been dropped. Access is now limited to the read-only vendor and product resources needed to populate their own Supplier/Product records, plus the one authenticated write endpoint needed to log a completed purchase.

Reflection

Our first draft of this section assumed Team 5 needed the same kind of browsing and review features a marketplace consumer would want, without confirming that against their actual app. Reviewing their TEAM_CHARTER.md and database schema showed BillingSys_React is an internal billing tool with no vendor-browsing or review surface — its real need is pulling in vendor and product data to populate its own supplier and expense records, plus confirming purchases. This is a direct example of the Week 2 trap: designing from an assumption instead of the partner's actual screen.