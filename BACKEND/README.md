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

