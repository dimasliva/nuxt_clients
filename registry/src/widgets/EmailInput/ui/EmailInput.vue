<script setup lang="ts">
interface IProps {
  label?: string;
}
defineProps<IProps>()

const { emailRules } = useRules()
const value = defineModel()

</script>
<template>
  <v-text-field
    v-model="value"
    :rules="[emailRules.email]"
    :label="label"
  ></v-text-field>
</template>
