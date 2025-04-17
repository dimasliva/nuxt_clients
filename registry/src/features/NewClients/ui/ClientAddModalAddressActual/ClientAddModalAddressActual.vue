<script lang="ts" setup>
const { actualAddress } = useClientAddModalAddressActual();
</script>
<template>
  <div>
    <FeatureNewClientsUiClientAddModalAddressInputs
      v-model:value="actualAddress"
    />
  </div>
</template>
