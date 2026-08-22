export const ROLES = { MEMBER: 'member', ADMIN: 'admin' };

export const PRESENCE_STATUS = { ONLINE: 'online', OFFLINE: 'offline', AWAY: 'away' };

export const MESSAGE_STATUS = { SENT: 'sent', DELIVERED: 'delivered', SEEN: 'seen' };

export const CONTEXT_TYPE = { CONVERSATION: 'conversation', BOARDROOM: 'boardroom' };

export const CONVERSATION_TYPE = { DIRECT: 'direct', GROUP: 'group' };

export const BOARDROOM_ROLE = { OWNER: 'owner', MEMBER: 'member' };

export const CONNECTION_STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', REJECTED: 'rejected' };

export const REACTION_TYPE = { APPROVED: 'approved', EXECUTIVE: 'executive' };

export const NOTIFICATION_TYPE = {
  MESSAGE: 'message',
  BOARDROOM_INVITE: 'boardroom_invite',
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
};

export const ACTIVITY_TYPE = {
  JOINED_BOARDROOM: 'joined_boardroom',
  LEFT_BOARDROOM: 'left_boardroom',
  CONNECTED_WITH: 'connected_with',
  PROFILE_UPDATED: 'profile_updated',
};

export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const PRESENCE_OFFLINE_GRACE_MS = 10_000;
