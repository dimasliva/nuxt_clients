<script lang="ts" setup>
import { useClientAddModalTabPrivacy } from "../../model/hooks/useClientAddModalTabPrivacy";

const { documents,  userInfo } = useClientAddModalTabPrivacy();
</script>
<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex ga-6">
      <LabelInput
        :type="ELabelInput.autocomplete"
        :selectItems="documents"
        :label="$t('document')"
        :placeholder="$t('document')"
        :class-name="'w-100'"
        v-model:value="userInfo.mainDocumentText"
      />
    </div>
    <div class="d-flex ga-6">
      <LabelInput
        :label="$t('seria')"
        :placeholder="$t('seria')"
        :class-name="'w-50'"
        v-model:value="userInfo.mainDocumentSeries"
      />
      <LabelInput
        :label="$t('number')"
        :placeholder="$t('number')"
        :class-name="'w-50'"
        v-model:value="userInfo.mainDocumentNumber"
      />
    </div>

    <div class="d-flex ga-6">
      <LabelInput
        :type="ELabelInput.date"
        :label="$t('issueDate')"
        :placeholder="$t('issueDate')"
        :class-name="'w-50'"
        v-model:value="userInfo.mainDocumentWhen"
      />
      <LabelInput
        :label="$t('departmentCode')"
        :placeholder="$t('departmentCode')"
        :class-name="'w-50'"
        v-model:value="userInfo.mainDocumentWhoCode"
      />
    </div>

    <div class="d-flex ga-6">
      <LabelInput
        :label="$t('issuedBy')"
        :placeholder="$t('issuedBy')"
        :class-name="'w-100'"
        v-model:value="userInfo.mainDocumentWho"
      />
    </div>
  </div>
</template>
