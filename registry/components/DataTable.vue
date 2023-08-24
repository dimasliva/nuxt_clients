<template>
    <div v-if="visibility">
        <v-data-table ref="refDt" v-model="selected" show-select item-value="id" v-model:items-per-page="itemsPerPage" hover
            :headers="_headers" hide-default-footer v-model:page="currentPage" :items="props.rows" class="elevation-1"
            fixed-header height="72dvh" disable-pagination>

            <template v-slot:column.actions="{ column }">

                <v-menu :close-on-content-click="false">

                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-cog" variant="text"> </v-btn>
                    </template>

                    <template v-slot:default="{ isActive }">
                        <v-card class="mx-auto" max-width="400">
                        <v-list >
                            <v-list-item v-for="val in props.tableDescr.headers">
                                <template v-slot:prepend="{ isActive }">
                                    <v-list-item-action start>
                                        <v-checkbox-btn :model-value="columns.includes(val.key)"
                                            @update:modelValue="(e) => toggleSelectColumn(e, val.key)"></v-checkbox-btn>
                                    </v-list-item-action>
                                </template>
                                <v-list-item-title>{{ val.title || "" }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                        <VBtn class="ml-5 mb-5" color="primary" variant="text" @click="$emit('onColumnsChanged', props.columns)">Обновить</VBtn>
                        <VBtn class="mr-5 mb-5" color="primary" variant="text" @click="() =>columns.length=0">Сбросить</VBtn>
                        </v-card>
                    </template>
                </v-menu>


            </template>


            <template v-slot:item="{ item, index }">
                <VDataTableRow :index="index" :item="item" :class="item.raw.id == lineSelected ? 'lineSelectedRow' : ''"
                    @click="(e) => { onRowClick(item) }">

                    <template v-slot:item.actions="{ item }">
                        <v-menu v-if="props.tableDescr.actionsMenu">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" @click="()=>lineSelected = item.raw.id"></v-btn>
                            </template>

                            <template v-slot:default="{ isActive }">
                                <v-list @mouseleave="(e) => { isActive.value = false }">
                                    <v-list-item v-for="action in getActionsMenu(item)" @click-once="()=>action.action(item)">
                                        <v-icon :icon="action.icon" size="x-small" />
                                        {{ action.title }}
                                    </v-list-item>
                                </v-list>
                            </template>
                        </v-menu>
                    </template>

                    <template v-for="val in accessibleCols" #[`item.${val}`]="{ item }">
                        <div :class="getDataAlignClass(val)"> {{ item.columns[val] }} </div>
                    </template>

                    <template v-for="val in notAccessibleCols" #[`item.${val}`]>
                        -
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
                @update:model-value="itemsPerPage = parseInt($event, 10)"></v-select>
        </v-row>
    </div>
</template>


<script setup lang="ts">
import { UserContext } from '~~/lib/UserContext';
import { VDataTable, VDataTableRow } from 'vuetify/labs/VDataTable'
import { chkRights } from "~/lib/Utils"
import { useScroll } from "~/componentComposables/dataTables/useScroll"

const emit = defineEmits(['onRowDblClick', 'onRowClick', "onColumnsChanged", "onColumnsChangedDelayed"])


const props = defineProps({
    tableDescr: { type: Object, required: true },
    rows: { type: Array<any>, required: true },
    selected: Array<any>,
    visibility: Boolean,
    columns: { type: Array<string>, required: true },
});


let itemsPerPage = ref(12);
let currentPage = ref(1);
let selected = ref([]);
let refDt = ref();
let refPag = ref();
const classMap = { "start": "d-flex justify-start", "center": "d-flex justify-center mr-5", "end": "d-flex justify-end" }

let clckInterval: any = null;
let lineSelected = ref();

const iocc = useContainer();
const userCtx = iocc.get<UserContext>('UserContext');

const { scrollTo } = useScroll(refDt);

const notAccessibleCols = ref<string[]>([]);
const accessibleCols = ref<string[]>([]);

props.tableDescr.headers.forEach((item) => {
    if (!chkRights(null, item.traits))
        notAccessibleCols.value.push(item.key)
    else
        accessibleCols.value.push(item.key);
});


const pagesCount = computed(() => {
    if (props.rows.length % itemsPerPage.value == 0)
        return Math.floor(props.rows.length / itemsPerPage.value);
    else
        return Math.floor(props.rows.length / itemsPerPage.value) + 1;
});


const _headers = computed(() => {
    const res: any[] = [{ key: "actions", align: 'start', width: "10", sortable: false, title: "" }];

    props.columns.forEach((item) => {
        res.push(props.tableDescr.headers.find((el) => el.key == item));
    });

    res.push({ key: "_space", sortable: false, title: "" })
    return res;
});


const _headersMap = computed(() => {

    let res: any = {};

    _headers.value.forEach((item) => {
        if (props.columns.includes(item.key))
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
    let inx = props.columns.indexOf(colName);
    if (inx == -1)
        props.columns.push(colName);
    else
        props.columns.splice(inx, 1);

    clearChangeTimeout();

    colChangeTimeout = setTimeout(() => emit("onColumnsChangedDelayed", props.columns), 3000);
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