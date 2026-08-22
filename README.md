# LeSuits

**Real-time messaging, done properly.**

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-149eca?style=flat-square)
![Node](https://img.shields.io/badge/Backend-Node%20%2B%20Express-339933?style=flat-square)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=flat-square)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square)
![FastAPI](https://img.shields.io/badge/Encryption-Python%20%2B%20FastAPI-009688?style=flat-square)

LeSuits is a full-stack chat app — direct messages, group "boardrooms," live presence, instant delivery. Started as something to keep a friend group's chaos in one place; built with the same care as a production system.

Every message is AES‑256‑GCM encrypted by a dedicated microservice before it ever touches the database — plaintext never hits disk.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React · Vite · Tailwind CSS · Socket.IO Client |
| Backend | Node.js · Express · Socket.IO · MongoDB |
| Encryption | Python · FastAPI · AES‑256‑GCM (isolated service) |
| Infra | Docker Compose |

---

*A weekend idea that turned into a real architecture.*
