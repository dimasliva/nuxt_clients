<script lang="ts" setup>
import { useClientAddModalAddressInputs } from "../../model/hooks/useClientAddModalAddressInputs";
import type { IActualAddress } from "../../model/types/clients";

const value = defineModel("value", {
  type: Object as () => IActualAddress,
  required: true,
});

const {
  countries,
  locationTypes,
  regions,
} = useClientAddModalAddressInputs();

</script>
<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex ga-3">
      <LabelInput
        :type="ELabelInput.select"
        :selectItems="countries"
        :label="$t('country')"
        :placeholder="$t('country')"
        :class-name="'w-50'"
        v-model:value="value.county"
      />
      <LabelInput
        :label="$t('street')"
        :placeholder="$t('street')"
        :class-name="'w-50'"
        v-model:value="value.street"
      />
    </div>
    <div class="d-flex ga-3">
      <LabelInput
        :type="ELabelInput.select"
        :selectItems="regions"
        :label="$t('region')"
        :placeholder="$t('region')"
        :class-name="'w-50'"
        v-model:value="value.region"
      />
      <LabelInput
        :label="$t('postalCode')"
        :placeholder="$t('postalCode')"
        :class-name="'w-50'"
        v-model:value="value.postalCode"
      />

    </div>
    <div class="d-flex ga-3">
      <LabelInput
        :type="ELabelInput.select"
        :selectItems="locationTypes"
        :label="$t('localityType')"
        :placeholder="$t('localityType')"
        :class-name="'w-50'"
        v-model:value="value.localityType"
      />
      <LabelInput
        :label="$t('localityName')"
        :placeholder="$t('localityName')"
        :class-name="'w-50'"
        v-model:value="value.localityName"
      />
    </div>
    <div class="d-flex ga-3">
      <LabelInput
        :label="$t('house')"
        :placeholder="$t('house')"
        :class-name="'w-50'"
        v-model:value="value.house"
      />
      <LabelInput
        :label="$t('building')"
        :placeholder="$t('building')"
        :class-name="'w-50'"
        v-model:value="value.building"
      />
      <LabelInput
        :label="$t('apartment')"
        :placeholder="$t('apartment')"
        :class-name="'w-50'"
        v-model:value="value.apartment"
      />
    </div>
    
  </div>
</template>
