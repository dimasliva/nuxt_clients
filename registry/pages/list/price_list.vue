<template>
    <v-expand-transition>
      <v-responsive class="mx-auto" max-width="800px">
        <v-text-field ref="searchField" clearable density="compact" class="ma-0 pa-0" variant="underlined" placeholder="Введите название номенклатурной позиции, например: Первичный прием"></v-text-field>
      </v-responsive>
    </v-expand-transition>
    <!-- <v-card v-if="" max-width="400" class="mx-auto" elevation="0">
      <v-card-text class="text-h6">Ничего не найдено.</v-card-text>
    </v-card> -->
    <div id="roleContainer" class="ma-4"  style="height: 75vh; overflow-y: auto;"> 
      <v-expansion-panels>
          <v-expansion-panel v-for="catalogs in productsCatalogs" elevation="1">
            <v-expansion-panel-title  @click="getProductsData()" class="text-h6">{{ catalogs.title }}</v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-expansion-panels>
                    <v-expansion-panel  title="Раздел 1">
                        <v-expansion-panel-text>
                            <v-list  >
                                <v-list-item v-for="product in productsCatalogSection" :title="product.title"></v-list-item>
                            </v-list>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-expansion-panel-text>
          </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <v-snackbar :timeout="2000" color="primary" variant="tonal">{{  }}фывфывфы</v-snackbar>  
</template>

<script setup lang="ts">
import { UserContext } from '~~/lib/UserContext';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { PageMap, type IPageData } from '~~/lib/PageMap';
import { QueryParams } from '~~/lib/MoApi/RequestArgs';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { ProductRecord, ProductRecordData } from '~~/lib/MoApi/Records/ProductRecord';
import { ProductsCatalogRecord, ProductsCatalogRecordData } from '~~/lib/MoApi/Records/ProductsCatalogRecord';



let productsCatalogSection = [{title: 'Товар #1', value: 1,},
        {title: 'Услуга #2', value: 2,},
        {title: 'Товар #3', value: 3,}]

let productsCatalogs = [{title: 'Прайс #1', value: 1,},
        {title: 'Прайс #2', value: 2,},
        {title: 'Прайс #3', value: 3,}]

        
const iocc=useContainer();
const usData = iocc.get(UserContext);
const recStore = iocc.get(RecordsStore);
const apiTemp = iocc.get(MoApiClient);
const pageMap = iocc.get<PageMap>("PageMap");

let pageMapData: IPageData = reactive({title: "Прайс-листы", icon: "mdi-list-box", mainBtnBar:[]});

const getProductsData = async() => {

}

const getProductCatalog = async () => {
    
}

const getProductCatalogSection = async () => {
    
}

pageMap.setPageData("/list/price_list", pageMapData);
</script>

<style scoped>
.v-expansion-panel-text__wrapper{
  padding: 0;
}
</style>