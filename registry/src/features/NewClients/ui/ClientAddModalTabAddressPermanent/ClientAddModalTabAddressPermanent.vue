<script lang="ts" setup>
const { userInfo } = useClientAddModalAddressPermanent();
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
    <div>
      <v-expand-transition>
        <div v-show="!userInfo.addresses.addressesEqual">
          <FeatureNewClientsUiClientAddModalAddressInputs
            v-model:value="userInfo"
            tab="permanentRegistration"
          />
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>
