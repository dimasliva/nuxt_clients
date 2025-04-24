<script lang="ts" setup>
const { userInfo } = useClientAddModalAddressActual();
console.log("userInfo", userInfo.value);
</script>
<template>
  <div>
    <div class="w-100 d-flex justify-end">
      <v-switch
        v-model="userInfo.addresses.addressesEqual"
        color="success"
        :label="$t('matchesTheActual')"
      ></v-switch>
    </div>
    <FeatureNewClientsUiClientAddModalAddressInputs
      v-model:value="userInfo"
      tab="mainAddress"
    />
  </div>
</template>
