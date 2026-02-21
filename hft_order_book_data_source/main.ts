import ctx from "./lib/ctx.ts";
import init_message_handler from "./lib/init_message_handler.ts";
import init_req_handler from "./lib/init_req_handler.ts";
import init_ws_run from "./lib/init_ws_run.ts";

const subscribers = [] as WebSocket[];
const message_handler = init_message_handler(ctx, subscribers);

Deno.serve({
  port: 4000,
}, init_req_handler(subscribers));

if (import.meta.main) {
  while (!ctx.stop) {
    await init_ws_run(ctx, message_handler)();
  }
}
