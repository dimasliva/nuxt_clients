<script lang="ts" setup>
import { useClientAddModalTabs } from '../../model/hooks/useClientAddModalTabs';
import { EClientTabs } from '../../model/types/clients';

  const {activeTab} = useClientAddModalTabs()
</script>
<template>
  <v-tabs v-model="activeTab" color="primary" direction="vertical">
    <v-tab
      prepend-icon="mdi-account"
      :text="$t('phofile')"
      :value="EClientTabs.profile"
    ></v-tab>
    <v-tab
      prepend-icon="mdi-contacts"
      :text="$t('contacts')"
      :value="EClientTabs.contacts"
    ></v-tab>
    <v-tab
      prepend-icon="mdi-lock"
      :text="$t('identityDocument')"
      :value="EClientTabs.privacy"
    ></v-tab>
    <v-tab
      prepend-icon="mdi-text-box-multiple"
      :text="$t('otherDocuments')"
      :value="EClientTabs.documents"
    ></v-tab>
    <v-tab
      prepend-icon="mdi-map-marker"
      :text="$t('addresses')"
      :value="EClientTabs.addresses"
    ></v-tab>
  </v-tabs>
</template>
