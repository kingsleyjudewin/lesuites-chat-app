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
