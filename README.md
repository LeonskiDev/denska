Denska is the [koa] - *albeit not so beginner friendly* - of [@discord] gateway apis.

It only defines what it needs to manage a connection to the gateway and pass down a context containing relevant data.

## So, why denska?
I'd actually preference using another library such as [discordeno] (deno) or [discord.js] (node) over denska. They're much more beginner friendly and contain **all** the necessities you'd want when using a [@discord] api.

*"So why would you use denska in the end?"*

If you want, need, or just prefer more control over each payload from it's raw state, then this is what desnka is for. It can also be made as beginner friendly as both [discordeno] and [discord.js] over time with middleware created by the community.

## A quick example (using deno + typescript).
This example will go through [identifying](https://discord.com/developers/docs/topics/gateway#identifying) and setting up [heartbeats](https://discord.com/developers/docs/topics/gateway#heartbeating). I'd recommend you read the docs for them as we go through this example.

### Setting up.
First things first, let's get everything that we need setup. This includes importing stuff, creating a shard, and some variables we'll be using.
```ts
// in your code you'll want to specify a version
import { Shard, Opcode } from "https://deno.land/x/denska";

// this isn't the best way to do it, you'd want to get beforehand
const shard = new Shard({
	url: "wss://gateway.discord.gg/?v=8&encoding"
});

// this will be received by the *hello* payload when we first connect
let heartbeat_interval: number;
// this is received by all payloads, so this will be updated frequently
let last_seq: number | null = null;
```
Nice, now we've setup the base we can get into creating some middleware!

### Identifying.
This is an important step as it let's us receive events for our bot going forward.
```ts
// this will do our identifying
shard.use(async (ctx, next) => {
	// this checks to see that we got a payload, not a close event
	if(ctx.raw) {
		// then we check that the opcode is for our *hello* payload
		if(ctx.raw.op === Opcode.Hello) {
			shard.send({
				// we're sending back an *identify* payload
				op: Opcode.Identify,
				d: {
					// this identifies the bot we are connecting as
					token: "<bot_token>",
					// here we'll just use some good defaults
					properties: {
						$os: "linux",
						$browser: "denska",
						$device: "denska"
					},
					// `1` is for guild events
					// `512` is for guild message events
					intents: 1 | 512
				}
			});
		}
	}
	
	// pass down the `ctx` to the next middleware
	await next();
});
```
That's quite the chunk of code, thankfully most of it's whitespace and comments.

In this we check that we got the *hello* payload and send back an *identify* payload in response. Said *identify* payload contains the basic information needed to setup a connection.

Lastly, we want to pass down the `ctx` so we call `next` which does that for us.

### Heartbeating.
This is another important step as it keeps the connection alive so that we can continue to receive events.
```ts
shard.use(async (ctx, next) => {
	if(ctx.raw) {
		// here we get the sequence from the payload or use `null`
		last_seq = ctx.raw.s ?? null;
		
		// here we want to check if the payload is a *hello* payload
		if(ctx.raw.op === Opcode.Hello) {
			// if so, we need it's `heartbeat_interval`
			heartbeat_interval =
				(ctx.raw.d as { heartbeat_interval: number }).heartbeat_interval;
		}
		
		// then we also want to check if the payload is a...
		if(
			// *hello* payload, (initial heartbeat)
			ctx.raw.op === Opcode.Hello
			// *heartbeat* payload, (gateway requesting a heartbeat)
			|| ctx.raw.op === Opcode.Heartbeat
			// or a *heartbeatack* payload (last heatbeat was acknowledged)
			|| ctx.raw.op == Opcode.HeartbeatACK
		) {
			// then we can send a *heartbeat* payload back after
			// `heartbeat_interval` milliseconds
			setTimeout(() => {
				shard.send({
					op: Opcode.Heartbeat,
					d: last_seq
				});
			}, heartbeat_interval);
		}
	}
	
	// pass down the `ctx` to the next middleware
	await next();
});
```
Another one that looks like a lot of code, but really it's just whitespace and comments.

In this we check that we got any payload, if so we save it's sequence if it has one. Then we check for a *hello* payload specifically, and if we got it we take its `heartbeat_interval` for later. Then we check for either a *hello*, *heartbeat*, or *heartbeatack* payload and send back a *heartbeat* payload after `heartbeat_interval` milliseconds.

Once again, we want to pass down the `ctx` so we call `next` which does that for us.

### Testing.
So, we have it all setup and now it's time to test. This is the simplest bit of middleware, all we need to do it `console.log` the `ctx`.
```ts
shard.use(async ctx => {
	console.log(ctx);
})
```
Done, not much to explain here.

When you run the code you'll see a *hello* payload shortly followed by a *dispatch* payload with the `t` set to `READY`, this contains your bot's user data.

Then comes more *dispatch* events with `t` set to `GUILD_CREATE` which are the guilds your bot is in. As users in these guilds send messages, you'll also receive *dispatch* events with `t` set to `MESSAGE_CREATE`.

Every once in a while - *however milliseconds `heartbeat_interval` is set to* - you'll see a *heartbeatack* payload which is the gateway saying that your heartbeat was acknowledged. If no *heartbeatack* payload is received then the connection will die.

If any of the above things fail, you'll most likely see `close` in `ctx` instead of `raw`. This will contain the close `code` and a `reason` why the connection closed.

## denska-core.
An *"official"* - *by that I mean it's maintained alongside denska* - middleware package for denska exists called [denska-core], this does everything in the above example plus extra.

I'd recommend using it if you'd like a quick and easy setup for the stuff above.

[koa]: https://koajs.com/
[@discord]: https://github.com/discord
[discordeno]: https://deno.land/x/discordeno
[discord.js]: https://www.npmjs.com/package/discord.js
[denska-core]: https://deno.land/x/denska_core