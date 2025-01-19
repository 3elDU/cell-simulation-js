import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import "./assets/default.css";
import { worker } from "./ipc";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount("#app");

// Call getter to initialize worker
worker();
