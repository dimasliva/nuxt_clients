<template>
  <FormsEditWindowDialog title="Профиль каталога товаров и услуг" :on-save="save" :on-close="close" :readonly="readonly">
    <template #default="{ fieldsOptions }">
      <v-card-text>
        <v-row class="mt-1">
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.string" v-model="rec!.MData.title"
            label="Название" />
        </v-row>

        <v-row>
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.string" v-model="rec!.MData.comments"
            label="Комментарий" />
        </v-row>

      </v-card-text>
    </template>
  </FormsEditWindowDialog>>
</template>
 
<script setup lang="ts">
import '@vuepic/vue-datepicker/dist/main.css'
import type { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import type { UserContext } from '~/lib/UserContext';
import { useI18n } from "vue-i18n"
import * as vHelpers from '~~/libVis/Helpers';
import InputField from '~/components/InputField.vue';
import { EDataType } from '~/lib/globalTypes';
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/lib/Dicts/DictionaryStore';
import { Exception } from '~/lib/Exceptions';
import { useEditForm } from '~/componentComposables/editForms/useEditForm';
import { ProductsCatalogRecord } from '~/lib/MoApi/Records/ProductsCatalogRecord';
import { QueryDictsFFParams } from '~/lib/MoApi/RequestArgs';
import { DictsFinderDataProvider } from '~/libVis/FinderDataProviders/DictsFinderDataProvider';
import type { Container } from 'inversify/lib/container/container';


const { t, locale } = useI18n();


interface IProps {
  diC?: Container;
  recKey: string | null;
  rec?: ProductsCatalogRecord
}

const props = defineProps<IProps>();

const diC = props.diC || useSessionContainer();
const recStore = diC.get<RecordsStore>("RecordsStore");

let dictStore = diC.get<MoApiClient>("MoApiClient").getDictionaryStore();
let dictPersDocs = dictStore.getDictionary(EDictionaries.PersonalDocumentTypes);
let userCtx = diC.get<UserContext>("UserContext");


const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};

defineExpose({ eventsHandler });


let rec = ref<ProductsCatalogRecord>();

if (props.rec)
  rec.value = props.rec
else
  if (props.recKey) {
    let recs = await recStore.getRecordsM([
      { id: { key: props.recKey, type: ProductsCatalogRecord } }
    ]);

    rec.value = recs[0] as ProductsCatalogRecord;
  }
  else {
    rec.value = await recStore.createNew(ProductsCatalogRecord, (data) => { });
  }


const { isRecLock, readonly, close } = await useEditForm(rec);



const save = async () => {
  if (rec.value!.IsNew) {
    await rec.value!.save();
  }
  else
    await rec.value!.save();
}



const cancelModifingData = () => {
  rec.value!.cancelModifingData();
}





//const dictFinderDataProvider = iocc.get(DictsFinderDataProvider);
//dictFinderDataProvider.init("serachProductsCatalogs", false, EDictionaries.CompanyProductsCatalogs);

//const emplFioFinderDataProvider = iocc.get(EmployeeFioFinderDataProvider);
//emplFioFinderDataProvider.init("fioEmployyee");



</script>


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>