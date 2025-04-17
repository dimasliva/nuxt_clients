<script lang="ts" setup>
import { useClientAddModalAddressPermanent } from "../../model/hooks/useClientAddModalAddressPermanent";

const { permanentAddress, isActualAddress } =
  useClientAddModalAddressPermanent();
</script>
<template>
  <div>
    <div class="w-100 d-flex justify-end">
      <v-switch
        v-model="isActualAddress"
        color="success"
        :label="$t('matchesTheActual')"
      ></v-switch>
    </div>
    <div>
      <v-expand-transition>
        <div v-show="!isActualAddress">
          <FeatureNewClientsUiClientAddModalAddressInputs
            v-model:value="permanentAddress"
          />
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>
