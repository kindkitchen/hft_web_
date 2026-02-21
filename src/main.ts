import "./style.css";
import { createApp } from "vue";
import { defaultConfig, plugin } from "@formkit/vue";
import App from "./App.vue";
import { router } from "./router.ts";

createApp(App)
  .use(
    plugin,
    defaultConfig({
      theme: "genesis", // will load from CDN and inject into document head
    }),
  )
  .use(router)
  .mount("#app");
