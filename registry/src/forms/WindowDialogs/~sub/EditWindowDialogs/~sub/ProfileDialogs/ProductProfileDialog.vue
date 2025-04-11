<template>
  <EditWindowDialog title="Профиль товара или услуги" :on-save="save" :on-close="close" :readonly="readonly">
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
import { ERecLockArg, RecordsStore } from '~/src/common/lib/MoApi/Records/RecordsStore';
import { UserContext } from '~/src/common/lib/UserContext';
import { useI18n } from "vue-i18n"
import * as vHelpers from '~uilib/Helpers';
import InputField from '~uibase/components/InputField.vue';
import { EDataType } from '~/src/common/lib/globalTypes';
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/src/common/lib/Dicts/DictionaryStore';
import { Exception } from '~/src/common/lib/Exceptions';
import { useEditForm, useEditFormBegin} from '~forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';
import { ProductRecord } from '~/src/common/lib/MoApi/Records/ProductRecord';
import { EmployeeRecord } from '~/src/common/lib/MoApi/Records/EmployeeRecord';
import type { Container } from 'inversify';
import type { IProfileDialogProps } from './types';


const { t, locale } = useI18n();


interface IProps extends IProfileDialogProps {
  rec?: ProductRecord
}

const props = defineProps<IProps>();

const { eventsHandler, diC, recStore } = useEditFormBegin(props);

defineExpose({ eventsHandler });


let rec = ref<ProductRecord>();

const loadFunc = async () => {
  if (props.rec)
    rec.value = props.rec
  else
    if (props.recKey) {
      rec.value = await recStore.fetch(ProductRecord, props.recKey, ERecLockArg.Try, true);
    }
    else {
      rec.value = await recStore.createNew(ProductRecord, (data) => { });
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