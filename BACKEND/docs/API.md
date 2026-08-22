# LeSuits REST API

Base URL: `/api/v1`. All routes except `auth/*` and `GET /health` require `Authorization: Bearer <accessToken>`.
Every response is `{ success: boolean, data, message?, details? }`.

## Auth (`/auth`)
| Method | Path | Notes |
|---|---|---|
| POST | `/register` | `{ username, email, password }` → issues access token + sets refresh cookie |
| POST | `/login` | `{ email, password }` |
| POST | `/refresh` | reads refresh cookie, rotates it, issues new access token |
| POST | `/logout` | revokes the refresh cookie's token |

## Users (`/users`)
| Method | Path | Notes |
|---|---|---|
| GET | `/me` | current user profile |
| PATCH | `/me` | `{ title?, avatarUrl?, tags?, bio? }` |
| GET | `/` | directory search — query: `q`, `status`, `page`, `limit` |
| GET | `/:id` | public profile |

## Conversations (`/conversations`) — direct & group chat
| Method | Path | Notes |
|---|---|---|
| GET | `/` | list mine, with decrypted last-message preview |
| POST | `/` | `{ type: 'direct', participantId }` or `{ type: 'group', name, participantIds }` |
| GET | `/:id/messages` | paginated, decrypted — query: `cursor`, `limit` |

## Messages (`/messages`) — sending happens over the `send_message` socket event; REST covers edit/delete/react
| Method | Path | Notes |
|---|---|---|
| PATCH | `/:id` | `{ text }` — sender only |
| DELETE | `/:id` | soft delete — sender only |
| POST | `/:id/reactions` | `{ type: 'approved' \| 'executive' }` |

## Boardrooms (`/boardrooms`)
| Method | Path | Notes |
|---|---|---|
| POST | `/` | `{ name, description?, memberIds? }` — creator becomes owner |
| GET | `/` | boardrooms I'm a member of |
| GET | `/:id` | detail with populated members |
| GET | `/:id/messages` | paginated, decrypted |
| POST | `/:id/members` | `{ userId }` — owner only |
| DELETE | `/:id/members/:userId` | owner only |
| POST | `/:id/leave` | self-removal (owner must transfer/empty the room first) |

## Presence (`/presence`)
| Method | Path | Notes |
|---|---|---|
| GET | `/:userId` | `{ status, lastSeen }` |
| PATCH | `/me` | `{ status: 'online' \| 'away' }` — explicit status only; offline is socket-disconnect-driven |

## Connections (`/connections`)
| Method | Path | Notes |
|---|---|---|
| POST | `/requests` | `{ receiverId }` |
| PATCH | `/requests/:id` | `{ status: 'accepted' \| 'rejected' }` — receiver only |
| GET | `/` | my sent + received requests |

## Files (`/files`) — presigned direct-to-S3 upload, bytes never pass through Node
| Method | Path | Notes |
|---|---|---|
| POST | `/presign` | `{ contextType, contextId, fileName, mimeType, size }` → `{ uploadUrl, storageKey }` |
| POST | `/` | confirm metadata after the client's S3 PUT succeeds |
| GET | `/:id/download-url` | short-lived signed GET URL |
| DELETE | `/:id` | uploader only |

## Notifications (`/notifications`)
| Method | Path | Notes |
|---|---|---|
| GET | `/` | latest 50, newest first |
| PATCH | `/:id/read` | mark one read |

## Activity (`/activity`)
| Method | Path | Notes |
|---|---|---|
| GET | `/:id` | recent activity feed for a member's profile panel |
| GET | `/:id/sidebar` | aggregated `{ boardroomsJoined, connectionsCount }` for the Member Activity sidebar |
