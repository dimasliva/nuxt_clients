import "flag-icons/css/flag-icons.min.css";
import "v-phone-input/dist/v-phone-input.css";
import { createVPhoneInput } from "v-phone-input";

export default defineNuxtPlugin((nuxtApp) => {
  const vPhoneInput = createVPhoneInput({
    countryIconMode: "svg",
    label: "Номер телефона",
    countryLabel: "Страна",
    countryAriaLabel: ({ label }) => `Страна для ${label}`,
    invalidMessage: ({ label, example }) =>
      `${label} должен быть действительным номером телефона (пример: ${example}).`,
  });

  nuxtApp.vueApp.use(vPhoneInput);
});
