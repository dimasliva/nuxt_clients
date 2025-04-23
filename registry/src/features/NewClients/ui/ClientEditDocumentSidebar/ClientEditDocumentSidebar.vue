<script lang="ts" setup>
import { useClientEditDocumentSidebar } from "../../model/hooks/useClientEditDocumentSidebar";

const {
  valid,
  textRules,
  numberRules,
  isEditDocument,
  editOtherDocument,
  t,
  onSave,
  onClose,
} = useClientEditDocumentSidebar();
</script>

<template>
  <v-dialog v-model="isEditDocument" width="500">
    <v-card>
      <v-card-title class="headline black" primary-title>
        {{ t("documentModification") }}
      </v-card-title>
      <v-card-text class="pa-5">
        <v-form ref="sendForm" v-model="valid" lazy-validation>
          <v-text-field
            v-model="editOtherDocument.serial"
            :label="t('seria')"
            :rules="[numberRules.isNumber, numberRules.required]"
          ></v-text-field>
          <v-text-field
            v-model="editOtherDocument.number"
            :label="t('number')"
            :rules="[numberRules.isNumber, numberRules.required]"
          ></v-text-field>
          <VDateInput
            v-model="editOtherDocument.when"
            :label="t('issueDate')"
            :rules="[textRules.required]"
          ></VDateInput>
          <v-textarea
            v-model="editOtherDocument.comment"
            :label="t('comment')"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions class="pa-5">
        <v-btn @click="onClose()" outlined color="primary">
          {{ t("cancel") }}
        </v-btn>
        <v-btn @click="onSave()" outlined color="primary">
          {{ t("modify") }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
