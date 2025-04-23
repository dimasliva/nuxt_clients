<script lang="ts" setup>
  const activeTab = defineModel("activeTab", {required: true})
</script>
<template>
  <v-tabs v-model="activeTab" align-tabs="start" >
    <v-tab :value="EAddressTabs.actual">{{$t("actualResidence")}}</v-tab>
    <v-tab :value="EAddressTabs.permanent">{{$t("permanentRegistration")}}</v-tab>
  </v-tabs>
</template>
