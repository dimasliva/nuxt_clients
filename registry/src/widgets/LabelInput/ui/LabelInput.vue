<script lang="ts" setup>
import type { ValidationRule } from "vuetify/lib/types.mjs";
import { ELabelInput } from "../model/types/labelInput";

interface IProps {
  label?: string;
  placeholder?: string;
  className?: string;
  type?: ELabelInput;
  required?: boolean;
  rules?: ValidationRule[];
  selectItems?: string[];
}
const { label, className, placeholder } = defineProps<IProps>();

const value = defineModel("value") as Ref<string>;
</script>
<template>
  <div :class="className">
    <div class="text-subtitle-1 text-medium-emphasis">
      {{ label }}
      <span v-if="required" class="text-red">*</span>
    </div>

    <v-text-field
      v-if="!type || type === ELabelInput.text"
      v-model="value"
      :placeholder="placeholder"
      :rules="rules"
    ></v-text-field>

    <v-date-input
      v-else-if="type === ELabelInput.date"
      v-model="value"
      :label="label"
      prepend-icon=""
      :rules="rules"
      autocomplete="off"
    ></v-date-input>
    <v-select
      v-else-if="type === ELabelInput.select"
      v-model="value"
      :placeholder="placeholder"
      :items="selectItems"
      :rules="rules"
    ></v-select>
    <v-autocomplete
      v-else-if="type === ELabelInput.autocomplete"
      v-model="value"
      :placeholder="placeholder"
      :items="selectItems"
      :rules="rules"
    ></v-autocomplete>

    <PhoneInput v-else-if="type === ELabelInput.phone" v-model:value="value" />

    <EmailInput
      v-else-if="type === ELabelInput.email"
      v-model="value"
      :label="label"
    />
  </div>
</template>
