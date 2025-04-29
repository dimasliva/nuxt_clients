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
    <PageTable
      :table-descr="tableDescr"
      :columns="tableData.columns"
      :allColumns="allTableColumns"
      :rows="tableData.rows"
      :selectedTitleCol="selectedTitleCol"
      notFoundRow="Клиенты не найдены"
      @onOpen="onRowClicked"
    />
  </div>
</template>
<script setup lang="ts">
import ConfirmModal from '~/src/widgets/ConfirmModal/ui/ConfirmModal.vue';

const {
  tableData,
  tableDescr,
  isOpenAddModal,
  allTableColumns,
  selectedTitleCol,
  isPendingDeleteClient,
  openDeleteConfirmModal,
  onAddModal,
  onRowClicked,
  saveAddModal,
  closeAddModal,
  onConfirmDelete,
  onAddAndCloseModal,
  onCancelDeleteModal,
} = useNewClients();

definePageMeta({
  layout: "page",
});
</script>
