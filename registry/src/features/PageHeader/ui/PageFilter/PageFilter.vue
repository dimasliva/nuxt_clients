<template>
  <v-card
    v-show="showFilter"
    class="mb-auto"
    width="23rem"
    style="height: 100%"
  >
    <v-col class="h-100 d-flex flex-column">
      <v-row class="ma-1 flex-grow-0" style="min-width: 200pt" justify="center">
        <v-btn
          color="primary"
          variant="text"
          prepend-icon="mdi-magnify"
          size="small"
          :disabled="isFilterDisable"
          @click="() => {}"
        >
          Поиск
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          prepend-icon="mdi-close"
          @click="resetForm"
          size="small"
        >
          Сбросить
        </v-btn>
        <v-spacer></v-spacer>
        <v-icon @click="hideFilter">mdi-close</v-icon>
      </v-row>
      <v-sheet class="overflow-y-auto overflow-x-hidden flex-grow-1">
        <v-form ref="form" @input="checkFormValidity">
          <template v-for="input in currPage.filterInput" :key="input.title">
            <v-text-field
              v-if="
                input.type === EInputTypes.text ||
                input.type === EInputTypes.email ||
                input.type === EInputTypes.phone
              "
              v-model="input.value"
              :counter="input.constraints.max"
              :hint="input.hint"
              :rules="input.rules"
              :label="input.title"
              :required="input.required"
              @input="checkFormValidity"
            ></v-text-field>
          </template>
        </v-form>
      </v-sheet>
    </v-col>
  </v-card>
</template>

<script setup lang="ts">
import { usePageFilter } from "../../model/hooks/usePageFilter";
import { EInputTypes } from "~/src/features/Page/model/types/page";

const {
  form,
  showFilter,
  isFilterDisable,
  currPage,
  checkFormValidity,
  resetForm,
  hideFilter,
} = usePageFilter();
</script>
