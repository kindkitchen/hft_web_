export default {
  binance: {
    ws: {
      connection_url: {
        "wss://stream.binance.com:9443": "wss://stream.binance.com:9443",
        "wss://stream.binance.com:443": "wss://stream.binance.com:443",
        "wss://data-stream.binance.vision": "wss://data-stream.binance.vision",
        "wss://ws-api.binance.com:443/ws-api/v3":
          "wss://ws-api.binance.com:443/ws-api/v3",
        "wss://ws-api.binance.com:9443/ws-api/v3":
          "wss://ws-api.binance.com:9443/ws-api/v3",
      },
      stream_name: {
        order_book_depth: (
          symbol: Lowercase<string>,
          update_speed: 100 | 1000 = 100,
        ) => `/ws/${symbol}@depth@${update_speed}ms`,
      },
      possible_general_qs_params: {
        "timeUnit=microsecond": "timeUnit=microsecond",
      },
    },
  },
};
