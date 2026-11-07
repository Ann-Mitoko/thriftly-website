# Security Audit

We put this audit together to check what data our API exposes, make sure our authentication works properly, and confirm our rate limits are doing their job. Here is what we looked at and what we fixed.



## 1. Authentication Check

- **What we checked:** We verified that every single endpoint (except the interactive docs) requires a valid API key sent via the `X-API-Key` header, and that write routes like `POST /purchases` also require a valid bearer token in the `Authorization` header.
- **What we found:** 
  - Requests sent without a key or with an invalid key are immediately caught by our middleware and blocked with a `401 Unauthorized` response before hitting any route handlers.
  - The middleware properly checks keys loaded securely via environment variables (`process.env.API_KEYS`) rather than hardcoding them in source control.
- **Fixes applied:** Ensured the authentication middleware sits right at the top of the app stack before any routes are processed.



## 2. Rate Limiting Check

- **What we checked:** We wanted to make sure a single client or runaway script couldn't flood our API with thousands of requests.
- **What we chose:** We set a limit of **60 requests per minute** per API key .
- **Why we chose it:** 60 requests a minute is plenty for a normal billing system (like Team 5's app) to sync products, fetch vendor lists, and log purchases without hitting bottlenecks, but it's restrictive enough to block automated scraping or infinite loops.
- **What we found:** When a client goes over 60 requests, our in-memory rate limiter successfully stops them, returning a `429 Too Many Requests` status code along with a `Retry-After` header and a JSON body.



## 3. Data Exposure & Sensitive Fields Check

- **What we checked:** We reviewed all our JSON response objects to see if we were accidentally leaking internal database rows, password hashes, internal flags, or sensitive personal data.
- **What we found:** 
  - Our database tables include fields like vendor email addresses and phone numbers, which are required by Team 5 to build functional supplier records. However, we do **not** store or return any user passwords, password hashes, or session tokens in our vendor or product endpoints.
  - Raw database objects are never returned directly. Instead, we explicitly map and return only the specific fields required by our API contract.
- **Fixes applied:** Kept our endpoint response schemas tightly scoped to only what the contract promises.



## 4. Write Endpoint Validation Check

- **What we checked:** We tested whether a caller could inject unauthorized fields (like `isAdmin`, `verified: true`, or custom IDs) into write operations like `POST /purchases`.
- **What we found:** Our request body validation strictly checks for required fields (`vendorId`, `productId`, `quantity`, `totalAmount`, `currency`), checks that totals match unit prices correctly, and ensures quantities never exceed available stock. Any unexpected extra properties sent in the request body are ignored by our backend.


## 5. Environment Variables & Secret Management

- **What we checked:** We made sure no API keys, tokens, or database passwords were accidentally committed to git history or left sitting in our README.
- **What we found:** 
  - Our `.env` file is explicitly included in `.gitignore`. 
  - We committed a `.env.example` file containing placeholder text so anyone cloning the repo knows what variables need to be configured locally.
 