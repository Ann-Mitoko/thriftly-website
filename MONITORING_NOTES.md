# Week 12: Monitoring Notes & Reflection

## Part A: Initial Predictions vs. Real Data

### 1. Endpoint Latency

* **Prediction:** We predicted that `/vendors` would be the slowest endpoint due to database lookup overhead.

* **Actual Data:** `GET /health-services/pharmacies` was by far the slowest endpoint, averaging **627.8 ms** (`avgMs`) with a maximum response time (`maxMs`) of **657.3 ms** across 28 calls. In comparison, `GET /vendors/` averaged **11.7 ms**.

### 2. Error Rates

* **Prediction:** We expected client-side errors (4xx) to make up the majority of failures due to missing parameters or invalid paths.

* **Actual Data:** Out of **122 total requests**, there were **64 client errors (4xx)** and **28 server errors (5xx)**, resulting in an overall `errorRatePercent` of **23%**.

## Part E: Analysis of API Data

| Question | Where to Look | Answer & Exact Figures |
| ----- | ----- | ----- |
| **Which endpoint is slowest on average?** | `avgMs` per route | `GET /health-services/pharmacies` with an average of **627.8 ms**. |
| **Which one has a slow worst case?** | `maxMs` per route | `GET /health-services/pharmacies` with a worst case of **657.3 ms**. `GET /vendors/` also had a high spike (`maxMs: 95 ms`) relative to its `avgMs` (**11.7 ms**). |
| **Which endpoint fails most often?** | `serverErrors` and `clientErrors` per route | `GET /health-services/pharmacies` for server errors (28 5xx failures out of 28 attempts). `GET (no route)` had 42 client errors (401s and 404s). |
| **Are the 401s a mistake or probing?** | Log lines with `caller: "none"` | Log entries showing `caller: "none"` on endpoints like `/health-services/pharmacies` and unknown routes indicate automated probing/testing without sending a key header. |
| **Is the error rate healthy?** | `errorRatePercent` & 5xx count | **No.** An `errorRatePercent` of **23%** (driven entirely by 28 server errors on upstream pharmacy calls) is unhealthily high for a production environment. |

## Real Traffic Patterns & Root Cause Analysis

### 1. Real Traffic Pattern

* Across the test traffic mix, `GET /health-services/pharmacies` received **28 requests**, every single one resulting in a 5xx server error (`serverErrors: 28`) and taking between **627.8 ms** and **657.3 ms**.

* `GET /vendors/:id` received **22 calls**, all returning **4xx client errors (404s)** with a very fast average response time of **2.3 ms** because non-existent IDs (e.g., `/vendors/99`) failed validation instantly.

* The `(no route)` category recorded **42 requests** averaging **1.0 ms**, representing rejected unauthenticated requests (401s) and unmatched invalid route paths (404s) rejected prior to endpoint routing.

### 2. Hypothesis

* The high latency and 100% server error rate on `GET /health-services/pharmacies` occur because the endpoint relies on an external stand-in partner service (`http://localhost:4000`) that experienced network timeouts or failure responses during traffic execution.

### 3. Next Steps for Investigation

* We would inspect `resilientFetch.js` and server console logs to verify whether fallback handling (stale in-memory caching) was properly triggered or if upstream errors bypassed the fallback and returned raw 502 status codes.

## Production Alert Design

* **Metric & Threshold:** Trigger a High Priority Alert if `errorRatePercent` exceeds **5% over a 5-minute window**, or if `GET /health-services/pharmacies` records 5 consecutive 5xx responses.

* **Automated Action:** While an on-call engineer is paged, the system should automatically fall back to serving cached stale data (`stale: true`). This ensures end-users receive working data rather than receiving raw 502 Bad Gateway errors.