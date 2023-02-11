import { createApp } from "vue";
import App from "./App.vue";

import "./assets/main.css";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoadingPlugin } from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { Form, Field, ErrorMessage, defineRule, configure } from "vee-validate";
import { required, email } from "@vee-validate/rules";
import { loadLocaleFromURL, localize } from "@vee-validate/i18n";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCartShopping,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

/* add icons to the library */
library.add(faChevronLeft, faChevronRight, faCartShopping, faCircleInfo);

configure({
  generateMessage: localize("zh_TW"),
  validateOnInput: true,
});

loadLocaleFromURL(
  "https://unpkg.com/@vee-validate/i18n@4.0.2/dist/locale/zh_TW.json"
);

defineRule("email", email);
defineRule("required", required);

createApp(App)
  .use(LoadingPlugin)
  .component("VForm", Form)
  .component("VField", Field)
  .component("ErrorMessage", ErrorMessage)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");
