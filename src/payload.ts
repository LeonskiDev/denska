/**
 * A `Payload` is a packet of data send to or from Discord.
 * 
 * `Payload`s contain information used to understand what data is for and the
 * data itself. This data can then be converted into more useful information
 * such as guild objects, channel objects, user objects, etc.
 * 
 * Both malformed `Payload`s and `Payload`s over 4096 bytes will cause the
 * connection to close with error code 4002 (`DecodeError`).
 * 
 * [Discord Docs](https://discord.com/developers/docs/topics/gateway#payloads)
 */
export default interface Payload {
  /** Opcode for the `Payload`. */
  op: PayloadOpcode,
  /** Event data. */
  d: unknown,
  /**
   * Sequence number, used for resuming sessions and heartbeats.
   * 
   * Used when `op` is not 0 (`Dispatch`).
   */
  s?: number,
  /**
   * The event name for this payload.
   * 
   * Used when `op` is not 0 (`Dispatch`).
   */
  t?: PayloadEvent
}

/**
 * The opcode relating to the type of data recieved in a `Payload`.
 * 
 * [Discord Docs](https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes)
 */
export enum PayloadOpcode {
  Dispatch = 0,
  Heartbeat,
  Identify,
  StatusUpdate,
  VoiceStateUpdate,
  Resume = 6,
  Reconnect,
  RequestGuildMembers,
  InvalidSession,
  Hello,
  HeartbeatACK
}

/**
 * The name of the event recieved when the `op` is 0 (`Dispatch`).
 * 
 * [Discord Docs](https://discord.com/developers/docs/topics/gateway#commands-and-events-gateway-events)
 */
export type PayloadEvent =
  "APPLICATION_COMMAND_CREATE"
| "CHANNEL_CREATE"
| "CHANNEL_DELETE"
| "CHANNEL_UPDATE"
| "GUILD_CREATE"
| "GUILD_DELETE"
| "GUILD_UPDATE"
| "GUILD_BAN_ADD"
| "GUILD_BAN_REMOVE"
| "GUILD_EMOJIS_UPDATE"
| "GUILD_MEMBER_ADD"
| "GUILD_MEMBER_REMOVE"
| "GUILD_MEMBER_UPDATE"
| "GUILD_MEMBERS_CHUNK"
| "GUILD_ROLE_CREATE"
| "GUILD_ROLE_DELETE"
| "GUILD_ROLE_UPDATE"
| "INTERACTION_CREATE"
| "MESSAGE_CREATE"
| "MESSAGE_DELETE"
| "MESSAGE_DELETE_BULK"
| "MESSAGE_UPDATE"
| "MESSAGE_REACTION_ADD"
| "MESSAGE_REACTION_REMOVE"
| "MESSAGE_REACTION_REMOVE_ALL"
| "MESSAGE_REACTION_REMOVE_EMOJI"
| "PRESENCE_UPDATE"
| "READY"
| "TYPING_START"
| "USER_UPDATE"
| "VOICE_STATE_UPDATE"
| "WEBHOOKS_UPDATE";