<template>
  <div>
    <FeatureNewClientsUiClientAddModal
      :title="$t('clientProfile')"
      :is-open="isOpenAddModal"
      @onSave="saveAddModal"
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
  allTableColumns,
  tableData,
  tableDescr,
  selectedTitleCol,
  isOpenAddModal,
  saveAddModal,
  closeAddModal,
} = useNewClients();

definePageMeta({
  layout: "page",
});
</script>
