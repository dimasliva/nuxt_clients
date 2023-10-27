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
                    <v-select v-model="selectedCatalogs" multiple label="Выберите один или несколько прайс-листов для поиска" density="compact" :items="catalogs" item-title="title" item-value="id" variant="underlined"></v-select>
                    <v-checkbox @click="searchAllCatalogs()" density="compact" color="primary" hide-details label="Искать по всем прайс-листам" v-model="selectAllCatalogs"></v-checkbox>
                </v-col>
                <v-col>
                    <v-select v-model="selectedDivisions" multiple label="Выберите филиал" density="compact" :items="divisions" item-title="title" item-value="division" variant="underlined"></v-select>
                </v-col>
            </v-row>
            <v-text-field @input="autoReq()" v-model="searchValue" label="Поиск товара или услуги" variant="underlined" density="compact" append-inner-icon="mdi-magnify" :disabled="!selectedCatalogs"></v-text-field>
            <v-progress-linear color="primary" class="ma-1" v-if="loading" indeterminate></v-progress-linear>
            <v-row v-if="notFound">Ничего не найдено</v-row>
            <template v-if="listDone">
                    <v-row v-for="prod in items">
                        <v-list density="compact" class="ma-0 pa-0">
                            <v-list-item :value="prod" :active="false" @click="selectedProducts.push(prod)">
                                <v-list-item-title>
                                    {{ prod.title + ' ' + '(' + prod.catalogTitle + ',' + prod.sectionTitle + ')' }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>    
                    </v-row>
            </template>
            <v-combobox chips closable-chips v-if="listDone" v-model="selectedProducts" class="mt-6" readonly label="Выбранные вами позиции" item-title="title" multiple variant="underlined" density="compact" :items="selectedProducts"></v-combobox>
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


const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const productsView = iocc.get(ProductFtsViews);

let selectAllCatalogs = ref(false)
let selectedDivisions = ref()
let notFound = ref(false)
let searchValue = ref('')
let listDone = ref(false)
let selectedProducts: any = ref([])
let items: any = ref([])
let loading = ref(false)
let catalogs = [
    {title: 'Прайс 1', id: '30ec367f-3fd2-424f-9264-d446b0c88fa9', division: 'somestring'},
    {title: 'Прайс 2', id: '10ec367f-3fd2-424f-9264-d446b0c88fa9', division: 'somestring'},
    {title: 'Прайс 3', id: '20ec367f-3fd2-424f-9264-d446b0c88fa9', division: 'somestring'},
]
let divisions = [
    {title: 'Первомайская 51', id: 'somestring'}
]
let selectedCatalogs: any = ref(catalogs.length==1? [catalogs[0].id] : [])

const checkSelectedProds = (state) => {
    console.log(state)
    if(state){
        selectedProducts.value = selectedProducts.value.splice(0, selectedProducts.value.lenght)
    }
}

const clearFunc = () => {
    items.value = []
}

const searchAllCatalogs = () => {
    if(selectedCatalogs.value.length != catalogs.length){
        selectedCatalogs.value = catalogs.map((cat)=>{
            return cat.id;
        });
    } else {
        selectedCatalogs.value = []
    }
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
  stopAutoReq();
  getProductsListView(); 
}

const addSelectedProdutcs = () => {
    console.log('Здесь могла быть ваша реклама');
    closeDialog;
}
</script>

<style>
.v-expansion-panel-text__wrapper{
  padding: 0;
}
</style>