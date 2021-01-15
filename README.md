A middleware based [@discord] Gateway API.

Denska allows you to create a [@discord] bot using a middleware system like that used by [koa](https://github.com/koajs/koa). When a payload is sent from [@discord] to a shard it gets added to a context and sent through the middleware stack.

### Comparisons
Let's look at some code in other libraries and [denska] and how they compare to eachother. As a side note I don't hate any of the other libraries, they're actually a ton more beginner friendly than this one and I would recommend them.

A simple logging bot you might write in [discordeno] (version [@10.0.2](https://deno.land/x/discordeno@10.0.2)):
```js
import { startBot, Intents } from "https://deno.land/x/discordeno@10.0.2/mod.ts";

startBot({
 token: "<bot_token>",
 intents: [Intents.GUILD_MESSAGES],

 eventHandlers: {
   ready() {
     console.log("Bot is ready.");
   },
   messageCreate(message) {
     console.log(`${message.member?.tag ?? "unknown_user"}: "${message.content}"`);
   }
 }
});
```

That same logging bot but writen in [discord.js] (version [v12.5.1](https://github.com/discordjs/discord.js/releases/tag/12.5.1)):
```js
const { Client } = require("discord.js");
const client = new Client();

client.on("ready", () => console.log("Bot is ready."));

client.on("message", message => {
  console.log(`${message.author.tag}: "${message.content}"`);
});

client.login("<bot_token>");
```

And now that logging bot but written in [denska] (version [v0.2.0](https://github.com/LeonskiDev/denska/releases/tag/v0.2.0)):
```js
import { Shard, Payload, PayloadOpcode } from "./mod.ts";

// this just uses the general gateway url
const shard = new Shard({
 url: "wss://gateway.discord.gg"
});

shard.use(async (ctx, next) => {
  // the event is a payload
  if(ctx.raw) {
    // got the initial hello
    if(ctx.raw.op === PayloadOpcode.Hello) {
      // sets up basic heartbeating (this doesn't do any proper checks)
      setInterval(() => {
        shard.ws.send(JSON.stringify({
          op: PayloadOpcode.Heartbeat
        } as Payload));
      // @ts-ignore (quick and dirty since "d" is unknown)
      }, ctx.raw.d.heartbeat_interval);

      // now we can send our idenitfy payload
      shard.ws.send(JSON.stringify({
        op: PayloadOpcode.Identify,
        d: {
          token: "<bot_token>",
          intents: 1 << 9, // MESSAGE_CREATE
          properties: {
            $os: "linux",
            $browser: "denska",
            $device: "denska"
          }
        }
      } as Payload));
    }
    // if the "op" is not hello then we just pass the "ctx" down
    else {
     await next();
    }
  }
});

shard.use(async (ctx, next) => {
  // the event is a payload
  if(ctx.raw) {
    // got the READY event
    if(ctx.raw.op === PayloadOpcode.Dispatch && ctx.raw.t === "READY") {
      console.log("Bot is ready.");
    }
    // got MESSAGE_CREATE event
    else if(ctx.raw.op === PayloadOpcode.Dispatch && ctx.raw.t === "MESSAGE_CREATE") {
      // @ts-ignore (quick and dirty since "d" is unknown)
	  console.log(`${ctx.raw.d.author.username}#${ctx.raw.d.author.discriminator}: "${ctx.raw.d.content}"`);
    }
  }
});
```

As you can see, [denska] is a much more manual than both [discordeno] and [discord.js], but because it uses a middleware system this can be automated. Let's say we have a middleware function that does the identify and heartbeat stuff we just did manually, this is what that code would then look like:

```js
import { Shard, Payload, PayloadOpcode } from "./mod.ts";
import { do_identify_stuff } from "./identify_stuff.ts";

// this just uses the general gateway url
const shard = new Shard({
 url: "wss://gateway.discord.gg"
});

// use the middleware that does the identify and heartbeat stuff
shard.use(do_identify_stuff);

shard.use(async (ctx, next) => {
  // the event is a payload
  if(ctx.raw) {
    // got the READY event
    if(ctx.raw.op === PayloadOpcode.Dispatch && ctx.raw.t === "READY") {
      console.log("Bot is ready.");
    }
    // got MESSAGE_CREATE event
    else if(ctx.raw.op === PayloadOpcode.Dispatch && ctx.raw.t === "MESSAGE_CREATE") {
      // @ts-ignore (quick and dirty since "d" is unknown)
	  console.log(`${ctx.raw.d.author.username}#${ctx.raw.d.author.discriminator}: "${ctx.raw.d.content}"`);
    }
  }
});
```

[@discord]: https://github.com/discord
[denska]: https://github.com/LeonskiDev/denska
[discordeno]: https://deno.land/x/discordeno
[discord.js]: https://github.com/discordjs/discord.js