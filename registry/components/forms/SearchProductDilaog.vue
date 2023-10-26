<template>
    <v-card width="700">
        <v-card-title class="px-2 bg-primary">
            <v-row class="pa-4">
                <div class="text-h5 ma-2">Поиск услуги</div>
                <v-spacer></v-spacer>
                <v-icon class="mt-2" @click="closeDialog">mdi-close</v-icon>
            </v-row>
        </v-card-title>
        <v-card-text>
            <v-select v-model="selectedCatalogs" multiple label="Выберите один или несколько прайс-листов для поиска" density="compact" :items="catalogs" item-title="title" item-value="id" variant="underlined"></v-select>
            <v-text-field v-model="searchValue" label="Поиск товара или услуги" variant="underlined" density="compact" append-inner-icon="mdi-magnify" :disabled="!selectedCatalogs"></v-text-field>
            <v-row v-if="notFound">Ничего не найдено</v-row>
            <template v-if="listDone">
                <v-checkbox class="mb-1" v-model="multiplSelect" label="Выбрать несколько позиций" hide-details color="primary" density="compact" @click="checkSelectedProds(multiplSelect)"></v-checkbox>
                <!-- <v-row>
                        <v-col v-for="(section, i) in items" cols="12" sm="4">
                            <v-list density="compact">
                                <v-list-subheader>{{ section[0].sectionTitle }}</v-list-subheader>
                                <v-list-item v-for="(item, i) in section" :key="i" :value="item" color="primary" :title="item.title" @click="multiplSelect? selectedProducts.push(item): selectedProducts[0] = item"></v-list-item>
                            </v-list>    

                            <v-expansion-panels>
                                <v-expansion-panel :title="section[0].sectionTitle">
                                    <v-expansion-panel-text>
                                        <v-list density="compact">
                                        <v-list-item v-for="(item, i) in section" :key="i" :value="item" color="primary" :title="item.title" @click="multiplSelect? selectedProducts.push(item): selectedProducts[0] = item"></v-list-item>
                                        </v-list>    
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-col>
                    </v-row> -->
                    <v-row v-for="prod in items">
                        <v-list density="compact" class="ma-0 pa-0">
                            <v-list-item :value="prod" :active="false" @click="multiplSelect? selectedProducts.push(prod) : selectedProducts[0] = prod">
                                <v-list-item-title>
                                    {{ prod.title + ' ' + '(' + prod.catalogTitle + ',' + prod.sectionTitle + ')' }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>    
                    </v-row>
            </template>
            <v-select v-if="listDone" v-model="selectedProducts" class="mt-2" readonly label="Выбранные вами позиции" item-title="title" :multiple="multiplSelect" variant="underlined" density="compact" :items="selectedProducts"></v-select>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="getProductsListView()">Готово</v-btn>
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

let multiplSelect = ref(false)
let notFound = ref(false)
let searchValue = ref('')
let selectedCatalogs: any = ref()
let listDone = ref(false)
let selectedProducts: any = ref([])
let items: any = ref([])
let loading = ref(false)
let catalogs = [
    {title: 'Прайс 1', id: '30ec367f-3fd2-424f-9264-d446b0c88fa9'},{title: 'Прайс 2', id: '29eed9fe-2d84-4762-a158-76aad4663e9b'},{title: 'Прайс 3', id: 'e5e74226-df18-42a0-9255-b79df84e222a'}
]

const sortingFunction = (data: IProductFtsListView[]) => {
    let catalogs = data.reduce((acc,elem)=>acc.add(elem.catalogTitle), new Set());
    for (const catalogSections of catalogs) {
        let tempArr = data.filter((products) => products.catalogTitle == catalogSections);
        let sections = tempArr.reduce((acc,elem)=>acc.add(elem.sectionTitle), new Set());
        for (const sectionProducts of sections){
            let subArr = tempArr.filter((products) => products.sectionTitle == sectionProducts);
            items.value.push(subArr);
        }
    }
}

const checkSelectedProds = (state) => {
    console.log(state)
    if(state){
        selectedProducts.value = selectedProducts.value.splice(0, selectedProducts.value.lenght)
    }
}

const clearFunc = () => {
    items.value = []
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
        // sortingFunction(prods);
        items.value = prods;
        listDone.value = true;
        loading.value = false;
    } else {
        notFound.value = true;
    }
}
</script>

<style>
.v-expansion-panel-text__wrapper{
  padding: 0;
}
</style>