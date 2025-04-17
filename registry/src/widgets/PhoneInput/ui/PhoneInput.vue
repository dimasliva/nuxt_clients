<script setup lang="ts">
import "flag-icons/css/flag-icons.min.css";
import "v-phone-input/dist/v-phone-input.css";
import { VPhoneInput } from "v-phone-input";

interface IProps {
  readonly?: boolean;
  label?: string;
}

interface IEmits {
  (e: "onBlur", event: FocusEvent): void; 
  (e: "onKeyDown", event: KeyboardEvent): void; 
}

const emit = defineEmits<IEmits>();

const value = defineModel<string>();

defineProps<IProps>();
</script>
<template>
  <VPhoneInput
    ref="refField"
    type="text"
    :readonly="readonly"
    defaultCountry="RU"
    countryIconMode="svg"
    displayFormat="international"
    clearable
    v-model="value"
    :label="label"
    countryLabel=""
    @blur="(d) => emit('onBlur', d)"
    @keydown.stop="(k) => emit('onKeyDown', k)"
  ></VPhoneInput>
</template>
