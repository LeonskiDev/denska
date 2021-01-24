import { Payload, CloseCode } from "./payload.ts";

/**
 * Shards allow for a bot's processes to be split into separate instances.
 * 
 * While not super useful with smaller bots, splitting up a larger bot's
 * processing into multiple separate instances allows it to - *generally* -
 * process data more efficiently.
 * 
 * Once your bot is in more than 250,000 guilds, this is a mandatory step.
 * Please read the docs below to find out more about sharding.
 * 
 * [Discord Docs](https://discord.com/developers/docs/topics/gateway#sharding)
 */
export class Shard {
  #middleware: shard.Middleware[] = [];
  #ws: WebSocket;

  constructor(options: shard.ShardOptions) {
    this.#ws = new WebSocket(options.url);

    this.#ws.addEventListener("message", event => {
      this.handle(
        {
          raw: JSON.parse(event.data)
        },
        async () => {}
      );
    });

    this.#ws.addEventListener("close", event => {
      this.handle(
        {
          close: {
            code: event.code,
            reason: CloseCode[event.code]
          }
        },
        async () => {}
      );
    });
  }

  use(fn: shard.Middleware) {
    this.#middleware.push(fn);
  }

  handle(ctx: shard.Context, next: () => Promise<void>) {
    let last = -1;

    const dispatch = (i: number): Promise<void> => {
      if(i <= last) return Promise.reject(new Error("next called multiple times"));
      last = i;

      let fn = this.#middleware[i];
      if(i === this.#middleware.length) fn = next;
      if(!fn) return Promise.resolve();

      try { return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1))); }
      catch(err) { return Promise.reject(err); }
    };

    return dispatch(0);
  }

  send(payload: Payload) {
    this.#ws.send(JSON.stringify(payload));
  }
}

export module shard {
  export interface ShardOptions {
    /** The Discord Gateway URL to connect to. */
    url: string
  }

  export type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

  export interface Context {
    raw?: Payload,
    close?: {
      code: number,
      reason: string
    },

    [keyof: string]: unknown
  }
}