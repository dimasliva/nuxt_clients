<template>
  <FormsEditWindowDialog title="Профиль раздела каталога" :on-save="save" :on-close="close" :readonly="readonly">
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
import { RecordsStore } from '~/src/common/lib/MoApi/Records/RecordsStore';
import { UserContext } from '~/src/common/lib/UserContext';
import { useI18n } from "vue-i18n"
import * as vHelpers from '~uilib/Helpers';
import InputField from '~/src/widgets/Layers/InputField.vue';
import { EDataType } from '~/src/common/lib/globalTypes';
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/src/common/lib/Dicts/DictionaryStore';
import { Exception } from '~/src/common/lib/Exceptions';
import { useEditForm } from '~forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';
import { ProductsCatalogSectionRecord } from '~/src/common/lib/MoApi/Records/ProductsCatalogSectionRecord';
import type { Container } from 'inversify/lib/container/container';


const { t, locale } = useI18n();


interface IProps {
  diC?: Container;
  recKey: string | null;
  rec?: ProductsCatalogSectionRecord,
  readonly?: boolean
}

const props = defineProps<IProps>();

const diC = props.diC || useSessionContainer();
const recStore = diC.get<RecordsStore>("RecordsStore");

/*
let dictStore = diC.get<MoApiClient>("MoApiClient").getDictionaryStore();
let dictPersDocs = dictStore.getDictionary(EDictionaries.PersonalDocumentTypes);
let userCtx = diC.get<UserContext>("UserContext");
*/

const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};

defineExpose({ eventsHandler });


let rec = ref<ProductsCatalogSectionRecord>();


if (props.rec)
  rec.value = props.rec
else
  if (props.recKey) {
    let recs = await recStore.getRecordsM([
      { id: { key: props.recKey, type: ProductsCatalogSectionRecord } }
    ]);

    rec.value = recs[0] as ProductsCatalogSectionRecord;
  }
  else {
    rec.value = await recStore.createNew(ProductsCatalogSectionRecord, (data) => { });
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
//dictFinderDataProvider.init("serachProductsCatalogSections", false, EDictionaries.CompanyProductsCatalogSections);

//const emplFioFinderDataProvider = iocc.get(EmployeeFioFinderDataProvider);
//emplFioFinderDataProvider.init("fioEmployyee");



</script>


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>