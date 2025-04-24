<script lang="ts" setup>
const { activeTab,  userInfo} = useClientAddModalTabAddress();
</script>
<template>
  <div class="mb-4">
    <FeatureNewClientsUiClientAddModalAddressTabs
      v-model:activeTab="activeTab"
    />
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
