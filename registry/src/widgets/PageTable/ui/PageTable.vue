<template>
  <div style="height: 100%" class="d-flex flex-column">
    <div class="flex-grow-1" style="min-height: 10rem">
      <VDataTable
        ref="tableElem"
        v-model="selected"
        show-select
        item-value="id"
        v-model:items-per-page="itemsPerPage"
        hover
        :headers="_headers"
        hide-default-footer
        v-model:page="currentPage"
        :items="props.rows"
        height="calc(100vh - 270px)"
        class="elevation-1"
        fixed-header
        :selectStrategy="selectStrategy"
        style="width: 100%"
      >
        <!-- меню действий-->
        <template v-slot:header.actions="{ column }">
          <VMenu :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <VBtn v-bind="props" icon="mdi-menu" variant="text"> </VBtn>
            </template>

            <template v-slot:default="{ isActive }">
              <VList>
                <VListItem link>
                  <VListItemTitle>Настрока столбцов</VListItemTitle>
                  <template v-slot:append>
                    <v-icon icon="mdi-menu-right" size="x-small"></v-icon>
                  </template>

                  <VMenu
                    :open-on-focus="false"
                    activator="parent"
                    submenu
                    :close-on-content-click="false"
                  >
                    <v-card class="mx-auto" max-width="400">
                      <VList>
                        <VListItem v-for="val in allColumns" :key="val.key">
                          <template v-slot:prepend="{ isActive }">
                            <VListItemAction start>
                              <v-checkbox-btn
                                :model-value="selectedColumns.includes(val.key)"
                                @update:modelValue="
                                  (e) => toggleSelectColumn(e, val.key)
                                "
                              ></v-checkbox-btn>
                            </VListItemAction>
                          </template>
                          <VListItemTitle>{{ val.title || "" }}</VListItemTitle>
                        </VListItem>
                      </VList>
                      <div class="d-flex align-center mb-2 mx-2">
                        <VBtn
                          color="primary"
                          variant="text"
                          @click="$emit('onColumnsChanged', props.columns)"
                        >
                          {{ $t("reload") }}
                        </VBtn>
                        <VBtn
                          color="primary"
                          variant="text"
                          @click="resetSelectedColumns"
                        >
                          {{ $t("reset") }}
                        </VBtn>
                      </div>
                    </v-card>
                  </VMenu>
                </VListItem>
              </VList>
            </template>
          </VMenu>
        </template>

        <!-- строки таблицы -->
        <template v-slot:item="{ internalItem, index }">
          <VDataTableRow
            :index="index"
            :item="internalItem"
            :class="
              internalItem.raw.id == lineSelected ? 'lineSelectedRow' : ''
            "
            @click="() => onRowClick(internalItem)"
          >
            <!-- Колонка "actions". Кнопка меню возможных действий -->
            <template v-slot:item.actions="{ item }">
              <v-menu
                scrollStrategy="close"
                v-if="props.tableDescr.actionsMenu"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    variant="text"
                    @click="() => (lineSelected = internalItem.raw.id)"
                  ></v-btn>
                </template>

                <template v-slot:default="{ isActive }">
                  <v-list
                    @mouseleave="
                      (e) => {
                        isActive.value = false;
                      }
                    "
                  >
                    <v-list-item
                      v-for="action in getActionsMenu(internalItem)"
                      @click="() => action.action(internalItem)"
                    >
                      <v-icon :icon="action.icon" size="x-small" />
                      {{ action.title }}
                    </v-list-item>
                  </v-list>
                </template>
              </v-menu>
            </template>
            <template
              v-for="val in accessibleCols"
              #[`item.${val}`]="{ internalItem }"
            >
              <div :class="getDataAlignClass(val)">
                {{ internalItem.columns[val] }}
              </div>
            </template>

            <template v-for="val in notAccessibleCols" #[`item.${val}`]>
              -
            </template>
          </VDataTableRow>
        </template>

        <template v-slot:bottom />
      </VDataTable>
    </div>
    <!-- Нижняя строка статистики -->
    <v-row
      class="pt-5 w-100 mb-1 pr-0"
      justify="start"
      style="min-height: 6rem; max-height: 6rem"
    >
      <VCol class="font-italic text-body-2 pr-0 pt-0">
        <div>Всего:{{ props.rows.length }}</div>
        <!-- Кнопка отображения выбранных элементов -->
        <SelectedItemsView
          :items="rowsToSelectViewDictVal()"
          @onRemoveItem="(item, inx) => selected.splice(inx, 1)"
          @onClearList="() => (selected.length = 0)"
        >
          <template #activator="{ props }">
            <VBtn
              :disabled="!selectedTitleCol"
              v-bind="props"
              variant="text"
              size="small"
              style="text-transform: none; padding-bottom: 2px"
              class="font-italic text-body-2 pl-0 pr-0"
              >Выбрано:{{ selected.length }}
            </VBtn>
          </template>
        </SelectedItemsView>
      </VCol>

      <!--Выбор текущей страницы -->
      <VCol
        lg="6"
        md="7"
        sm="8"
        xs="9"
        class="pl-0 pr-0"
        style="min-width: 650px"
      >
        <v-row justify="end">
          <v-pagination
            ref="refPag"
            v-model="currentPage"
            :length="pagesCount"
            :total-visible="6"
            @update:modelValue="() => scrollTo(0, 0)"
          />
          <v-select
            style="max-width: 15dvh; height: 10px"
            v-model="itemsPerPage"
            @change="onItemsPerPageChange"
            label="На странице"
            :items="[5, 10, 25, 50, 100]"
            variant="solo"
          ></v-select>
        </v-row>
      </VCol>
      <v-col />
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { usePageTable } from "../model/hooks/usePageTable";
import type { IPageTableProps, ITableColumn } from "../model/types/pagetable";
const props = defineProps<IPageTableProps>();

interface IEmits {
  (e: "onColumnsChanged", columns: ITableColumn[]): void;
}

const emit = defineEmits<IEmits>();

const {
  tableElem,
  selected,
  currentPage,
  itemsPerPage,
  selectStrategy,
  _headers,
  accessibleColItems,
  selectedColumns,
  lineSelected,
  notAccessibleCols,
  accessibleCols,
  pagesCount,
  rowsToSelectViewDictVal,
  resetSelectedColumns,
  onItemsPerPageChange,
  onRowClick,
  getActionsMenu,
  getDataAlignClass,
  toggleSelectColumn,
  scrollTo,
} = usePageTable(props);
</script>
