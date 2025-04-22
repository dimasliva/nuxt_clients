<script lang="ts" setup>
const {  userInfo } = useClientAddModalAddressActual();
</script>
<template>
  <div>
    <FeatureNewClientsUiClientAddModalAddressInputs
      v-model:value="userInfo"
      tab="mainAddress"
    />
  </div>
</template>
