<template>
  <FormsEditWindowDialog title="Профиль сотрудника" :on-save="save" :on-close="close" :readonly="readonly">
    <template #default="{ fieldsOptions }">
      <v-card-text>
        <v-row class="mt-1">
          

    
            <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.reference" v-model="rec!.MData.changedAt"
              label="Должность" :constraints="{ reference: '' }" />
</v-row>

       

      </v-card-text>
    </template>
  </FormsEditWindowDialog>>
</template>
 
<script setup lang="ts">
import '@vuepic/vue-datepicker/dist/main.css'
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { PageMap } from '~/lib/PageMap';
import { UserContext } from '~/lib/UserContext';
import { EEmployeeAccountStatus, EmployeeRecord } from '~/lib/MoApi/Records/EmployeeRecord'
import { useI18n } from "vue-i18n"
import { EmployeeDocumentsRecord } from '~/lib/MoApi/Records/EmployeeDocumentsRecord';
import { EmployeeContactsRecord } from '~/lib/MoApi/Records/EmployeeContactsRecord';
import * as vHelpers from '~~/libVis/Helpers';
import InputField from '~/components/InputField.vue';
import AddressInput from '~/components/AddressInput.vue';
import { EDataType } from '~/lib/globalTypes';
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/lib/Dicts/DictionaryStore';
import AddressEntity from '~/lib/MoApi/Records/DataEntities/AddressEntity';
import { Dictionary } from "~/lib/Dicts/Dictionary";
import * as persDocDictConst from "~/lib/Dicts/DictPersonalDocumentsConst";
import PersonalDocumentEntity from '~/lib/MoApi/Records/DataEntities/PersonalDocumentEntity';
import { getNextSerialKey } from '~/lib/Utils';
import { Exception } from '~/lib/Exceptions';
import { chkTrait } from "~/lib/Utils";
import { RolesRecord } from '~/lib/MoApi/Records/RolesRecord';
import { useEditForm } from '~/componentComposables/editForms/useEditForm';
import { PositionRecord } from '~/lib/MoApi/Records/PositionRecord';

const { t, locale } = useI18n();


interface IProps {
  recKey: string | null
}

const props = defineProps<IProps>();

const iocc = useContainer();
const recStore = iocc.get(RecordsStore);


let dictStore = iocc.get<MoApiClient>("MoApiClient").getDictionaryStore();
let dictPersDocs = dictStore.getDictionary(EDictionaries.PersonalDocumentTypes);
let userCtx = iocc.get<UserContext>("UserContext");


let rec = ref<PositionRecord>();


if (props.recKey) {
  let recs = await recStore.getRecordsM([
    { id: { key: props.recKey, type: PositionRecord } }
  ]);

  rec.value = recs[0] as PositionRecord;
}
else {
  rec.value = await recStore.createNew(PositionRecord, (data) => { });
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


const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};





defineExpose({ eventsHandler });

</script>


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>