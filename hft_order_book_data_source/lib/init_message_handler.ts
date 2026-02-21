import type Ctx from "./ctx.ts";

export default (
  ctx: typeof Ctx,
  subscribers: WebSocket[],
) =>
(ev: MessageEvent<string>) => {
  if (++ctx.message_i % 100n === 0n) {
    console.debug(`Total messages receive from binance: ${ctx.message_i}`);
    console.debug(`Total subscribers: ${subscribers.length}`);
  }
  for (let i = 0; i < subscribers.length; ++i) {
    subscribers[i].send(ev.data);
  }
};
