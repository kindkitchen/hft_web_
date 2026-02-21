export default (
  subscribers: WebSocket[],
) =>
(req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/subscribe") {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 426 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      console.info("Client's socket opened");
      subscribers.push(socket);
    };
    socket.onclose = () => {
      console.info("Client's socket closed");
      const subscriber_index = subscribers.findIndex((s) => s === socket);
      if (subscriber_index !== -1) {
        void subscribers.splice(subscriber_index, 1);
      }
    };
    socket.onerror = (err) => {
      console.warn("Client's socket error:", err);
      socket.close();
    };

    return response;
  }

  const data = {};

  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
};
