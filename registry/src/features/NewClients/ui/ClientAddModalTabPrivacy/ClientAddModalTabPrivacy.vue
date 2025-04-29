<script lang="ts" setup>
import { useClientAddModalTabPrivacy } from "../../model/hooks/useClientAddModalTabPrivacy";

const { documents,  userInfo, numberRules,   } = useClientAddModalTabPrivacy();
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
        v-model:value="userInfo.documents.mainDocumentText"
      />
    </div>
    <div class="d-flex ga-6">
      <LabelInput
        :label="$t('seria')"
        :placeholder="$t('seria')"
        :class-name="'w-50'"
        mask="## ##"
        :rules="[
          numberRules.equal(userInfo.documents.mainDocumentSeries, 5), 
        ]"
        v-model:value="userInfo.documents.mainDocumentSeries"
      />
      <LabelInput
        :label="$t('number')"
        :placeholder="$t('number')"
        :class-name="'w-50'"
        mask="######"
        :rules="[
          numberRules.isNumber(userInfo.documents.mainDocumentNumber), 
          numberRules.equal(userInfo.documents.mainDocumentNumber, 6), 
        ]"
        v-model:value="userInfo.documents.mainDocumentNumber"
      />
    </div>

    <div class="d-flex ga-6">
      <LabelInput
        :type="ELabelInput.date"
        :label="$t('issueDate')"
        :placeholder="$t('issueDate')"
        :class-name="'w-50'"
        v-model:value="userInfo.documents.mainDocumentWhen"
      />
      <LabelInput
        :label="$t('departmentCode')"
        :placeholder="$t('departmentCode')"
        :class-name="'w-50'"
        mask="###-###"
        :rules="[
          numberRules.equal(userInfo.documents.mainDocumentWhoCode, 7), 
        ]"
        v-model:value="userInfo.documents.mainDocumentWhoCode"
      />
    </div>

    <div class="d-flex ga-6">
      <LabelInput
        :label="$t('issuedBy')"
        :placeholder="$t('issuedBy')"
        :class-name="'w-100'"
        v-model:value="userInfo.documents.mainDocumentWho"
      />
    </div>
  </div>
</template>
