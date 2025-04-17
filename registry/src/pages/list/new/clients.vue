<template>
  <div>
    <FeatureNewClientsUiClientAddModal
    v-model:open-user-id="openUserId"
      :title="$t('clientProfile')"
      :is-open="isOpenAddModal"
      @onSave="closeAddModal"
      @onSaveAndClose="closeAddModal"
      @onClose="closeAddModal"
    />
    <PageTable
      
      :table-descr="tableDescr"
      :columns="tableData.columns"
      :allColumns="allTableColumns"
      :rows="tableData.rows"
      :selectedTitleCol="selectedTitleCol"
    />
  </div>
</template>
<script setup lang="ts">
const {
  openUserId,
  allTableColumns,
  tableData,
  tableDescr,
  selectedTitleCol,
  isOpenAddModal,
  closeAddModal,
} = useNewClients();

definePageMeta({
  layout: "page",
});
</script>
