A middleware based [@discord] Gateway API.

[Denska] allows you to create a [@discord] bot using a middleware system like that used by [koa](https://github.com/koajs/koa). When a payload is sent from [@discord] to a shard it gets added to a context and sent through the middleware stack.

Unlike other libraries (which are also awesome and more beginner friendly), [denska] doesn't handle anything out of the box. Instead, functionality is added through middleware provided by the user and another libraries.

## Setting up a minimal Identify Payload
When a bot first connects to [@discord]'s gateway it recieves a *hello* payload which we then have to respond to with an *identify* payload. Let's get a very minimal setup for this made, in a more full setup we'd also add heartbeating.

So first let's import everything we need from [denska] and create a `Shard`. We'll go over what each thing is when we use it.
```ts
import {
  Shard, ShardContext,
  PayloadOpcode
} from "https://deno.land/x/denska/mod.ts";

const shard = new Shard({ url: "wss://gateway.discord.gg" });
```
A `Shard` is a single instance of a connection to the [@discord] gateway. We may later want to create multiple `Shard`s to handle more data over separate instances.

Next we'll create our first middleware function and begin by check that the data payload we got is a *hello* payload.
```ts
shard.use<ShardContext>(async (ctx, next) => {
  if(ctx.raw && ctx.raw.op === PayloadOpcode.Hello) {
```
Here we use the `use` function to add a middleware function onto the stack. We then take in a `ctx` of type `ShardContext` (which is used by typescript to check the data in `ctx`) and a `next` function which calls the next middleware function in the stack.

Now that we know that we have a *hello* payload, let's respond with an *identify* payload.
```ts
    shard.send({
	  op: PayloadOpcode.Identify,
	  d: {
	    token: "<bot_token>",
		  intents: 1 << 9, // the GUILD_MESSAGES intent
		  // these are good properties to use
	  	properties: {
        $os: "linux",
        $browser: "denska",
        $device: "denska"
      }
	  }
	});
```
Here we use the `send` function which is just a helper function provided by `Shard`s to send payloads over the websocket.

Then we can call the `next` function to pass the ctx through if it's not a *hello* payload and close the `use` function.
```ts
  } // if
  else await next();
}); // use
```

We'll lastly create another middleware function with `use` to `console.log` the `ctx`.
```ts
shard.use(async (ctx, next) => {
  console.log(ctx);
});
```
I didn't use the `ShardContext` here since we don't care about knowing what's in `ctx`, all we want to do is `console.log` it.

If we run this and forget to put our bot's token in the `token` part of the *identify* payload, we'll get close data from [@discord].
```js
{ close: { code: 4004, name: "AuthenticationFailed" } }
```
Otherwise we'll see a *dispatch* payload with the `READY` event and data relating to our bot.
```js
{
  raw: {
    t: "READY",
    s: 1,
    op: 0,
    d: {
      v: 8,
      user_settings: {},
      user: {
        verified: true,
        username: "Denska Test",
        mfa_enabled: true,
        id: "797163722002661456",
        flags: 0,
        email: null,
        discriminator: "4976",
        bot: true,
        avatar: null
      },
      session_id: "070652aba963996f096f5d2a8ac042ee",
      relationships: [],
      private_channels: [],
      presences: [],
      guilds: [ [Object] ],
      guild_join_requests: [],
      geo_ordered_rtc_regions: [ "europe", "russia", "us-east", "us-central", "india" ],
      application: { id: "797163722002661456", flags: 0 }
      ]
    }
  }
}
```

[@discord]: https://github.com/discord
[denska]: https://github.com/LeonskiDev/denska
[Denska]: https://github.com/LeonskiDev/denska