import Handler from "./handler.ts";
import Payload from "./payload.ts";

/** The version of the Discord Gateway to use. */
const GATEWAY_VERSION = 8;
const ENCODING = "json";

/**
 * A `Shard` is used to split bot operations into separate processes.
 * 
 * Discord uses a method of user-controlled guild sharding which allows
 * splitting events across multiple connections. Sharding is completely user
 * controlled and requires no state-sharing between `Shard`s.
 * 
 * To use sharding, the `shard` array should be present in the identify
 * `Payload`. The first item should be the zero-based integer of the current
 * `Shard`, the second item being the total number of `Shard`s.
 * 
 * Calculating what events will be sent to what `Shard` can be do with the
 * following formula:
 * ```js
 * shard_id = (guild_id >> 22) % num_shards
 * ```
 * 
 * Be aware that DMs will only be sent to `Shard` 0.
 * 
 * [Discord Docs](https://discord.com/developers/docs/topics/gateway#sharding)
 */
export default class Shard extends Handler {
  #ws: WebSocket;

  constructor({ url, gateway_version = GATEWAY_VERSION, encoding = ENCODING }: { url: string, gateway_version?: number, encoding?: "json" | "etf" }) {
    super();

    this.#ws = new WebSocket(`${url}${url.endsWith("/") ? "" : "/"}?v=${gateway_version}&encoding=${encoding}`);

    this.#ws.addEventListener("message", e => {
      this.handle({
        raw: JSON.parse(e.data) as Payload
      } as ShardContext);
    });

    this.#ws.addEventListener("close", e => {
      this.handle({
        close: {
          code: e.code,
          name: CloseCode[e.code] ?? CloseCode[4000]
        }
      } as ShardContext);
    });
  }

  /** Gets the WebSocket which the `Shard` is using. */
  get ws() {
    return this.#ws;
  }
}

/** This contains data which is relevant to a recieved event on the connection. */
export interface ShardContext {
  /** Data relating to the Websocket closing. */
  close?: Close,
  /** This is the raw payload which was recieved from Discord. */
  raw?: Payload,

  [keyof: string]: unknown
}

/**
 * Information relating to the connection closing.
 * 
 * [Discord Docs](https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes)
 */
export interface Close {
  code: number,
  name: string
}

/**
 * The reason for the connection closing.
 * 
 * [Discord Docs](https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes)
 */
export enum CloseCode {
  Closed = 1000,
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