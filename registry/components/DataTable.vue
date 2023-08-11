<template>
    <div v-if="visibility">
        <v-data-table ref="refDt" v-model="selected" show-select item-value="id" v-model:items-per-page="itemsPerPage" hover
            :headers="props.tableDescr.headers" hide-default-footer v-model:page="currentPage" :items="props.rows" class="elevation-1"
            fixed-header height="72dvh" disable-pagination>

            <template v-slot:item="{ item, index }">
                <VDataTableRow :index="index" :item="item" :class="item.raw.id == lineSelected ? 'lineSelectedRow' : ''"
                    @click="(e) => { onRowClick(item) }">

                    <template v-slot:item.actions="{ item }">
                        <v-menu v-if="props.tableDescr.actionsMenu">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text"></v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="action in getActionsMenu(item)" @click-once="action.action">
                                    <v-icon :icon="action.icon" size="x-small" />
                                    {{ action.title }}
                                </v-list-item>
                            </v-list>
                        </v-menu>
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
import { IDataTableDescription } from "~/componentComposables/dataTables/useDataTable"
import { useScroll } from "~/componentComposables/dataTables/useScroll"




const props = defineProps({
    tableDescr: { type:Object, required: true },
    rows: { type: Array<any>, required: true },
    selected: Array<any>,
    visibility: Boolean
});


//useDataTable(<IDataTableDescription>props.tableDescr, props.rows)

let itemsPerPage = ref(12);
let currentPage = ref(1);
let selected = ref([]);
let refDt = ref();
let refPag = ref();


let clckInterval: any = null;
let lineSelected = ref();
let isVisible = useElementVisibility(refDt);

const iocc = useContainer();
const userCtx = iocc.get<UserContext>('UserContext');

const {scrollTo} = useScroll(refDt);


const notAccessibleCols = ref<string[]>([]);

props.tableDescr.headers.forEach((item) => {
    if (!chkRights(null, item.traits))
        notAccessibleCols.value.push(item.key)
});


const pagesCount = computed(() => {
    if (props.rows.length % itemsPerPage.value == 0)
        return Math.floor(props.rows.length / itemsPerPage.value);
    else
        return Math.floor(props.rows.length / itemsPerPage.value) + 1;
});



const _headers = computed(() => {
    const res: any[] = [];

    props.tableDescr.headers.forEach((item) => {
        if (chkRights(null, item.traits))
            res.push(item)
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
        }, 300);

    else {//dblclick
        clearInterval(clckInterval);
        clckInterval = null;
    }


};


const reset = () => {
    currentPage.value = 1;
    selected.value.length = 0;
    lineSelected.value = null;
    scrollTo(0, 0);
}


defineExpose({ addCurrPage, reset });

</script>


<style scope>
.lineSelectedRow td {
    background-color: rgb(var(--v-theme-tertiary)) !important;
}
</style>