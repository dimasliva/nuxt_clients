<script lang="ts" setup>

interface IProps {
  tab: string;
}

const value = defineModel("value", {
  type: Object as () => IOpenUser,
  required: true,
});

const { tab } = defineProps<IProps>();

const { countries, locationTypes, numberRules, regions } =
  useClientAddModalAddressInputs();
</script>
<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex ga-3">
      <LabelInput
        :type="ELabelInput.autocomplete"
        :selectItems="countries"
        :label="$t('country')"
        :placeholder="$t('country')"
        :class-name="'w-50'"
        v-model:value="value.addresses[tab].countryText"
      />
      <LabelInput
        :label="$t('street')"
        :placeholder="$t('street')"
        :class-name="'w-50'"
        v-model:value="value.addresses[tab].street"
      />
    </div>
    <div class="d-flex ga-3">
      <LabelInput
        :type="ELabelInput.autocomplete"
        :selectItems="regions"
        :label="$t('region')"
        :placeholder="$t('region')"
        :class-name="'w-50'"
        v-model:value="value.addresses[tab].regionText"
      />
      <LabelInput
        :label="$t('postalCode')"
        :placeholder="$t('postalCode')"
        :class-name="'w-50'"
        :rules="[
          numberRules.isNumber(value.addresses[tab].zip),
          numberRules.max(value.addresses[tab].zip, 16),
        ]"
        v-model:value="value.addresses[tab].zip"
      />
    </div>
    <div class="d-flex ga-3">
      <LabelInput
        :type="ELabelInput.autocomplete"
        :selectItems="locationTypes"
        :label="$t('localityType')"
        :placeholder="$t('localityType')"
        :class-name="'w-50'"
        v-model:value="value.addresses[tab].settlementText"
      />
      <LabelInput
        :label="$t('localityName')"
        :placeholder="$t('localityName')"
        :class-name="'w-50'"
        v-model:value="value.addresses[tab].settlement"
      />
    </div>
    <div class="d-flex ga-3">
      <LabelInput
        :label="$t('house')"
        :placeholder="$t('house')"
        :class-name="'w-50'"
        :rules="[
          numberRules.isNumber(value.addresses[tab].building),
          numberRules.max(value.addresses[tab].building, 16),
        ]"
        v-model:value="value.addresses[tab].building"
      />
      <LabelInput
        :label="$t('building')"
        :placeholder="$t('building')"
        :class-name="'w-50'"
        :rules="[
          numberRules.isNumber(value.addresses[tab].corp),
          numberRules.max(value.addresses[tab].corp, 8),
        ]"
        v-model:value="value.addresses[tab].corp"
      />
      <LabelInput
        :label="$t('apartment')"
        :placeholder="$t('apartment')"
        :class-name="'w-50'"
        :rules="[
          numberRules.isNumber(value.addresses[tab].flat),
          numberRules.max(value.addresses[tab].flat, 8),
        ]"
        v-model:value="value.addresses[tab].flat"
      />
    </div>
  </div>
</template>
