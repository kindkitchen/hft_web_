const client = new WebSocket("http://localhost:4000/subscribe");
client.onopen = () => {
  console.debug("connected");
};
client.onmessage = (ev) => {
  console.debug(JSON.parse(ev.data));
};
