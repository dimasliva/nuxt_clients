
<template>
  <EditWindowDialog title="Запись вне расписания" :on-save="saveChanges" :on-close="cancelAndClose" :readonly="false">
    <v-time-picker
        color="primary"
        header-color="primary"
    ></v-time-picker>
  </EditWindowDialog>
</template>

<script setup lang="ts">
import  EditWindowDialog from '../EditWindowDialog.vue'
import { VTimePicker } from 'vuetify/labs/VTimePicker'

</script>