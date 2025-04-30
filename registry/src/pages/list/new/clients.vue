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
    <ConfirmModal 
      v-model:isOpen="openDeleteConfirmModal.isOpen"
      :message="`Вы уверены, что хотите удалить <b> ${openDeleteConfirmModal.value}</b>?`"
      :loading="isPendingDeleteClient"
      @cancel="onCancelDeleteModal"
      @agree="onConfirmDelete"
    />
    <ConfirmModal 
      v-model:isOpen="openMultipleDeleteConfirmModal.isOpen"
      :message="`Вы уверены, что хотите удалить: </br> <b> ${openMultipleDeleteConfirmModal.value}</b>?`"
      :loading="isPendingDeleteClient"
      @cancel="onCancelMultipleDeleteModal"
      @agree="onConfirmMultipleDelete"
    />
    
    <PageTable
      ref="pageTableRef"
      :table-descr="tableDescr"
      :columns="tableData.columns"
      :allColumns="allTableColumns"
      :rows="tableData.rows"
      :selectedTitleCol="selectedTitleCol"
      notFoundRow="Клиенты не найдены"
      @onOpen="onRowClicked"
      @onDeleteList="onDeleteListHandler"
    />
  </div>
</template>
<script setup lang="ts">

const {
  tableData,
  tableDescr,
  pageTableRef,
  isOpenAddModal,
  allTableColumns,
  selectedTitleCol,
  isPendingDeleteClient,
  openDeleteConfirmModal,
  openMultipleDeleteConfirmModal,
  onAddModal,
  onRowClicked,
  saveAddModal,
  closeAddModal,
  onConfirmDelete,
  onAddAndCloseModal,
  onDeleteListHandler,
  onCancelDeleteModal,
  onConfirmMultipleDelete,
  onCancelMultipleDeleteModal,
} = useNewClients();

definePageMeta({
  layout: "page",
});
</script>
