<template>
  <FormsEditWindowDialog title="Профиль должности" :on-save="save" :on-close="close" :readonly="readonly">
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
  </FormsEditWindowDialog>>
</template>

<script setup lang="ts">
import '@vuepic/vue-datepicker/dist/main.css'
import { ERecLockArg, RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { UserContext } from '~/lib/UserContext';
import { useI18n } from "vue-i18n"
import * as vHelpers from '~~/libVis/Helpers';
import InputField from '~/components/InputField.vue';
import { EDataType } from '~/lib/globalTypes';
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/lib/Dicts/DictionaryStore';
import { Exception } from '~/lib/Exceptions';
import { useEditForm } from '~/componentComposables/editForms/useEditForm';
import { PositionRecord } from '~/lib/MoApi/Records/PositionRecord';
import { QueryDictsFFParams } from '~/lib/MoApi/RequestArgs';
import { DictsFinderDataProvider } from '~/libVis/FinderDataProviders/DictsFinderDataProvider';
import { EmployeeFioFinderDataProvider } from '~/libVis/FinderDataProviders/EmployeeFioFinderDataProvider';
import { EmployeeRecord } from '~/lib/MoApi/Records/EmployeeRecord';
import type { Container } from 'inversify';


const { t, locale } = useI18n();


interface IProps {
  diC?: Container,
  recKey: string | null;
  readonly?: boolean;
}

const props = defineProps<IProps>();

const diC = props.diC || useSessionContainer();
const recStore = diC.get<RecordsStore>("RecordsStore");

let rec = ref<PositionRecord>();
let emplRec = ref<EmployeeRecord>();


if (props.recKey) {

  rec.value = await recStore.fetch(PositionRecord, props.recKey, ERecLockArg.Try, true);

  if (rec.value.Data!.employee)
    emplRec.value = await recStore.fetch(EmployeeRecord, rec.value.Data!.employee);
}
else {
  rec.value = await recStore.createNew(PositionRecord, (data) => { });
}

const { readonly, close } = await useEditForm(rec, props.readonly);



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

const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};


const dictFinderDataProvider = diC.get(DictsFinderDataProvider);
dictFinderDataProvider.init("serachPositions", false, EDictionaries.CompanyPositions);

const emplFioFinderDataProvider = diC.get(EmployeeFioFinderDataProvider);
emplFioFinderDataProvider.init("fioEmployyee");

defineExpose({ eventsHandler });

</script>


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>