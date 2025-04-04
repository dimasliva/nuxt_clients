<template>
    <div v-if="visibility" style="height: 100%; " class="d-flex flex-column">
        <div class="flex-grow-1" style="min-height:10rem; ">
            <v-data-table ref="refDt" v-model="selected" show-select item-value="id"
                v-model:items-per-page="itemsPerPage" hover :headers="_headers" hide-default-footer
                v-model:page="currentPage" :items="props.rows" class="elevation-1 h-100" fixed-header
                :selectStrategy="selectStrategy" style="width: 100%;">


                <!-- меню действий-->
                <template v-slot:header.actions="{ column }">

                    <v-menu :close-on-content-click="false">

                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" icon="mdi-menu" variant="text"> </v-btn>
                        </template>

                        <template v-slot:default="{ isActive }">

                            <v-list>
                                <v-list-item link>
                                    <v-list-item-title>Настрока столбцов</v-list-item-title>
                                    <template v-slot:append>
                                        <v-icon icon="mdi-menu-right" size="x-small"></v-icon>
                                    </template>

                                    <!-- настройка колонок-->
                                    <v-menu :open-on-focus="false" activator="parent" submenu
                                        :close-on-content-click="false">
                                        <v-card class="mx-auto" max-width="400">
                                            <v-list>
                                                <v-list-item v-for="val in accessibleColItems">
                                                    <template v-slot:prepend="{ isActive }">
                                                        <v-list-item-action start>
                                                            <v-checkbox-btn :model-value="columns.includes(val.key)"
                                                                @update:modelValue="(e) => toggleSelectColumn(e, val.key)"></v-checkbox-btn>
                                                        </v-list-item-action>
                                                    </template>
                                                    <v-list-item-title>{{ val.title || "" }}</v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                            <VBtn class="ml-5 mb-5" color="primary" variant="text"
                                                @click="$emit('onColumnsChanged', props.columns)">
                                                Обновить
                                            </VBtn>
                                            <VBtn class="mr-5 mb-5" color="primary" variant="text"
                                                @click="() => columns.length = 0">
                                                Сбросить
                                            </VBtn>
                                        </v-card>
                                    </v-menu>
                                </v-list-item>
                            </v-list>

                        </template>
                    </v-menu>

                </template>


                <!-- строки таблицы -->
                <template v-slot:item="{ internalItem, index }">
                    <VDataTableRow :index="index" :item="internalItem"
                        :class="internalItem.raw.id == lineSelected ? 'lineSelectedRow' : ''"
                        @click="(e) => { onRowClick(internalItem) }">

                        <!-- Колонка "actions". Кнопка меню возможных действий -->
                        <template v-slot:item.actions="{ item }">
                            <v-menu scrollStrategy="close" v-if="props.tableDescr.actionsMenu">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text"
                                        @click="() => lineSelected = internalItem.raw.id"></v-btn>
                                </template>

                                <template v-slot:default="{ isActive }">
                                    <v-list @mouseleave="(e) => { isActive.value = false }">
                                        <v-list-item v-for="action in getActionsMenu(internalItem)"
                                            @click-once="() => action.action(internalItem)">
                                            <v-icon :icon="action.icon" size="x-small" />
                                            {{ action.title }}
                                        </v-list-item>
                                    </v-list>
                                </template>
                            </v-menu>
                        </template>

                        <template v-for="val in accessibleCols" #[`item.${val}`]="{ internalItem }">
                            <div :class="getDataAlignClass(val)"> {{ internalItem.columns[val] }} </div>
                        </template>

                        <template v-for="val in notAccessibleCols" #[`item.${val}`]>
                            -
                        </template>

                    </VDataTableRow>
                </template>

                <template v-slot:bottom />
            </v-data-table>
        </div>

        <!-- Нижняя строка статистики -->
        <v-row class="text-center pt-5 w-100 mb-1 pr-0" justify="start" style="min-height: 6rem; max-height: 6rem; ">
            <v-col align="start" class="font-italic text-body-2 pr-0 pt-0">
                Всего:{{ props.rows.length }}
                <!-- Кнопка отображения выбранных элементов -->
                <SelectedItemsView :items="rowsToSelectViewDictVal()"
                    @onRemoveItem="(item, inx) => selected.splice(inx, 1)" @onClearList="() => selected.length = 0">
                    <template #activator="{ props }">
                        <v-btn :disabled="!titleColName" v-bind="props" variant="text" size="small"
                            style="text-transform:none; padding-bottom: 2px;"
                            class="font-italic text-body-2 pl-0 pr-0">Выбрано:{{ selected.length }}
                        </v-btn>
                    </template>
                </SelectedItemsView>
            </v-col>

            <!--Выбор текущей страницы -->
            <v-col lg="6" md="7" sm="8" xs="9" class="pl-0 pr-0" style="min-width: 650px;">
                <v-row justify="center">
                    <v-pagination ref="refPag" v-model="currentPage" :length="pagesCount" :total-visible="6"
                        @update:modelValue="() => scrollTo(0, 0)" />
                    <v-select style="max-width: 15dvh; height: 10px;" :model-value="itemsPerPage" label="На странице"
                        :items="[10, 12, 25, 50, 100]" variant="solo"
                        @update:model-value="itemsPerPage = parseInt(<string><unknown>$event, 10)"></v-select>
                </v-row>
            </v-col>
            <v-col />
        </v-row>
    </div>
