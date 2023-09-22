<template>
  <v-card width="400" style="min-height: 10dvh;">

    <v-card-title class="mx-2">
      <v-row class="pt-3">
        <div class="text-subtitle-2"> {{ title || '' }}</div>

        <v-spacer></v-spacer>
        <v-icon size="25" @click="closeDialog(close || '0')">mdi-close</v-icon>
      </v-row>
    </v-card-title>


    <v-card-item>

      <v-row class="mb-3 mt-3">
        <v-col cols="2" class="d-flex justify-start align-center">
          <v-icon v-if="icon" size="55" :color="iconColor || void 0">{{ icon }}</v-icon>
        </v-col>
        <v-col>
          <span class="text-body-1">{{ message || "" }}</span>
        </v-col>
      </v-row>

    </v-card-item>
    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn v-for="(value, property) in btns" color="primary" variant="text" @click="() => closeDialog(property)">
        {{ value }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { IActionDialogProps } from './IActionDialogProps';

const props = defineProps<IActionDialogProps>();


</script>
