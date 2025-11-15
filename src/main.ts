import { createApp } from "vue";
import App from "./App.vue";

// Bootstrap (CSS + JS opcional)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

// FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faWallet,
  faPlusCircle,
  faCircleArrowDown,
  faCircleArrowUp,
  faScaleBalanced,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

// adiciona os ícones que vamos usar
library.add(
  faWallet,
  faPlusCircle,
  faCircleArrowDown,
  faCircleArrowUp,
  faScaleBalanced,
  faMagnifyingGlass
);

const app = createApp(App);

// registra o componente global <font-awesome-icon>
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
