# Socket.IO Events

Connect with `auth: { token: accessToken }` on the handshake — a middleware in `sockets/index.js` verifies it
and rejects the connection otherwise. Every socket auto-joins `user:<userId>` on connect, which is how
notifications and cross-device delivery reach a user regardless of which room they currently have open.

Rooms: `user:<userId>`, `conversation:<conversationId>` (joined via `join_conversation`), `boardroom:<boardroomId>`
(joined via `join_boardroom`, membership-checked server-side both times).

## Client → Server

| Event | Payload | Ack response |
|---|---|---|
| `join_conversation` | `conversationId` | `{ success, error? }` |
| `leave_conversation` | `conversationId` | `{ success }` |
| `join_boardroom` | `boardroomId` | `{ success, error? }` |
| `leave_boardroom` | `boardroomId` | `{ success }` |
| `send_message` | `{ contextType: 'conversation'\|'boardroom', contextId, text }` | `{ success, message }` |
| `message_seen` | `{ messageId }` | — (result broadcast via `message_seen`) |
| `user_typing` | `{ contextType, contextId }` | — |
| `user_stopped_typing` | `{ contextType, contextId }` | — |
| `user_status_changed` | `'online' \| 'away'` | — |
| `notification_read` | `notificationId` | `{ success, error? }` |

## Server → Client

| Event | Fired when | Payload |
|---|---|---|
| `receive_message` | a message is sent in a room you're joined to | full message (decrypted `text`, id, senderId, createdAt, ...) |
| `message_edited` | REST edit succeeds | updated message |
| `message_deleted` | REST delete succeeds | `{ messageId }` |
| `message_reacted` | REST reaction succeeds | updated message |
| `message_seen` | a peer acks `message_seen` | `{ messageId, userId, seenAt }` |
| `user_typing` / `user_stopped_typing` | relayed from a peer in the same room | `{ userId, contextType, contextId }` |
| `user_online` / `user_offline` | a peer (shared conversation or boardroom) connects/disconnects — never a global broadcast | `{ userId }` / `{ userId, lastSeen }` |
| `user_status_changed` | a peer explicitly sets away/online | `{ userId, status }` |
| `boardroom_member_added` / `boardroom_member_removed` | boardroom membership REST call succeeds | `{ boardroomId, userId }` |
| `connection_request_received` | someone sends you a connection request | the request |
| `connection_request_accepted` | your sent request is accepted | the request |
| `notification` | any notification is created for you | the notification |

## Presence semantics

On connect: if this is the user's first active socket (multi-tab/device aware via an in-memory `userId → Set<socketId>`
registry), mark them online and broadcast `user_online` only to peers who share a conversation or boardroom with them.
On disconnect: if that was their last active socket, wait a short grace window (10s) before marking them offline —
this absorbs page reloads/tab switches without flickering the status for everyone watching. See
`modules/presence/presence.service.js`.
