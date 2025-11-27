# Hive Keychain Auth Flow

## Overview

1. Frontend asks for a one-time challenge: `GET /auth/hive/challenge?username=<hive-account>`.
2. Hive Keychain signs the returned `nonce`.
3. Frontend submits signature to `POST /auth/login-keychain`.
4. Backend verifies signature, marks nonce as used, and replies with a JWT.
5. JWT protects APIs through the `Authorization: Bearer <token>` header (see `/auth/hive/me`).

All requests must be sent over HTTPS in production.

---

## Environment Variables

| Name | Description | Example |
| --- | --- | --- |
| `HIVE_RPC_NODES` | Comma-separated RPC URLs for `@hiveio/dhive` | `https://api.hive.blog,https://anyx.io` |
| `JWT_SECRET` | HMAC secret for HS256 JWT signing | _required_ |
| `JWT_EXPIRES_IN` | JWT TTL (anything [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback) accepts) | `1h` |
| `NONCE_TTL_SECONDS` | Challenge lifetime | `300` |
| `HIVE_ACCOUNT_CACHE_MS` | (Optional) cache Hive account data | `60000` |

---

## `GET /auth/hive/challenge`

**Request**

```
GET /auth/hive/challenge?username=someuser
```

**Response**

```json
{
  "nonce": "3ab4d0b54f3de4f3d86e9073d3698898b754bb8ff1337bd5223c54cb6a9c79a2",
  "username": "someuser",
  "expiresIn": 300
}
```

Notes:
- Nonce is 32 random bytes hex-encoded.
- `(username, nonce)` combos are unique, stored with TTL + `used=false`.
- Rate limited per IP + username.

---

## `POST /auth/login-keychain`

**Request**

```http
POST /auth/login-keychain
Content-Type: application/json

{
  "username": "someuser",
  "nonce": "3ab4d0b54f3de4f3d86e9073d3698898b754bb8ff1337bd5223c54cb6a9c79a2",
  "signature": "1f3b...c0"
}
```

**Response**

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "expiresAt": 1731231231,
  "username": "someuser",
  "loginMethod": "hive_keychain"
}
```

Error shapes follow:

```json
{
  "error": "invalid_nonce",
  "message": "Nonce not found"
}
```

Possible `error` values: `invalid_nonce`, `nonce_used`, `nonce_expired`, `unknown_account`, `invalid_signature_format`, `signature_not_authorized`, `payload_too_large`, plus generic `*_failed` server failures. Rate-limited per IP + username.

---

## `GET /auth/hive/me`

Use this endpoint to validate JWTs.

**Request**

```
GET /auth/hive/me
Authorization: Bearer <jwt>
```

**Response**

```json
{
  "username": "someuser",
  "loginMethod": "hive_keychain",
  "exp": 1731231231,
  "iat": 1731227631
}
```

401 is returned when the token is missing or invalid/expired.

---

## Metrics

`GET /auth/hive/metrics` (requires `x-api-key` if configured) returns counters:

```json
{
  "challenge": {
    "total": 10,
    "success": 9,
    "failures": {
      "invalid_username": 1
    }
  },
  "login": {
    "total": 6,
    "success": 4,
    "failures": {
      "invalid_nonce": 1,
      "signature_not_authorized": 1
    }
  }
}
```

Use these numbers for dashboards/alerts.


