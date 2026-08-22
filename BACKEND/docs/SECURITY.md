# Security Design

## Transport & headers
`helmet()` for standard security headers, strict CORS allowlist (`CORS_ORIGIN`, credentialed), HTTPS/TLS
terminated at the load balancer in production (not in-process here).

## Input handling
Every mutating route validates `req.body`/`req.query` against a `zod` schema before it reaches a controller
(`middleware/validate.middleware.js`). `express-mongo-sanitize` strips `$`/`.` operators from user input to
block NoSQL injection. Body size capped at 1mb.

## AuthN/AuthZ
- Passwords hashed with bcrypt, cost factor 12.
- Access tokens: short-lived (15m) JWTs, `Bearer` header only, verified per-request in `auth.middleware.js` and
  again on the Socket.IO handshake.
- Refresh tokens: opaque random 48-byte tokens, never JWTs — stored server-side only as a SHA-256 hash
  (`RefreshToken.tokenHash`), delivered to the client as an `httpOnly`, `secure` (prod), `sameSite: strict`,
  **signed** cookie scoped to `/api/v1/auth`. Signing (via `COOKIE_SECRET`) adds tamper-evidence on top of
  `httpOnly`.
- Rotation + reuse detection: every `/auth/refresh` call revokes the presented token and issues a new one. If a
  *revoked* token is ever replayed, every other active token for that user is revoked immediately — the only way
  that can happen is if a token was stolen and both the attacker and the legitimate user tried to use it.
- Per-module authorization lives in each module's service layer (`assertParticipant`, `assertMember`,
  `assertOwner`), never trusted from client-supplied role claims beyond the JWT's own `role`.

## Rate limiting
`express-rate-limit`: general API (300 req/15min/IP), stricter on `/auth/*` (20/15min/IP) and message
mutations (60/min/IP). Tune per deployment; this is a starting point, not a final number.

## Encryption at rest
Messages are AES-256-GCM encrypted by the Python microservice before Node ever writes them to MongoDB —
`Message.ciphertext` is opaque and stripped from every API response's JSON (`message.model.js`'s `toJSON`
transform). The service-to-service call is HMAC-SHA256 signed with a shared secret
(`ENCRYPTION_SERVICE_KEY` / `SERVICE_KEY`, must match on both sides) over `${timestamp}.${rawBody}`, with a
60-second replay window — this is the boundary that keeps the encryption service from being callable by anything
other than this specific Node backend, even though it sits on the same Docker network as other containers.

Key management is HKDF-derived versioned sub-keys of one master KEK (see `docs/ARCHITECTURE.md`). **Production
upgrade path**: move `MASTER_KEY_B64` out of a `.env` file and into a real KMS/secrets manager (AWS KMS, GCP KMS,
HashiCorp Vault), and consider randomly-generated per-message-batch DEKs individually wrapped by the KMS key
instead of deterministic HKDF derivation, for stronger blast-radius isolation if a derived key is ever
compromised.

## File uploads
Uploads never pass through Node — the client PUTs directly to S3 using a presigned URL Node generates only after
checking the requester is a participant/member of the target context (`files/file.service.js`). MIME type is
restricted to an explicit allowlist (PDF/DOCX/PPTX/PNG/JPEG/WEBP) and size capped at 25MB, both enforced by the
`zod` schema before a presigned URL is even issued.

## Secrets
All secrets are environment variables, never committed — only `.env.example` files (with placeholder values) are
checked in; `.gitignore` excludes `.env`. `env.js` validates every required variable at boot with `zod` and
`process.exit(1)`s immediately on a missing/malformed one, so a misconfigured deployment fails fast instead of
running in a partially-insecure state.

## What's intentionally out of scope for this pass
OAuth/social login (buttons appear in the login mockup but aren't in the mega-prompt's auth spec), the "Vault"
secure-storage feature hinted at in the messaging mockup, and horizontal Socket.IO scaling via Redis (see the
"Mongo/JWT only" decision recorded in `docs/ARCHITECTURE.md`).
