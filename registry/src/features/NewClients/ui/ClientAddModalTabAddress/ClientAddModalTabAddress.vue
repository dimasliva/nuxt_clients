<script lang="ts" setup>
const { activeTab, userInfo } = useClientAddModalTabAddress();
</script>
<template>
  <div class="mb-4">
    <v-tabs v-model="activeTab" align-tabs="start">
      <v-tab :value="EAddressTabs.actual">{{ $t("actualResidence") }}</v-tab>
      <v-tab
        :value="EAddressTabs.permanent"
        v-if="!userInfo.addresses.addressesEqual"
      >
        {{ $t("permanentRegistration") }}
      </v-tab>
    </v-tabs>
  </div>
  <v-tabs-window v-model="activeTab">
    <v-tabs-window-item :key="EAddressTabs.actual" :value="EAddressTabs.actual">
      <FeatureNewClientsUiClientAddModalAddressActual />
    </v-tabs-window-item>
    <v-tabs-window-item
      :key="EAddressTabs.permanent"
      :value="EAddressTabs.permanent"
      v-if="!userInfo.addresses.addressesEqual"
    >
      <FeatureNewClientsUiClientAddModalTabAddressPermanent />
    </v-tabs-window-item>
  </v-tabs-window>
</template>
