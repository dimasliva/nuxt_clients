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
            <v-row v-if="props.prices">
                <v-col>
                    <v-select @vue:updated="selectedCatalogs.length == catalogs.length? selectAllCatalogs=true : selectAllCatalogs = false" v-model="selectedCatalogs" multiple label="Выберите один или несколько прайс-листов для поиска" density="compact" :items="catalogs" item-title="title" item-value="id" variant="underlined"></v-select>
                    <v-checkbox @update:model-value="searchAllCatalogs()" class="mb-2" density="compact" color="primary" hide-details label="Искать по всем прайс-листам" v-model="selectAllCatalogs"></v-checkbox>
                </v-col>
            </v-row>
            <v-text-field @input="autoReq()" clearable v-model="searchValue" label="Поиск" :placeholder="props.text_field" variant="underlined" density="compact" append-inner-icon="mdi-magnify" :disabled="!selectedCatalogs"></v-text-field>
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
                    <v-row v-for="item in items">
                        <v-list lines="one" density="compact" class="ma-0 pa-0">
                            <v-list-item density="compact" class="py-0 my-0" :value="item" :active="false" @click="selectedItems.push(item)">
                                <v-list-item-title v-if="props.prices">
                                    {{ item.title + ' ' + '(' + item.catalogTitle + ',' + item.sectionTitle + ')' }}
                                </v-list-item-title>
                                <v-list-item-title v-else>
                                    {{item.surname+' '+item.name+' '+item.patronymic}}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>    
                    </v-row>
            </template>
            <v-divider v-if="listDone" :thickness="3" class="my-10"></v-divider>
            <v-combobox chips closable-chips v-if="listDone||selectedItems.length" v-model="selectedItems" readonly label="Вы выбрали" item-title="title" multiple variant="underlined" density="compact" :items="selectedItems"></v-combobox>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="closeDialog">Отмена</v-btn>
            <v-btn :disabled="!listDone" color="primary" @click="addSelectedProdutcs()" variant="text">Готово</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { ProductsCatalogRecord } from '~/lib/MoApi/Records/ProductsCatalogRecord';


const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const apiClient = iocc.get<MoApiClient>('MoApiClient');
interface Props {
    title: string,
    text_field: string,
    reqAction: (t: string, c?: any) => any[],
    prices: boolean,
    action: (p: any) => void,
}
const props = defineProps<Props>()


let selectAllCatalogs = ref(false)
let notFound = ref(false)
let searchValue = ref('')
let listDone = ref(false)
let selectedItems: any = ref([])
let items: any = ref([])
let loading = ref(false)
let catalogs = ref<any>([])
const catalogCookie = useCookie(
    'selectedCatalogs',
    {
        default: () => ([]),
        watch: true
    }   
);
let selectedCatalogs: any = ref(catalogCookie? catalogCookie : (catalogs.value.length > 1? [] : catalogs.value[0]))

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
    let res = await props.reqAction(searchValue.value, selectedCatalogs.value);
    console.log(res)
    if(res.length) {
        items.value = res;
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
    if(!props.prices){
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
    if(searchValue.value){
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