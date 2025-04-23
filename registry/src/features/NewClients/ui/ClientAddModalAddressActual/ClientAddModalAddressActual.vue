<script lang="ts" setup>
  const { userInfo } = useClientAddModalAddressActual();
  console.log("userInfo", userInfo.value);
</script>
<template>
  <div>
    <FeatureNewClientsUiClientAddModalAddressInputs
      v-model:value="userInfo"
      tab="mainAddress"
    />
  </div>
</template>
