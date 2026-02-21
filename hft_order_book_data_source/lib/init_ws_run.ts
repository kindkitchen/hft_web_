import $ from "./const.ts";
import type Ctx from "./ctx.ts";

export default (
  ctx: typeof Ctx,
  message_handler: (ev: MessageEvent) => void | Promise<void>,
) =>
() => {
  const { resolve, reject, promise } = Promise.withResolvers();
  const ws = new WebSocket(
    `${$.binance.ws.connection_url["wss://data-stream.binance.vision"]}${
      $.binance.ws.stream_name.order_book_depth("btcusdt")
    }`,
  );
  ctx.ws = ws;
  ws.onmessage = message_handler;
  ws.onopen = (ev) => console.info("Connection is opened:", ev);
  ws.onclose = (ev) => {
    console.info("Connection is closed:", ev);
    resolve("closed");
  };
  ws.onerror = (err) => {
    reject(err);
  };

  return promise;
};
