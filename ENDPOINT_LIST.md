Team 4

| Method | Path     | Purpose | Maps to Need |
|---     |---       |---      |---           |
| GET    | /vendors | Return all verified vendor profiles (name, contact details, category/speciality) | Statement 1: Vendor Directory — "Team 5 needs to retrieve verified vendor profiles from Thriftly in order to auto-populate a Supplier record when their business onboards a Thriftly vendor as a stock source." |

| GET    | /vendors/:id | Return a single vendor's full profile by ID | Statement 1: Vendor Directory — used when confirming a specific vendor's details before creating the Supplier record. |

| GET     | /products | Return active product listings (name, category, price, available quantity) | Statement 2: Product Listings — "Team 5 needs to retrieve active product listings from Thriftly in order to reference current pricing and stock when staff create an Invoice or Expense line item." |

| GET     | /products/:id | Return a single product listing's full details by ID | Statement 2: Product Listings — used when staff reference one specific item's price/stock for a line item. |

| POST    | /purchases | Create a purchase confirmation for a completed stock purchase, returns a reference number | Statement 3: Purchase Confirmation — "Team 5 needs to create a purchase confirmation on Thriftly whenever their business completes a stock purchase, in order to generate a matching Expense entry with an accurate total and a reference number." | 