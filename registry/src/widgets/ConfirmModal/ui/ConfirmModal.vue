<template>
  <v-dialog
    v-model="isOpen"
    :max-width="width || 400"
    @keydown.esc="() => emit('cancel')"
  >
    <v-card>
      <v-toolbar dark :color="color" dense flat>
        <v-toolbar-title class="text-body-2 font-weight-bold grey--text">
          {{ title || "Подтверждение" }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text
        class="pa-4 black--text"
        v-html="message || 'Вы уверены?'"
      ></v-card-text>
      <v-card-actions class="pt-3">
        <v-spacer></v-spacer>
        <v-btn
          v-if="!noconfirm"
          color="grey"
          text
          class="body-2 font-weight-bold"
          @click.native="() => emit('cancel')"
          >Отмена</v-btn
        >
        <v-btn
          color="primary"
          class="body-2 font-weight-bold"
          outlined
          :loading="loading"
          @click.native="() => emit('agree')"
          >Да</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import type {IConfirmModalProps} from "../model/types/confirmmodal"

const isOpen = defineModel("isOpen", {
  type: Boolean,
  required: true,
});
defineProps<IConfirmModalProps>();

interface IEmits {
  (e: "cancel"): void;
  (e: "agree"): void;
}

const emit = defineEmits<IEmits>();
</script>
