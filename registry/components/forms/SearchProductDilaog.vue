<template>
    <v-card width="900">
        <v-card-title class="px-2 bg-primary">
            <v-row class="pa-4">
                <div class="text-h5 ma-2">{{ props.title }}</div>
                <v-spacer></v-spacer>
                <v-icon class="mt-2" @click="closeDialog">mdi-close</v-icon>
            </v-row>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col>
                    <v-row>
                        <v-select v-if="props.prices" class="mx-4" chips closable-chips
                            @vue:updated="selectedCatalogs.length == catalogs.length ? selectAllCatalogs = true : selectAllCatalogs = false"
                            v-model="selectedCatalogs" multiple label="Выберите один или несколько прайс-листов для поиска"
                            :items="catalogs" item-title="title" item-value="id" variant="underlined"></v-select>
                    </v-row>
                    <v-checkbox v-if="props.prices" @update:model-value="searchAllCatalogs()" class="mb-2" density="compact"
                        color="primary" hide-details label="Искать по всем прайс-листам"
                        v-model="selectAllCatalogs"></v-checkbox>
                </v-col>
            </v-row>
            <v-text-field @input="autoReq()" autofocus clearable v-model="searchValue" label="Поиск"
                :placeholder="props.text_field" variant="underlined" density="compact" append-inner-icon="mdi-magnify"
                :disabled="!selectedCatalogs"></v-text-field>
            <v-progress-linear color="primary" class="ma-1" v-if="loading" indeterminate></v-progress-linear>
            <v-row v-if="notFound">
                <v-card class="mx-auto my-2" prepend-icon="mdi-playlist-remove" variant="tonal">
                    <template v-slot:title>
                        Ничего не найдено
                    </template>
                    <v-card-text>
                        Попробуйте изменить условия поиска
                    </v-card-text>
                </v-card>
            </v-row>
            <template v-if="listDone">
                <!-- <v-row v-if="props.prices" align="center" justify="start" class=" ma-0">
                    <v-col v-for="(selection, i) in catalogSections" :key="selection.text" cols="auto" density="compact"
                        class="pa-1">
                        <v-chip :disabled="loading" closable @click:close="catalogSections.splice(i, 1)">
                            {{ selection }}
                        </v-chip>
                    </v-col>
                </v-row> -->
                <v-row>
                    <v-card class="overflow-y-auto w-100" height="300" flat>
                        <v-list lines="one" density="compact" class="ma-0 pa-0 ">
                            <v-list-item v-for="item in items" density="compact" class="py-0 my-1 overflow-visible"
                                :value="item" :active="false" @click="selectedItems.push(item)">
                                <v-list-item-title v-if="props.prices">
                                    {{ item.title + ' (' + item.prices + 'руб.)' + ' ' + '(' + item.catalogTitle + ',' +
                                        item.sectionTitle + ')' }}
                                </v-list-item-title>
                                <v-list-item-title v-else>
                                    {{ item.surname + ' ' + item.name + ' ' + item.patronymic }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-row>
            </template>
            <v-dialog v-model="showPriceList" fullscreen :scrim="false" transition="dialog-bottom-transition">
                <v-card>
                    <v-card-title class="px-2 bg-primary">
                        <v-row class="pa-4">
                            <div class="text-h5 ma-2">Прайс-листы</div>
                            <v-spacer></v-spacer>
                            <v-icon class="mt-2" @click="showPriceList = false">mdi-close</v-icon>
                        </v-row>
                    </v-card-title>
                    <v-card-text class="h-75 overflow-y-auto">
                        <v-expansion-panels>
                            <v-expansion-panel v-for="catalog in catalogs" elevation="1" :key="catalog.id">
                                <v-expansion-panel-title class="text-h6">{{ catalog.title
                                }}</v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-expansion-panels>
                                        <v-expansion-panel v-for="section in catalogSections" elevation="1"
                                            :key="section.id">
                                            <v-expansion-panel-title @click="getProducts(catalog.id, section.id)"
                                                class="text-h6">{{ section.title
                                                }}</v-expansion-panel-title>
                                            <v-expansion-panel-text>
                                                <v-list>
                                                    <v-list-item v-for="product in products"
                                                        @click="selectedItems.push(product)"
                                                        :title="product.title + ' (' + product.prices + 'руб.)'"></v-list-item>
                                                </v-list>
                                            </v-expansion-panel-text>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-card-text>
                    <v-card-actions>
                        <v-combobox hide-details chips closable-chips v-model="selectedItems" readonly label="Вы выбрали"
                            item-title="title" multiple variant="underlined" density="comfortable" class="ma-6"
                            :items="selectedItems"></v-combobox>
                        <v-btn color="primary" variant="text" @click="closeDialog">Отмена</v-btn>
                        <v-btn :disabled="!selectedItems.length" color="primary" @click="addSelectedProdutcs()"
                            variant="text">Добавить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-divider v-if="listDone" :thickness="3" class="mb-10 mt-3"></v-divider>
            <v-select hide-details chips closable-chips v-if="listDone || selectedItems.length" v-model="selectedItems"
                readonly label="Вы выбрали" item-title="title" multiple variant="underlined" density="compact"
                :items="selectedItems"></v-select>
        </v-card-text>
        <v-card-actions>
            <v-btn color="primary" variant="text" @click="props.prices ? openPrices() : getProductsListView()">{{ props.full
            }}</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="closeDialog">Отмена</v-btn>
            <v-btn :disabled="!selectedItems" color="primary" @click="addSelectedProdutcs()" variant="text">Добавить</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { UserContext } from '~/lib/UserContext';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { ProductRecord } from '~/lib/MoApi/Records/ProductRecord';
import { ProductsCatalogRecord } from '~/lib/MoApi/Records/ProductsCatalogRecord';
import { ProductsCatalogSectionRecord } from '~/lib/MoApi/Records/ProductsCatalogSectionRecord';


const iocc = useContainer();
const usCntx = iocc.get(UserContext);
const recStore = iocc.get(RecordsStore);
const apiClient = iocc.get<MoApiClient>('MoApiClient');
interface Props {
    title: string,
    text_field: string,
    full: string,
    reqAction: (t: string, c?: any) => any[],
    prices: boolean,
    action: (p: any) => void,
}
const props = defineProps<Props>()
console.log(usCntx)
let prodsReq = ref(false)
let showPriceList = ref(false)
let selectAllCatalogs = ref(false)
let notFound = ref(false)
let searchValue = ref('')
let listDone = ref(false)
let selectedItems: any = ref([])
let items: any = ref([])
let loading = ref(false)
let catalogs = ref<any>([])
let catalogSections = ref<any>([])
let products = ref<any>([])
const catalogCookie = useCookie(
    'selectedCatalogs',
    {
        default: () => ([]),
        watch: true
    }
);
let selectedCatalogs: any = ref(catalogCookie ? catalogCookie : (catalogs.value.length > 1 ? [] : catalogs.value[0]))

const clearFunc = () => {
    items.value = []
}

const searchAllCatalogs = () => {
    if (selectedCatalogs.value.length != catalogs.value.length) {
        selectedCatalogs.value = catalogs.value.map((cat) => {
            return cat.id;
        });
    } else {
        selectedCatalogs.value = []
    }
}

const getCatalogList = async (k) => {
    let list = await recStore.fetch(ProductsCatalogRecord, k);
    catalogs.value = list.MData;
}

const getCatalogs = async () => {
    let catalogsKeys = await apiClient.send<any, any>('/Products/FindProductsCatalogs', 'notactive != true', false);
    await getCatalogList(catalogsKeys);
}

const getCatalogsSectionsList = async (k) => {
    let keys = k.map((id) => id.replaceAll(`'`, `"`))
    let list = await recStore.fetch(ProductsCatalogSectionRecord, keys);
    catalogSections.value = list.MData;
}

const openPrices = async () => {
    items.value = [];
    catalogSections.value = [];
    searchValue.value = '';
    listDone.value = false;
    let productsCatalogs = [...new Set(catalogs.value.map(item => item.id))].map((i) => `productscatalog = ` + `'` + i + `'`);
    let catalogsSectionKeys = await apiClient.send<any, any>('/Products/FindProductsCatalogSections', productsCatalogs.toString(), false);
    await getCatalogsSectionsList(catalogsSectionKeys);
    showPriceList.value = true
}

const getProductsList = async (k) => {
    let keys = k.map((id) => id.replaceAll(`'`, `"`))
    let list = await recStore.fetch(ProductRecord, keys);
    products.value = list.MData;
}

const getProducts = async (catkey, seckey) => {
    let productsCatalogs = `productscatalog = ` + `'` + catkey + `' AND productscatalogsection = ` + `'` + seckey + `'`;
    let productsKeys = await apiClient.send<any, any>('/Products/FindProducts', productsCatalogs.toString(), false);
    getProductsList(productsKeys)
}

// const sortedProductsList = (catkey, seckey) => {
//     console.log('sort func')
//     let sorted = products.value.filter((product) => product.productsCatalog == catkey && product.productsCatalogSection == seckey)
//     return sorted;
// }


const getProductsListView = async () => {
    clearFunc();
    loading.value = true;
    let res = await props.reqAction(searchValue.value, selectedCatalogs.value);

    if (res.length) {
        items.value = res;
        notFound.value = false;
        listDone.value = true;
        loading.value = false;
        catalogSections.value = [...new Set(res.map(item => item.sectionTitle))]
    } else {
        listDone.value = false;
        notFound.value = true;
        loading.value = false;
    }
    console.log(items.value)
}

let req: any = ref(null);

const autoReq = () => {
    if (!props.prices) {
        searchValue.value = searchValue.value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    stopAutoReq();
    req = setTimeout(() => {
        search();
        req = null;
    }, 2000);
}

const stopAutoReq = () => {
    if (req !== null) {
        clearTimeout(req);
        req = null;
    }
}

const search = () => {
    if (searchValue.value) {
        stopAutoReq();
        getProductsListView();
    } else {
        stopAutoReq();
    }
}


const addSelectedProdutcs = () => {
    props.action(selectedItems.value)
    closeDialog(console.log());
}
if (props.prices) {
    getCatalogs();
}

</script>

<style scoped>
.v-expansion-panel-text__wrapper {
    padding: 0;
}

.v-row+.v-row {
    margin-top: 0;
}

.v-list-item-title {
    white-space: inherit;
}
</style>