# BLIND_TEST_REPORT.md: Thriftly (Team 4) Documentation Blind Test

- **Test Date:** Completed asynchronously following Week 8 lab session.
- **Tested API Repo:** Thriftly API (Team 4)
- **API URL Tested:** `https://thriftly-website.onrender.com` / Local instance via README instructions.

---

## 1. What Happened When Our README Was Tested

A team outside our ring attempted to follow our `README.md` quickstart from a completely clean machine, without any prior verbal guidance, walk-throughs, or assistance. 

- **Did they succeed?** Yes, but with one minor friction point on step one.
- **How long did it take?** Approximately 12 minutes from cloning the repository to executing a successful `GET /vendors` and `POST /purchases` request.
- **Where did they get stuck?** They successfully ran the local MySQL database setup and installed Node modules. However, they initially hit a `401 Unauthorized` error when running the first quickstart `curl` command because they copied the literal placeholder string `<your-api-key>` instead of generating and substituting their own local test key into `server/.env`. Once they generated a key using the provided crypto command in our local setup guide, subsequent requests returned `200 OK` instantly.

---

## 2. What We Fixed in Our Docs as a Result

As a direct result of observing the tester's initial confusion around the API key placeholder, we updated our `README.md` to make the distinction between the placeholder and local configuration even more explicit:
- **Clarified Placeholder Text:** Added an extra warning box directly under the Quickstart section emphasizing that `<your-api-key>` must be replaced by the actual key string defined in their local `server/.env` file.
- **Explicit Header Reminder:** Highlighted the exact `X-API-Key` and `Authorization: Bearer` requirement so callers do not miss the dual-header structure required for write endpoints like `POST /purchases`.

---

## 3. Honest Summary

The testing team successfully obtained working responses from our API after a brief 12-minute onboarding period. The local setup instructions (`mysql -u root < thriftly_schema.sql` and `npm start`) worked cleanly without throwing missing dependency errors or unexpected crashes. While the minor slip-up with the key placeholder caused a brief 401 roadblock, our quickstart documentation provided enough context for them to diagnose and resolve it independently without messaging us—which proves the documentation fulfilled its core purpose during the blind test.