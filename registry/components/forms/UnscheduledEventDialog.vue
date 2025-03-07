
<template>
  <FormsEditWindowDialog title="Запись вне расписания" :on-save="saveChanges" :on-close="cancelAndClose" :readonly="false">
    <v-time-picker
        color="primary"
        header-color="primary"
    ></v-time-picker>
  </FormsEditWindowDialog>
</template>

<script setup lang="ts">
import { VTimePicker } from 'vuetify/labs/VTimePicker'

</script>