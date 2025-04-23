<template>
  <div>
    <FeatureNewClientsUiClientAddModal
      :title="$t('clientProfile')"
      :is-open="isOpenAddModal"
      @onSaveAndClose="closeAddModal"
      @onClose="closeAddModal"
      @onSave="saveAddModal"
    />
    <PageTable
      :table-descr="tableDescr"
      :columns="tableData.columns"
      :allColumns="allTableColumns"
      :rows="tableData.rows"
      :selectedTitleCol="selectedTitleCol"
      @onOpen="onRowClicked"
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
  onRowClicked,
} = useNewClients();

definePageMeta({
  layout: "page",
});
</script>
