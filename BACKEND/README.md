# LeSuits Backend

Production-ready backend for LeSuits: Node/Express/Socket.IO/MongoDB, with a separate Python/FastAPI
microservice that does all AES-256 encryption/decryption of message content. See `docs/ARCHITECTURE.md`,
`docs/API.md`, `docs/SOCKET_EVENTS.md`, and `docs/SECURITY.md` for the full design.

## Layout

```
node-backend/          Express API + Socket.IO server
encryption-service/     FastAPI AES-256-GCM encryption microservice (internal-only)
docker-compose.yml      mongo + encryption-service + node-backend
docs/                   architecture, API, socket events, security
```

## Quick start (Docker Compose)

```bash
cp node-backend/.env.example node-backend/.env
cp encryption-service/.env.example encryption-service/.env
```

Edit both `.env` files:
- `node-backend/.env`: set `JWT_ACCESS_SECRET` and `COOKIE_SECRET` to long random strings, and
  `ENCRYPTION_SERVICE_KEY` to a shared secret.
- `encryption-service/.env`: set `SERVICE_KEY` to the **same** value as `ENCRYPTION_SERVICE_KEY` above, and
  generate `MASTER_KEY_B64` with:
  ```bash
  python3 -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"
  ```

Then:

```bash
docker compose up --build
```

- Node API: `http://localhost:4000` (health check at `/health`)
- Encryption service: `http://localhost:8001` (internal — not meant for direct client use)
- MongoDB: `localhost:27017`

## Running node-backend locally without Docker

```bash
cd node-backend
npm install
npm run dev
```

Requires a reachable `MONGO_URI` and the encryption service running separately (`uvicorn app.main:app --reload
--port 8001` from inside `encryption-service/`, with its `.env` in place and `pip install -r requirements.txt`
run first).

## Manual smoke test

Once both services and Mongo are up:

```bash
# 1. Register
curl -i -c cookies.txt -X POST http://localhost:4000/api/v1/auth/register \
  -H "content-type: application/json" \
  -d '{"username":"a_sterling","email":"a@lesuits.test","password":"a-strong-password"}'
# → 201, note the accessToken in the response body

# 2. Register a second user to talk to
curl -s -X POST http://localhost:4000/api/v1/auth/register \
  -H "content-type: application/json" \
  -d '{"username":"v_vance","email":"v@lesuits.test","password":"another-strong-password"}'
# → note their id from the returned user object

# 3. Start a direct conversation (replace <ACCESS_TOKEN> and <OTHER_USER_ID>)
curl -s -X POST http://localhost:4000/api/v1/conversations \
  -H "content-type: application/json" -H "authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"type":"direct","participantId":"<OTHER_USER_ID>"}'
```

Sending a message itself happens over the `send_message` Socket.IO event (see `docs/SOCKET_EVENTS.md`) — connect
a Socket.IO client with `auth: { token: accessToken }`, emit `send_message` with
`{ contextType: "conversation", contextId: "<conversationId>", text: "hello" }`, and confirm:

- the ack and the `receive_message` broadcast both contain the plaintext `text`,
- but `db.messages.findOne()` in `mongosh` shows only `ciphertext`/`keyVersion` — no plaintext ever hits disk.

## Environment variables

See `node-backend/.env.example` and `encryption-service/.env.example` — every variable is validated at boot
(`node-backend/src/config/env.js`, `encryption-service/app/core/config.py`); the process exits immediately if
anything required is missing or malformed.
