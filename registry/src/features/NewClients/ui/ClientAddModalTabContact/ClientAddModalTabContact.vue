<script lang="ts" setup>
import PhoneInput from "~/src/widgets/PhoneInput/ui/PhoneInput.vue";
import { useClientAddModalTabContact } from "../../model/hooks/useClientAddModalTabContact";
import EmailInput from "~/src/widgets/EmailInput/ui/EmailInput.vue";

const { userInfo } = useClientAddModalTabContact();
</script>
<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex ga-6">
      <div class="w-100">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("mainphone") }}
        </div>
        <PhoneInput v-model="userInfo.mainPhone" :label="$t('mainphone')" />
      </div>
    </div>
    <div class="d-flex ga-6">
      <div class="w-100">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("backupphone") }}
        </div>
        <PhoneInput v-model="userInfo.reservPhone" :label="$t('backupphone')" />
      </div>
    </div>
    <div class="d-flex ga-6">
      <div class="w-100">
        <div class="text-subtitle-1 text-medium-emphasis">
          {{ $t("email") }}
        </div>
        <EmailInput v-model="userInfo.mainEmail" :label="$t('email')" />
      </div>
    </div>
  </div>
</template>
