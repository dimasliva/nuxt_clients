<script lang="ts" setup>
import { useClientAddModalTabPrivacy } from '../../model/hooks/useClientAddModalTabPrivacy';

  const {documents, selectedDocument} = useClientAddModalTabPrivacy()
  console.log('documents', documents)
</script>
<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex ga-6">
      <div class="w-100">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("document") }}
        </div>

        <v-select 
          :items="documents"
          v-model="selectedDocument"

          ></v-select>
      </div>
    </div>
    <div class="d-flex ga-6">
      <div class="w-50">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("seria") }}
        </div>

        <v-text-field :placeholder="$t('seria')" clearable></v-text-field>
      </div>
      <div class="w-50">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("number") }}
        </div>
        <v-text-field :placeholder="$t('number')" clearable></v-text-field>
      </div>
    </div>

    <div class="d-flex ga-6">
      <div class="w-50">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("issueDate") }}
        </div>
        <v-date-input  prepend-icon="" clearable></v-date-input>
      </div>
      <div class="w-50">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("departmentCode") }}
        </div>

        <v-text-field :placeholder="$t('departmentCode')" clearable></v-text-field>
      </div>

    </div>

    <div class="d-flex ga-6">
      <div class="w-100">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("issuedBy") }}
        </div>

        <v-text-field :placeholder="$t('issuedBy')" clearable></v-text-field>
      </div>
    </div>
  </div>
</template>
