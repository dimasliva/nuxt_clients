<template>
  <EditWindowDialog title="Профиль каталога товаров и услуг" :on-save="save" :on-close="close"
    :readonly="readonly">
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
  </EditWindowDialog>>
</template>

<script setup lang="ts">
import '@vuepic/vue-datepicker/dist/main.css'
import { ERecLockArg, type RecordsStore } from '~/src/common/lib/MoApi/Records/RecordsStore';
import type { UserContext } from '~/src/common/lib/UserContext';
import { useI18n } from "vue-i18n"
import * as vHelpers from '~uilib/Helpers';
import InputField from '~uibase/components/InputField.vue';
import { EDataType } from '~/src/common/lib/globalTypes';
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/src/common/lib/Dicts/DictionaryStore';
import { Exception } from '~/src/common/lib/Exceptions';
import { useEditForm, useEditFormBegin } from '~forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';
import { ProductsCatalogRecord } from '~/src/common/lib/MoApi/Records/ProductsCatalogRecord';
import { QueryDictsFFParams } from '~/src/common/lib/MoApi/RequestArgs';
import { DictsFinderDataProvider } from '~/src/ui_tools/FinderDataProviders/~sub/DictsFinderDataProvider';
import type { Container } from 'inversify';
import type { IProfileDialogProps } from './types';


const { t, locale } = useI18n();


interface IProps extends IProfileDialogProps {
  rec?: ProductsCatalogRecord
}

const props = defineProps<IProps>();

const { eventsHandler, diC, recStore } = useEditFormBegin(props);

defineExpose({ eventsHandler });


let rec = ref<ProductsCatalogRecord>();
const loadFunc = async () => {
  if (props.rec)
    rec.value = props.rec
  else
    if (props.recKey) {
      rec.value = await recStore.fetch(ProductsCatalogRecord, props.recKey, ERecLockArg.Try, true);
      /*
      let recs = await recStore.getRecordsM([
        { id: { key: props.recKey, type: ProductsCatalogRecord } }
      ]);

      rec.value = recs[0] as ProductsCatalogRecord;
      */
    }
    else {
      rec.value = await recStore.createNew(ProductsCatalogRecord, (data) => { });
    }
  return rec;
}

const saveFunc = async () => {
  if (rec.value!.IsNew) {
    await rec.value!.save();
  }
  else
    await rec.value!.save();
}

const { readonly, close, save } = await useEditForm(loadFunc, saveFunc, props.readonly);

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