<script lang="ts" setup>
import { useClientAddModalTabContact } from "../../model/hooks/useClientAddModalTabContact";

const { userInfo } = useClientAddModalTabContact();
</script>
<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex ga-6">
      <LabelInput
        :type="ELabelInput.phone"
        :label="$t('mainphone')"
        :placeholder="$t('mainphone')"
        :class-name="'w-100'"
        v-model:value="userInfo.contacts.mainPhone"
      />
      <LabelInput
        :type="ELabelInput.phone"
        :label="$t('backupphone')"
        :placeholder="$t('backupphone')"
        :class-name="'w-100'"
        v-model:value="userInfo.contacts.reservPhone"
      />
    </div>

    <div class="d-flex ga-6">
      <LabelInput
        :type="ELabelInput.email"
        :label="$t('email')"
        :placeholder="$t('email')"
        :class-name="'w-100'"
        v-model:value="userInfo.contacts.mainEmail"
      />
    </div>
  </div>
</template>
