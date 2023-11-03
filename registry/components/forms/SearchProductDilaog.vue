<template>
    <v-card width="900">
        <v-card-title class="px-2 bg-primary">
            <v-row class="pa-4">
                <div class="text-h5 ma-2">Поиск услуги</div>
                <v-spacer></v-spacer>
                <v-icon class="mt-2" @click="closeDialog">mdi-close</v-icon>
            </v-row>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col>
                    <v-select @vue:updated="selectedCatalogs.length == catalogs.length? selectAllCatalogs=true : selectAllCatalogs = false" v-model="selectedCatalogs" multiple label="Выберите один или несколько прайс-листов для поиска" density="compact" :items="catalogs" item-title="title" item-value="id" variant="underlined"></v-select>
                    <v-checkbox @update:model-value="searchAllCatalogs()" class="mb-2" density="compact" color="primary" hide-details label="Искать по всем прайс-листам" v-model="selectAllCatalogs"></v-checkbox>
                </v-col>
            </v-row>
            <v-text-field @input="autoReq()" clearable v-model="searchValue" label="Поиск товара или услуги" variant="underlined" density="compact" append-inner-icon="mdi-magnify" :disabled="!selectedCatalogs"></v-text-field>
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
                    <v-row v-for="prod in items">
                        <v-list lines="one" density="compact" class="ma-0 pa-0">
                            <v-list-item density="compact" class="py-0 my-0" :value="prod" :active="false" @click="selectedProducts.push(prod)">
                                <v-list-item-title>
                                    {{ prod.title + ' ' + '(' + prod.catalogTitle + ',' + prod.sectionTitle + ')' }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>    
                    </v-row>
            </template>
            <v-divider v-if="listDone" :thickness="3" class="my-10"></v-divider>
            <v-combobox chips closable-chips v-if="listDone||selectedProducts.length" v-model="selectedProducts" readonly label="Выбранные вами позиции" item-title="title" multiple variant="underlined" density="compact" :items="selectedProducts"></v-combobox>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="closeDialog">Отмена</v-btn>
            <v-btn :disabled="!listDone" color="primary" @click="addSelectedProdutcs()" variant="text">Готово</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ProductFtsViews, IProductFtsListView } from '~/lib/MoApi/Views/ProductFtsListView';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { QueryProductFtsList } from "~~/lib/MoApi/RequestArgs";
import { ProductsCatalogRecord, IProductsCatalogRecordData } from '~/lib/MoApi/Records/ProductsCatalogRecord';


const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const productsView = iocc.get(ProductFtsViews);
const apiClient = iocc.get<MoApiClient>('MoApiClient');
interface Props {
    action: (p: any) => void,
}
const props = defineProps<Props>()


let selectAllCatalogs = ref(false)
let notFound = ref(false)
let searchValue = ref('')
let listDone = ref(false)
let selectedProducts: any = ref([])
let items: any = ref([])
let loading = ref(false)
let catalogs = ref<any>([])
const cookie = useCookie(
    'selectedCatalogs',
    {
        default: () => ([]),
        watch: true
    }   
);
let selectedCatalogs: any = ref(cookie? cookie : (catalogs.value.length > 1? [] : catalogs.value[0]))

const clearFunc = () => {
    items.value = []
}

const searchAllCatalogs = () => {
    if(selectedCatalogs.value.length != catalogs.value.length){
        selectedCatalogs.value = catalogs.value.map((cat)=>{
            return cat.id;
        });
    } else {
        selectedCatalogs.value = []
    }
}

const getCatalogList = async (k) => {
    let list = await recStore.fetch(ProductsCatalogRecord, k);
    catalogs.value.push(list.MData);
}

const getCatalogs = async () => {
    let keys = await apiClient.send<any, any>('/Products/FindProductsCatalogs', 'notactive != true', false);
    await getCatalogList(keys.toString())
}

const getProductsListView = async () => {
    clearFunc();
    loading.value = true;
    let prodsArr = await productsView.getProductFtsListView( new QueryProductFtsList('id, title, fullTitle, catalogTitle, sectionTitle',  searchValue.value, 20, 1, false, selectedCatalogs.value, false))
    const prods: IProductFtsListView[] = [];
    let row: IProductFtsListView | undefined;
    while (row = prodsArr.getNext()) {
        prods.push(row);
    }
    if(prods.length) {
        items.value = prods;
        notFound.value = false;
        listDone.value = true;
        loading.value = false;
    } else {
        listDone.value = false;
        notFound.value = true;
        loading.value = false;
    }
}

let req: any = ref(null);

const autoReq = () => {
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
    if(searchValue.value){
        stopAutoReq();
        getProductsListView(); 
    } else {
        stopAutoReq();
    }
}

const addSelectedProdutcs = () => {
    props.action(selectedProducts.value)
    closeDialog(console.log());
}
getCatalogs();

</script>

<style>
.v-expansion-panel-text__wrapper{
  padding: 0;
}
.v-row + .v-row {
    margin-top: 0;
}
</style>