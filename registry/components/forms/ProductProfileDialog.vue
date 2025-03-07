<template>
  <FormsEditWindowDialog title="Профиль товара или услуги" :on-save="save" :on-close="close" :readonly="readonly">
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
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { UserContext } from '~/lib/UserContext';
import { useI18n } from "vue-i18n"
import * as vHelpers from '~~/libVis/Helpers';
import InputField from '~/components/InputField.vue';
import { EDataType } from '~/lib/globalTypes';
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/lib/Dicts/DictionaryStore';
import { Exception } from '~/lib/Exceptions';
import { useEditForm } from '~/componentComposables/editForms/useEditForm';
import { ProductRecord } from '~/lib/MoApi/Records/ProductRecord';
import { EmployeeRecord } from '~/lib/MoApi/Records/EmployeeRecord';
import type { Container } from 'inversify';


const { t, locale } = useI18n();


interface IProps {
  diC?: Container;
  recKey: string | null;
  rec?: ProductRecord,
  readonly?: boolean
}

const props = defineProps<IProps>();

const diC = props.diC || useSessionContainer();
const recStore = diC.get<RecordsStore>("RecordsStore");


const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};

defineExpose({ eventsHandler });


let rec = ref<ProductRecord>();


if (props.rec)
  rec.value = props.rec
else
  if (props.recKey) {
    let recs = await recStore.getRecordsM([
      { id: { key: props.recKey, type: ProductRecord } }
    ]);

    rec.value = recs[0] as ProductRecord;
  }
  else {
    rec.value = await recStore.createNew(ProductRecord, (data) => { });
  }


const { isRecLock, readonly, close } = await useEditForm(rec, props.readonly);



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
//dictFinderDataProvider.init("serachProducts", false, EDictionaries.CompanyProducts);

//const emplFioFinderDataProvider = iocc.get(EmployeeFioFinderDataProvider);
//emplFioFinderDataProvider.init("fioEmployyee");



</script>


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>