</template>


<script setup lang="ts">
import { UserContext } from '~/src/common/lib/UserContext';
import { VDataTable, VDataTableRow } from 'vuetify/components/VDataTable'
import { chkRights } from "~/src/common/lib/Utils"
import { useVTableScroll } from "~/src/ui_base/composibles/useVTableScroll"
import type { IDataTableDescription } from './types';
import SelectedItemsView from '~/src/components/SelectedItemsView.vue'
import type { TDictViewVal } from '~uilib/FinderDataProviders/FinderDataProvider';
import type { IDataTableProps } from './types';



const emit = defineEmits(['onRowDblClick', 'onRowClick', "onColumnsChanged", "onColumnsChangedDelayed"])

const props = defineProps<IDataTableProps>();

let itemsPerPage = ref(12);
let currentPage = ref(1);
let selected = ref(props.selected?.map(v => v.value) || []);
let selectedValTitleMap = new Map(props.selected?.map(obj => [obj.value, obj.title || ""]));
let refDt = ref(null);
let refPag = ref();
const classMap = { "start": "d-flex justify-start", "center": "d-flex justify-center mr-5", "end": "d-flex justify-end" }

let clckInterval: any = null;
let lineSelected = ref();

const iocc = useContainer();
//const userCtx = iocc.get<UserContext>('UserContext');

const { scrollTo } = useVTableScroll(refDt);


const pagesCount = computed(() => {
    if (props.rows.length % itemsPerPage.value == 0)
        return Math.floor(props.rows.length / itemsPerPage.value);
    else
        return Math.floor(props.rows.length / itemsPerPage.value) + 1;
});


const notAccessibleCols = ref<string[]>([]);
const accessibleCols = ref<string[]>([]);
const accessibleColItems = ref<any[]>([]);


props.tableDescr.headers.forEach((item) => {
    if (!chkRights(null, item.traits))
        notAccessibleCols.value.push(item.key)
    else {
        accessibleCols.value.push(item.key);
        accessibleColItems.value.push(item);
    }
});


const _headers = computed(() => {
    const res: any[] = [{ key: "actions", align: 'start', width: "10", sortable: false, title: "" }];

    props.columns.forEach((item) => {
        let headerItem = accessibleColItems.value.find((el) => el.key == item)
        if (headerItem)
            res.push(headerItem);
    });

    res.push({ key: "_space", sortable: false, title: "" })
    return res;
});



const _headersMap = computed(() => {

    let res: any = {};

    _headers.value.forEach((item) => {
        res[item.key] = item;
    });

    return res;
});



const getActionsMenu = (item: any) => {
    const res: any[] = [];
    let menu = props.tableDescr.actionsMenu!(item);
    menu.forEach((item) => {
        if (chkRights(null, item.traits))
            res.push(item)
    });
    return res;
};


const addCurrPage = (step: number) => {
    currentPage.value += step;
    if (currentPage.value > pagesCount.value)
        currentPage.value = pagesCount.value
    else
        if (currentPage.value < 1)
            currentPage.value = 1;
}


const onRowClick = (dtitem: any) => {

    lineSelected.value = dtitem.raw.id;

    if (!clckInterval)
        clckInterval = setInterval(() => {
            //click
            clearInterval(clckInterval);
            clckInterval = null;
            emit('onRowClick', dtitem);
        }, 300);

    else {//dblclick
        clearInterval(clckInterval);
        clckInterval = null;
        emit('onRowDblClick', dtitem);
    }


};


const reset = (inclSelected = false) => {
    currentPage.value = 1;
    if (inclSelected) selected.value.length = 0;
    lineSelected.value = null;
    scrollTo(0, 0);
}


const getDataAlignClass = (val: string) => {
    return classMap[_headersMap.value[val].alignData] || ''
}

let colChangeTimeout: any = null;

const clearChangeTimeout = () => {
    if (colChangeTimeout)
        clearTimeout(colChangeTimeout);
    colChangeTimeout = null;
}

const toggleSelectColumn = (e, colName: string) => {
    let inx = props.columns.indexOf(colName);
    if (inx == -1)
        props.columns.push(colName);
    else
        props.columns.splice(inx, 1);

    clearChangeTimeout();

    colChangeTimeout = setTimeout(() => emit("onColumnsChangedDelayed", props.columns), 3000);
}


const getSelected = () => {
    return selected.value;
}


let mapRows: Map<string, string> = new Map();

watch(() => props.rows, () => {
    mapRows = new Map(props.rows.map(obj => [obj.id, props.titleColName ? obj[props.titleColName] : ""]));
}, { deep: true });


const rowsToSelectViewDictVal = () => {
    if (selected.value.length == 0)
        selectedValTitleMap.clear();

    const res: TDictViewVal[] = [];

    return selected.value.map(v => {

        let title = selectedValTitleMap.get(v as string);

        if (!title) {
            title = mapRows.get(v) || "";
            selectedValTitleMap.set(v as string, title);
        }


        return { value: v, title }
    });
}


defineExpose({ addCurrPage, reset, getSelected });

</script>


