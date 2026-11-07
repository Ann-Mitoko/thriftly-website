# Partner API Resilience & Graceful Fallback Documentation

## Overview
This document details the resilience layer implemented for partner API calls (Team 3 integration). It covers timeout control, exponential backoff retries, in-memory caching for graceful degradation, and empirical test results.

---

## 1. Resilience Parameters & Calculations

### Configuration
* **Request Timeout:** 1500 ms (`AbortSignal.timeout(1500)`)
* **Max Retries:** 2 (Total of 3 attempts: 1 initial call + 2 retries)
* **Backoff Strategy:** Exponential delay (Attempt 1 retry after 200 ms, Attempt 2 retry after 400 ms)

### Worst-Case Timing Calculation
$$T_{\text{max}} = (3 \times 1500\text{ ms}) + 200\text{ ms} + 400\text{ ms} = 4500\text{ ms} + 600\text{ ms} = 5100\text{ ms}$$

Under complete partner unresponsiveness, the maximum total time a user will wait before receiving a response is **5.1 seconds**.

---

## 2. Test Verification Matrix

| Mode | Input / Endpoint Tested | Expected Outcome | Actual Observed Behavior | Result |
| :--- | :--- | :--- | :--- | :--- |
| **`ok`** | `GET /health-services/stock-search` | Responds immediately (< 200ms) with fresh data (`stale: false`). | Returned live stock data instantly with `"stale": false` and updated `asof` timestamp. | **PASS** |
| **`slow`** | `GET /health-services/stock-search` | Retries 2 times after timeouts (1.5s each), then serves cached data (`stale: true`). | Retried after 200ms and 400ms. After ~5.1s, successfully returned cached data with `"stale": true`. | **PASS** |
| **`flaky`** | `GET /health-services/stock-search` | Retries on failure/timeout and succeeds on subsequent attempt. | Handled intermittent failures cleanly and returned valid data without user error. | **PASS** |
| **`error`** | `GET /health-services/stock-search` | Catches 500 error, retries, and falls back to `lastGood` cache or returns 502 status. | Successfully fell back to `lastGood` cache when present; returned clean 502 error when cache was empty after server restart. | **PASS** |

---

## 3. Empirical Test Execution & Output Demos

### Demo Scenario A: Normal Execution & Real Partner Success (`_mode/ok`)
**Execution Command:**
```bash
curl.exe "http://localhost:5000/health-services/stock-search?medicine=Paracetamol&location=Nairobi"

Observed Response Demo:
JSON
{
  "data": [
    {
      "id": 2,
      "pharmacy_id": 3,
      "medicine": "Paracetamol",
      "name": "Goodlife Pharmacy",
      "area": "Nairobi CBD",
      "location": "Nairobi CBD",
      "distance": null,
      "eta": null,
      "quantity": 20,
      "price": 250,
      "verified": false,
      "latitude": -1.289875,
      "longitude": 36.819998
    }
  ],
  "stale": false,
  "asof": "2026-11-04T19:44:00.178Z"
}

Demo Scenario B: Slow Partner & Retry Backoff Log Demo (_mode/slow)
Observed Server Console Demo:
attempt 1 failed, retrying in 200 ms
attempt 2 failed, retrying in 400 ms
partner call failed: The operation was aborted due to timeout
Demo Summary: The backend successfully executes timeout controls and exponential backoff retry bursts before falling back safely.

4. User Impact Analysis
Medicine Search & Pharmacy Directory Screen
User Experience during Outage/Slowdown: When a user searches for available medicines or nearby pharmacies and the partner service is unreachable or timing out, the application waits up to 5.1 seconds while attempting transparent retries in the background. If the partner remains unreachable, the user is presented with the last known inventory data accompanied by a clear notice (stale: true and asof timestamp) indicating that the information shown may not reflect real-time updates due to partner unavailability.

Suggested User Action: Users are advised to verify critical medicine availability directly with the pharmacy via phone if the data is marked as stale, or retry their search in a few minutes.

5. Circuit Breaker Evaluation
Current Implementation: The current architecture uses an in-memory lastGood fallback cache combined with per-request exponential backoff retries.

Circuit Breaker Alternative: A dedicated Circuit Breaker pattern (e.g., using Opossum) would monitor overall failure rates across consecutive requests. Once failures exceed a threshold (e.g., 50% failure rate over 10 seconds), the circuit would "trip" to an Open state. While open, subsequent requests immediately return the cached fallback data without attempting network calls or incurring the 5.1-second timeout delay, giving the partner service time to recover before transitioning back through a Half-Open state.