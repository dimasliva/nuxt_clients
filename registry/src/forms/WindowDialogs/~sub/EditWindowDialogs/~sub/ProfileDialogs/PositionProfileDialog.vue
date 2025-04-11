<template>
  <EditWindowDialog title="Профиль должности" :on-save="save" :on-close="close" :readonly="readonly">
    <template #default="{ fieldsOptions }">
      <v-card-text>
        <v-row class="mt-1">
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.reference" v-model="fioEmployee"
            label="Сотрудник" :finderDataProvider="emplFioFinderDataProvider" :readonly="!rec!.IsNew" />
        </v-row>

        <v-row>
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.reference" v-model="positionPosition"
            label="Должность" :finderDataProvider="dictFinderDataProvider" />
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
import { useEditForm, useEditFormBegin } from '~forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';
import { PositionRecord } from '~/src/common/lib/MoApi/Records/PositionRecord';
import { QueryDictsFFParams } from '~/src/common/lib/MoApi/RequestArgs';
import { DictsFinderDataProvider } from '~/src/ui_tools/FinderDataProviders/~sub/DictsFinderDataProvider';
import { EmployeeFioFinderDataProvider } from '~/src/ui_tools/FinderDataProviders/~sub/EmployeeFioFinderDataProvider';
import { EmployeeRecord } from '~/src/common/lib/MoApi/Records/EmployeeRecord';
import type { Container } from 'inversify';
import type { IProfileDialogProps } from './types';


const { t, locale } = useI18n();


interface IProps {
  diC?: Container,
  recKey: string | null;
  readonly?: boolean;
}

const props = defineProps<IProfileDialogProps>();

const { eventsHandler, diC, recStore } = useEditFormBegin(props);

defineExpose({ eventsHandler });

let rec = ref<PositionRecord>();
let emplRec = ref<EmployeeRecord>();


const loadFunc = async () => {
  if (props.recKey) {

    rec.value = await recStore.fetch(PositionRecord, props.recKey, ERecLockArg.Try, true);

    if (rec.value.Data!.employee)
      emplRec.value = await recStore.fetch(EmployeeRecord, rec.value.Data!.employee);
  }
  else {
    rec.value = await recStore.createNew(PositionRecord, (data) => { });
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

const fioEmployee = computed({
  get() {
    return { value: rec.value!.MData!.employee }
  },
  set(newValue) {
    rec.value!.MData!.employee = newValue.value;
  }
})


const positionPosition = computed({
  get() {
    return { value: rec.value!.MData!.position }
  },
  set(newValue) {
    rec.value!.MData!.position = newValue?.value || 0;
  }
})


const dictFinderDataProvider = diC.get(DictsFinderDataProvider);
dictFinderDataProvider.init("serachPositions", false, EDictionaries.CompanyPositions);

const emplFioFinderDataProvider = diC.get(EmployeeFioFinderDataProvider);
emplFioFinderDataProvider.init("fioEmployyee");


</script>


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>