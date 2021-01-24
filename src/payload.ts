export interface Payload {
  op: Opcode,
  d?: unknown,
  s?: number,
  t?: Event
}

export enum Opcode {
  Dispatch = 0,
  Heartbeat,
  Identify,
  PresenceUpdate,
  VoiceStateUpdate,
  Resume = 6,
  Reconnect,
  RequestGuildMembers,
  InvalidSession,
  Hello,
  HeartbeatACK
}

export enum CloseCode {
  UnknownError = 4000,
  UnknownOpcode,
  DecodeError,
  NotAuthenticated,
  AuthenticationFailed,
  AlreadyAuthenticated,
  InvalidSeq = 4007,
  RateLimited,
  SessionTimedOut,
  InvalidShard,
  ShardingRequired,
  InvalidApiVersion,
  InvalidIntent,
  DisallowedIntent
}

export type Event =
  "READY"
| "RESUMED"
| "CHANNEL_CREATE"
| "CHANNEL_UPDATE"
| "CHANNEL_DELETE"
| "CHANNEL_PINS_UPDATE"
| "GUILD_CREATE"
| "GUILD_UPDATE"
| "GUILD_DELETE"
| "GUILD_BAN_ADD"
| "GUILD_BAN_REMOVE"
| "GUILD_EMOJIS_UPDATE"
| "GUILD_INTEGRATIONS_UPDATE"
| "GUILD_MEMBER_ADD"
| "GUILD_MEMBER_REMOVE"
| "GUILD_MEMBER_UPDATE"
| "GUILD_MEMBERS_CHUNK"
| "GUILD_ROLE_CREATE"
| "GUILD_ROLE_UPDATE"
| "GUILD_ROLE_DELETE"
| "INVITE_CREATE"
| "INVITE_DELETE"
| "MESSAGE_CREATE"
| "MESSAGE_UPDATE"
| "MESSAGE_DELETE"
| "MESSAGE_DELETE_BULK"
| "MESSAGE_REACTION_ADD"
| "MESSAGE_REACTION_REMOVE"
| "MESSAGE_REACTION_REMOVE_ALL"
| "MESSAGE_REACTION_REMOVE_EMOJI"
| "PRESENCE_UPDATE"
| "TYPING_START"
| "USER_UPDATE"
| "VOICE_STATE_UPDATE"
| "VOICE_SERVER_UPDATE"
| "WEBHOOKS_UPDATE"
| "INTERACTION_CREATE";