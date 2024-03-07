<template>
    <div v-if="content">
        <v-data-table ref="refDt" v-model:sortBy="sortBy" v-model="selected" show-select item-value="id"
            v-model:items-per-page="itemsPerPage" hover :headers="_columns" hide-default-footer v-model:page="currentPage"
            :items="content.rows" class="elevation-1" fixed-header height="68dvh" disable-pagination>

            <!--Верхняя строка перед основной таблицей-->
            <template v-slot:top="props">
                <v-row no-gutters>
                    <!--Кнопка Обновить-->
                    <v-btn color="primary" variant="text" icon="mdi-refresh" @click="async () => onUpdate()">
                        <v-icon>mdi-refresh</v-icon>
                        <v-tooltip activator="parent" location="top">Обновить</v-tooltip>
                    </v-btn>

                    <!--Строка пути-->
                    <v-breadcrumbs class="pb-0 pt-0" bg-color="" :items="path">
                        <!--кнопка перехода на верхний уровень-->
                        <template v-slot:prepend>
                            <v-btn color="primary" variant="text" icon="mdi-folder-upload" :disabled="path.length <= 1"
                                @click="async () => {
                                    const stateInfo = path[path.length - 2].innerData;
                                    content = await onNavigate(path.length, path.length - 1, path, null);
                                    path.pop();
                                    path[path.length - 1] = content.pathInfo;
                                    setPageStateInfo(stateInfo);
                                }" />
                        </template>

                        <!--Строка пути-->
                        <template v-slot:item="props">
                            <li class="v-breadcrumbs-item"><a class="v-breadcrumbs-item--link" href="#" @click.prevent="async () => {
                                if (path.length != props.index + 1) {
                                    const stateInfo = path[props.index].innerData;
                                    content = await onNavigate(path.length, props.index + 1, path, null);
                                    path.splice(props.index + 1);
                                    path[path.length - 1] = content.pathInfo;
                                    setPageStateInfo(stateInfo);
                                }
                            }">
                                    {{ props.item.title }}</a></li>
                        </template>

                    </v-breadcrumbs>
                </v-row>
            </template>


            <!-- кнопка(меню) настройки колонок-->
            <template v-slot:header.icons="{ column }">

                <v-menu :close-on-content-click="false">

                    <template v-slot:activator="{ props }">
                        <v-btn :disabled="!content.columns || content.columns.length == 0" v-bind="props" icon="mdi-cog"
                            variant="text"> </v-btn>
                    </template>

                    <template v-slot:default="{ isActive }">
                        <v-row class="mb-1" @mouseleave="(e) => { isActive.value = false }">
                            <v-card class="mx-auto" max-width="400">
                                <v-list>
                                    <v-list-item v-for="val in content.columns">
                                        <template v-slot:prepend="{ isActive }">
                                            <v-list-item-action start>
                                                <v-checkbox-btn
                                                    :model-value="content.visibleCols!.includes(val.key) ? true : false"
                                                    @update:modelValue="(e) => toggleSelectColumn(e, val.key)">
                                                </v-checkbox-btn>
                                            </v-list-item-action>
                                        </template>
                                        <v-list-item-title>{{ val.title || ""
                                        }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                                <v-row justify="center" no-gutters>
                                    <VBtn class="mt-1 mb-3" color="primary" variant="text"
                                        @click="() => { if (content!.visibleCols) content!.visibleCols.length = 0 }">
                                        Сбросить
                                    </VBtn>
                                </v-row>
                            </v-card>
                        </v-row>
                    </template>
                </v-menu>
            </template>


            <!-- кнопка общего меню в загаловке-->
            <template v-slot:header.actions="{ column }">

                <v-menu v-if="content.actionsMenu" scrollStrategy="close">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-menu" variant="text" />
                    </template>

                    <template v-slot:default="{ isActive }">
                        <v-list @mouseleave="(e) => { isActive.value = false }">
                            <v-list-item v-for="action in commonTableMenu" @click-once="() => action.action(props)">
                                <v-icon v-if="action.icon" :icon="action.icon" color="primary" />
                                &nbsp
                                {{ action.title }}
                            </v-list-item>
                        </v-list>
                    </template>
                </v-menu>
            </template>


            <!--строки-->
            <template v-slot:item="{ internalItem, index }">
                <VDataTableRow :id="getUniqueId(internalItem.raw.id)" :index="index" :item="internalItem"
                    :class="internalItem.raw.id == lineSelected ? 'lineSelectedRow' : ''"
                    @click="(e) => { onRowClick(internalItem, index) }">


                    <!-- колонка меню действий-->
                    <template v-slot:item.actions="{ item }">
                        <v-menu scrollStrategy="close" v-if="internalItem.raw.$mdata.getRowActionsMenu">
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

                    <!-- колонка иконки-->
                    <template v-slot:item.icons="{ item }">
                        <v-icon color="primary"
                            :icon="item.$mdata.icon || item.$mdata.isFolder ? 'mdi-folder' : 'mdi-file-outline'"></v-icon>
                    </template>

                </VDataTableRow>
            </template>

            <template v-slot:bottom />
        </v-data-table>


        <!--Нижняя строка-->
        <v-row class="text-center pt-5" justify="center">
            <v-col></v-col>
            <v-col md="6">
                <v-row justify="center">
                    <!--Номера Страниц-->
                    <v-pagination ref="refPag" v-model="currentPage" :length="pagesCount" :total-visible="7"
                        @update:modelValue="() => scrollTo(0, 0)" />
                    <!--Количество строк на странице-->
                    <v-select style="max-width: 15dvh; height: 10px;" :model-value="itemsPerPage" label="На странице"
                        :items="[10, 12, 25, 50, 100]" variant="solo"
                        @update:model-value="itemsPerPage = parseInt(<string><unknown>$event, 10)"></v-select>
                </v-row>
            </v-col>
            <v-col>
                <!--Строка Фильтра-->
                <v-text-field v-if="content.filterTitle" :modelValue="filterValue"
                    @update:modelValue="(d) => { onFilterTextInput(); emit('update:filterValue', d); }" ref="refFilter"
                    type="text" variant="underlined" clearable density="compact" :maxlength="100"
                    :label="content.filterTitle" />
            </v-col>
        </v-row>
    </div>
</template>


<script async setup lang="ts">
import { VDataTable, VDataTableRow } from 'vuetify/components/VDataTable'
import { useScroll } from "~/componentComposables/dataTables/useScroll"
import type { INavColumn, INavPathItem, INavRow, INavigatorContent, INavigatorProps } from "./NavigatorTypes"
import * as Helpers from '~/lib/Helpers';
import { v4 as uuidv4 } from 'uuid';

type TPageStateInfo = { page: number, pageCount: number, itemsPerPage: number, selectedId?: string | null, sortBy: any | null, sx?: number, sy?: number };


interface INavColumnInternal extends INavColumn {
    sortRaw?: ((a, b) => number) | undefined;
    sort?: ((a, b) => number) | undefined;
}


const emit = defineEmits(["onColumnsChangedDelayed", "update:filterValue"])


const props = defineProps<INavigatorProps>();

let itemsPerPage = ref(10);
let currentPage = ref(1);
let selected = ref([]);
let refDt = ref(null);
let refPag = ref();
let refFilter = ref();
let filterVal = ref("");
const classMap = { "start": "d-flex justify-start", "center": "d-flex justify-center mr-5", "end": "d-flex justify-end" }
const compuuid = uuidv4();

let clckInterval: any = null;
let lineSelected = ref();
const content = ref<INavigatorContent>();
let path = ref<INavPathItem[]>([]);
let filterInputTextTimeout: any | null = null;
let sortBy = ref<any[]>([]);
//const iocc = useContainer();
const { scrollTo, getCurrScrollPos } = useScroll(refDt);


const pagesCount = computed(() => {
    if (content.value!.rows.length % itemsPerPage.value == 0)
        return Math.floor(content.value!.rows.length / itemsPerPage.value);
    else
        return Math.floor(content.value!.rows.length / itemsPerPage.value) + 1;
});


const getSortComparer = (colname: string) => {

    return (a: INavRow, b: INavRow) => {

        const direct = (sortBy.value[0]?.order == "asc") ? 1 : -1;

        if (a.$mdata.isFolder == b.$mdata.isFolder) {
            const as = a[colname] || "";
            const bs = b[colname] || "";
            return as.localeCompare(bs, undefined, { numeric: true });
        }
        else
            return direct * (a.$mdata.isFolder ? -1 : 1);
    }
}



const _columns = computed(() => {
    const res: INavColumnInternal[] = [
        { key: "actions", align: 'start', minWidth: "24", width: "24", sortable: false, title: "" },
        { key: "icons", align: 'center', width: "8", sortable: false, title: "" }
    ];

    const cols = Helpers.CloneData(content.value!.columns || []) as INavColumnInternal[];

    let titlecol = cols.find((item) => item.key == "title");

    if (titlecol) {
        titlecol.sortRaw = getSortComparer("title");
        res.push(titlecol);
    }
    else
        res.push({
            key: "title",
            align: 'start',
            cellProps: { align: 'start' },
            width: "500",
            sortable: true,
            title: "Название",
            sortRaw: getSortComparer("title")
        });

    cols.forEach((item) => {
        if (item.key == 'title' || content.value!.visibleCols && !content.value!.visibleCols.includes(item.key))
            return;
        item.sortRaw = getSortComparer(item.key);
        res.push(item);
    });

    res.push({ key: "_space", sortable: false, title: "" })
    return res;
});


//т.к. из компонента datatable без модификации компонентиа нет возможности вытащить отсортированные строки, то сортируем строки сами по аналогичному принципу что в datatable
const getSortedRows = () => {
    if (sortBy.value.length == 0)
        return content.value?.rows;

    const comparer = getSortComparer(sortBy.value[0].key);
    const direct = sortBy.value[0].order == "desc" ? -1 : 1;
    return content.value?.rows.map(item => item).sort((a, b) => comparer(a, b) * direct);
}


const goToRowByKey = (key: string) => {
    const sortedRows = getSortedRows();
    if (!sortedRows)
        return;
    const inx = sortedRows.findIndex(item => item.id == key);
    if (inx == -1)
        return;
    const page = Math.floor(inx / itemsPerPage.value) + 1;
    currentPage.value = page;
    nextTick(() => {
        const element = document.getElementById(getUniqueId(key));
        if (element) {
            element.scrollIntoView({ block: "center" });
            lineSelected.value = key;
        }
    });
}

//отслеживание сортировки для перехода на выделенную строку
watch(sortBy, () => {
    if (lineSelected.value)
        goToRowByKey(lineSelected.value);
});

//отслеживание изменения строк на странице для перехода на выделенную строку
watch(itemsPerPage, () => {
    if (lineSelected.value)
        goToRowByKey(lineSelected.value);
});



const _headersMap = computed(() => {

    let res: any = {};
    _columns.value.forEach((item) => {
        res[item.key] = item;
    });
    return res;
});



const getActionsMenu = (DataTableItemINavRow: any) => {
    const res: any[] = [];
    let menu = DataTableItemINavRow.raw.getRowActionsMenu?.(DataTableItemINavRow);
    return menu;
};


const addCurrPage = (step: number) => {
    currentPage.value += step;
    if (currentPage.value > pagesCount.value)
        currentPage.value = pagesCount.value
    else
        if (currentPage.value < 1)
            currentPage.value = 1;
}



const onUpdate = async () => {
    content.value = await props.onNavigate(path.value.length, path.value.length, path.value, null);
    path.value[path.value.length - 1] = content.value.pathInfo;
    if (lineSelected.value)
        goToRowByKey(lineSelected.value);
}


const update = () => onUpdate();


const onRowClickAction = async (DataTableItemINavRow: any) => {
    const row: INavRow = DataTableItemINavRow.raw;
    if (row.$mdata.isFolder) {
        //переход в подпапку
        savePageStateInfo();
        content.value = await props.onNavigate(path.value.length, path.value.length + 1, path.value, row);
        path.value.push(content.value.pathInfo);
        scrollTo(0, 0);
    }
    else
        content.value!.onRowClick?.(path.value.length, path.value[path.value.length - 1], row, DataTableItemINavRow.index);   //пользовательское действие
}


const savePageStateInfo = () => {
    const pathdata = path.value[path.value.length - 1];
    const scrollPos = getCurrScrollPos();
    pathdata.innerData = {
        page: currentPage.value,
        pageCount: pagesCount.value,
        itemsPerPage: itemsPerPage.value,
        selectedId: lineSelected.value,
        sortBy: sortBy.value,
        sx: scrollPos?.scrollLeft,
        sy: scrollPos?.scrollTop
    } as TPageStateInfo;

    return undefined;
}

const setPageStateInfo = (info: TPageStateInfo | null) => {
    if (info) {
        itemsPerPage.value = info.itemsPerPage;
        currentPage.value = info.page;
        sortBy.value = info.sortBy;
        lineSelected.value = info.selectedId

        nextTick(() => {
            scrollTo(info.sx || 0, info.sy || 0);
        })
    }
}


const getUniqueId = (id: string) => {
    return compuuid + "_" + id;
}

const onRowClick = (DataTableItemINavRow: any, index) => {

    lineSelected.value = DataTableItemINavRow.raw.id;

    if (!clckInterval)
        clckInterval = setInterval(() => {
            //click
            clearInterval(clckInterval);
            clckInterval = null;
            //emit('onRowClick', dtitem);
        }, 300);

    else {//dblclick
        clearInterval(clckInterval);
        clckInterval = null;
        onRowClickAction(DataTableItemINavRow);
    }
};



const reset = () => {
    currentPage.value = 1;
    selected.value.length = 0;
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

    if (content.value!.visibleCols) {
        let inx = content.value!.visibleCols.findIndex((val) => val == colName);
        if (inx != -1)
            content.value!.visibleCols.splice(inx, 1);
        else
            content.value!.visibleCols.push(colName);

        clearChangeTimeout();
        colChangeTimeout = setTimeout(() => emit("onColumnsChangedDelayed", content.value!.columns), 3000);
    }
}

const onFilterTextInput = () => {
    if (filterInputTextTimeout)
        clearTimeout(filterInputTextTimeout);

    filterInputTextTimeout = setTimeout(() => {
        update();
    }, 800);
}


//Формирование общего меню таблицы
const commonTableMenu = computed(() => {
    let res: any[] = [];
    if (content.value?.actionsMenu)
        for (let item of content.value?.actionsMenu) {
            if (typeof item == "object")
                res.push(item);
            else
                if (typeof item == "function") {
                    const menuitem = item(selected.value);
                    if (menuitem)
                        res.push(menuitem);
                }
        }
    return res;
});



const eventsHandler = (e: string, d: any) => {
    switch (e) {
        case "onKeydown":
            let inc = (d.key == 'ArrowLeft') ? -1 : (d.key == 'ArrowRight') ? 1 : 0;

            if (inc != 0) {
                addCurrPage(inc);
                break;
            }
            /*
            if (!this._RefFilterForm.value.isVisible() && d.keyCode >= 32) {
                this._RefFilterForm.value.clear();
            }
            */
            if (d.key != 'ArrowUp' && d.key != 'ArrowDown' && d.keyCode >= 32 || ['Enter', 'Delete', 'Backspace'].includes(d.key)) {
                if (d.key == "Delete") {
                    onFilterTextInput();
                    emit('update:filterValue', '');
                }
                else
                    if (d.key == "Enter" && refFilter.value && refFilter.value.focused) {
                        if (filterInputTextTimeout)
                            clearTimeout(filterInputTextTimeout);
                        filterInputTextTimeout = null;
                        update();
                        return;
                    }

                return refFilter.value.focus();
            }

            break;

        case "onBeforePageDeactivate":
            getCurrScrollPos();
            break;
    }
    return false;
};


defineExpose({ addCurrPage, reset, update, eventsHandler });

//методы с await должны идти после специальных функций vue
content.value = await props.onNavigate(0, 1, null, null);
path.value = [content.value.pathInfo];

</script>


<style scope>
.lineSelectedRow td {
    background-color: rgb(var(--v-theme-tertiary)) !important;
}

.v-data-table-header__content {
    font-weight: bold;
}
</style>