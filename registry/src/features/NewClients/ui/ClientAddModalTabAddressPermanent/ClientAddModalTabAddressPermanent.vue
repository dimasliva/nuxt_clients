<script lang="ts" setup>
const { userInfo } = useClientAddModalAddressPermanent();
</script>
<template>
  <div>
    <FeatureNewClientsUiClientAddModalAddressInputs
      v-model:value="userInfo"
      tab="permanentRegistration"
    />
  </div>
</template>
