<script lang="ts" setup>
import { ELabelInput } from "../model/types/labelInput";

interface IProps {
  label?: string;
  placeholder?: string;
  className?: string;
  type?: ELabelInput;
  selectItems?: string[];

}
const { label, className, placeholder } = defineProps<IProps>();

const value = defineModel('value') as Ref<string>;

</script>
<template>
  <div :class="className">
    <div class="text-subtitle-1 text-medium-emphasis">
      {{ label }}
    </div>

    <v-text-field
      v-if="!type || type === ELabelInput.text"
      v-model="value"
      :placeholder="placeholder"
    ></v-text-field>

    <v-date-input
      v-else-if="type === ELabelInput.date"
      v-model="value"
      :label="label"
      prepend-icon=""
    ></v-date-input>
    <v-select
      v-else-if="type === ELabelInput.select"
      v-model="value"
      :placeholder="placeholder"
      :items="selectItems"
    ></v-select>
  </div>
</template>
