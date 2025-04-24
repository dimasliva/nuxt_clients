<template>
  <div>
    <FeatureNewClientsUiClientAddModal
      :is-open="isOpenAddModal"
      @onSaveAndClose="closeAddModal"
      @onClose="closeAddModal"
      @onSave="saveAddModal"
      @onAdd="onAddModal"
      @onAddAndClose="onAddAndCloseModal"
    />
    <PageTable
      :table-descr="tableDescr"dwdw
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
  onAddModal,
  onAddAndCloseModal,
} = useNewClients();

definePageMeta({
  layout: "page",
});

</script>
