<template>
    <div v-if="content">
        <v-data-table ref="refDt" v-model="selected" show-select item-value="id" v-model:items-per-page="itemsPerPage" hover
            :headers="_columns" hide-default-footer v-model:page="currentPage" :items="content.rows" class="elevation-1"
            fixed-header height="68dvh" disable-pagination>


            <template v-slot:top="props">
                <!--Строка пути-->
                <v-breadcrumbs class="pb-0 pt-0" bg-color="" :items="path">
                    <!--кнопка перехода на верхний уровень-->
                    <template v-slot:prepend>
                        <v-btn color="primary" variant="text" icon="mdi-folder-upload" :disabled="path.length <= 1" @click="async () => {
                            content = await onNavigate(path.length, path.length - 1, path, null);
                            path.pop();
                            path[path.length - 1] = content.pathInfo;
                        }" />
                    </template>

                    <template v-slot:item="props">
                        <li class="v-breadcrumbs-item"><a class="v-breadcrumbs-item--link" href="#" @click.prevent="async () => {
                            if (path.length != props.index + 1) {
                                content = await onNavigate(path.length, props.index + 1, path, null);
                                path.splice(props.index + 1);
                                path[path.length - 1] = content.pathInfo;
                            }
                        }">
                                {{ props.item.title }}</a></li>
                    </template>

                </v-breadcrumbs>
            </template>


            <!-- кнопка настройки колонок-->
            <template v-slot:header.icons="{ column }">

                <v-menu :close-on-content-click="false">

                    <template v-slot:activator="{ props }">
                        <v-btn :disabled="!content.columns || content.columns.length == 0" v-bind="props" icon="mdi-cog"
                            variant="text"> </v-btn>
                    </template>

                    <template v-slot:default="{ isActive }">
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
                            <VBtn class="ml-5 mb-5" color="primary" variant="text"
                                @click="()=>onUpdate()">Обновить</VBtn>
                            <VBtn class="mr-5 mb-5" color="primary" variant="text"
                                @click="() => { if (content!.visibleCols) content!.visibleCols.length = 0 }">
                                Сбросить
                            </VBtn>
                        </v-card>
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
                            <v-list-item v-for="action in content.actionsMenu" @click-once="() => action.action(props)">
                                <v-icon :icon="action.icon" size="x-small" />
                                {{ action.title }}
                            </v-list-item>
                        </v-list>
                    </template>
                </v-menu>
            </template>

            <!--строки-->
            <template v-slot:item="{ internalItem, index }">
                <VDataTableRow :index="index" :item="internalItem"
                    :class="internalItem.raw.id == lineSelected ? 'lineSelectedRow' : ''"
                    @click="(e) => { onRowClick(internalItem) }">


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

        <v-row class="text-center pt-5" justify="center">
            <v-pagination ref="refPag" v-model="currentPage" :length="pagesCount" :total-visible="7"
                @update:modelValue="() => scrollTo(0, 0)" />
            <v-select style="max-width: 15dvh; height: 10px;" :model-value="itemsPerPage" label="На странице"
                :items="[10, 12, 25, 50, 100]" variant="solo"
                @update:model-value="itemsPerPage = parseInt(<string><unknown>$event, 10)"></v-select>
        </v-row>
    </div>
</template>


<script setup lang="ts">
import { VDataTable, VDataTableRow } from 'vuetify/components/VDataTable'
import { useScroll } from "~/componentComposables/dataTables/useScroll"
import type { INavColumn, INavPathItem, TNavRow, INavigatorContent, INavigatorProps } from "./NavigatorTypes"



const emit = defineEmits(["onColumnsChangedDelayed"])


const props = defineProps<INavigatorProps>();


let itemsPerPage = ref(12);
let currentPage = ref(1);
let selected = ref([]);
let refDt = ref(null);
let refPag = ref();
const classMap = { "start": "d-flex justify-start", "center": "d-flex justify-center mr-5", "end": "d-flex justify-end" }

let clckInterval: any = null;
let lineSelected = ref();
const content = ref<INavigatorContent>(await props.onNavigate(0, 1, null, null));
let path = ref<INavPathItem[]>([content.value.pathInfo]);

//const iocc = useContainer();
const { scrollTo } = useScroll(refDt);


const pagesCount = computed(() => {
    if (content.value!.rows.length % itemsPerPage.value == 0)
        return Math.floor(content.value!.rows.length / itemsPerPage.value);
    else
        return Math.floor(content.value!.rows.length / itemsPerPage.value) + 1;
});


const _columns = computed(() => {
    const res: INavColumn[] = [
        { key: "actions", align: 'start', minWidth: "24", width: "24", sortable: false, title: "" },
        { key: "icons", align: 'center', width: "8", sortable: false, title: "" }
    ];

    let titlecol = content.value!.columns?.find((item) => item.key == "title");

    if (titlecol)
        res.push(titlecol);
    else
        res.push({ key: "title", align: 'start', cellProps: { align: 'start' }, width: "400", sortable: true, title: "Название" });

    content.value!.columns?.forEach((item) => {
        if (item.key == 'title' || content.value!.visibleCols && !content.value!.visibleCols.includes(item.key))
            return;
        res.push(item);
    });

    res.push({ key: "_space", sortable: false, title: "" })
    return res;
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
}


const onRowClickAction = async (DataTableItemINavRow: any) => {
    const row: TNavRow = DataTableItemINavRow.raw;

    if (row.$mdata.isFolder) {
        content.value = await props.onNavigate(path.value.length, path.value.length + 1, path.value, row);
        path.value.push(content.value.pathInfo);
    }
    else
        content.value.onRowClick?.(path.value.length, path.value[path.value.length - 1], row);
}


const onRowClick = (DataTableItemINavRow: any) => {

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


defineExpose({ addCurrPage, reset });

</script>


<style scope>
.lineSelectedRow td {
    background-color: rgb(var(--v-theme-tertiary)) !important;
}

.v-data-table-header__content {
    font-weight: bold;
}
</style>