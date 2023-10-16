<template>
  <FormsEditWindowDialog title="Профиль клиента" :on-save="save" :on-close="close" :readonly="readonly">
    <template #default="{ fieldsOptions }">
      <v-card-text>
        <v-row class="mt-1 ">
          <v-col xs="3" sm="3">

            <v-row class="mt-1 justify-start ">
              <img class="bg-secondary" width="128" :src="foto" />

              <!--Фото-->
              <FilePicker @onFileSelect="(f) => { setPhoto(f); fieldsOptions.changedCnt++; }" text="Выбор фото"
                variant="elevated" rounded color="primary"
                accept="image/png,image/gif,image/jpeg,image/tga,image/tiff,image/bmp,image/pbm,image/webp">
                <template #default="props">

                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn v-if="!fieldsOptions.readonly" v-bind="props" icon="mdi-dots-vertical"
                        variant="text"></v-btn>
                    </template>

                    <template v-slot:default="{ isActive }">
                      <v-list @mouseleave="(e) => { isActive.value = false }">
                        <v-list-item v-for="action in PhotoActionsMenu"
                          @click-once="() => action.action(props, fieldsOptions)">
                          <v-icon :icon="action.icon" size="x-small" />
                          {{ action.title }}
                        </v-list-item>
                      </v-list>
                    </template>
                  </v-menu>
                </template>
              </FilePicker>
            </v-row>
          </v-col>
          <v-col xs="3" sm="4">
            <!--Поля ФИО-->
            <InputField v-bind="fioOptions" :state="fieldsOptions" label="Фамилия" v-model="rec!.MData.surname" required
              placeholder="Иванов" />
            <InputField v-bind="fioOptions" :state="fieldsOptions" label="Имя" placeholder="Иван" required
              v-model="rec!.MData.name" />
            <InputField v-bind="fioOptions" :state="fieldsOptions" bel="Отчество" v-model="rec!.MData.patronymic"
              placeholder="Иванович" />
          </v-col>

          <v-col sm="1"></v-col>

          <v-col sm="3">
            <!--Поле даты рождения-->
            <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.date" v-model="rec!.MData.birthdate"
              :label="$t('birthdate')" :constraints="{ min: '1900-01-01', max: new Date() }" />

            <!--Поле выбора пола-->
            <InputField :state="fieldsOptions" :type="EDataType.strictstring" style=" max-width: 10dvh; height: 10px;"
              label="Пол" :items="[{ value: 'm', title: 'М' }, { value: 'f', title: 'Ж' }]" v-model="gender" required />
          </v-col>
        </v-row>


        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Контакты</v-expansion-panel-title>
            <v-expansion-panel-text>
              <InputField class="mt-3" style="width: 200px;" :constraints="{ min: 2 }" :state="fieldsOptions"
                :type="EDataType.phone" label="Основной телефон" v-model="recCont!.MData.mainPhone" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Документ, удостоверящий личность</v-expansion-panel-title>
            <v-expansion-panel-text>
              <InputField :state="fieldsOptions" :type="EDataType.string" label="Плавающее2" v-model="Int" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>


        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Другие документы</v-expansion-panel-title>
            <v-expansion-panel-text>
              <InputField :state="fieldsOptions" :type="EDataType.string" label="Плавающее2" v-model="Int" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Адрес постоянной регистрации</v-expansion-panel-title>
            <v-expansion-panel-text>
              <InputField :state="fieldsOptions" :type="EDataType.string" label="Плавающее2" v-model="Int" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Адрес фактического проживания</v-expansion-panel-title>
            <v-expansion-panel-text>
              <InputField :state="fieldsOptions" :type="EDataType.string" label="Плавающее2" v-model="Int" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>




      </v-card-text>
    </template>
  </FormsEditWindowDialog>>
</template>
 
<script setup lang="ts">
import '@vuepic/vue-datepicker/dist/main.css'
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { PageMap } from '~/lib/PageMap';
import { UserContext } from '~/lib/UserContext';
import { ClientRecord } from '~/lib/MoApi/Records/ClientRecord'
import { useI18n } from "vue-i18n"
import { ClientDocumentsRecord } from '~/lib/MoApi/Records/ClientDocumentsRecord';
import { ClientSdRecord } from '~/lib/MoApi/Records/ClientSd';
import { ClientAddressesRecord } from '~/lib/MoApi/Records/ClientAddressesRecord';
import { ClientContactsRecord } from '~/lib/MoApi/Records/ClientContactsRecord';
import * as vHelpers from '~~/libVis/Helpers';
import InputField from '~/components/InputField.vue';
import { EDataType } from '~/lib/globalTypes';
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/lib/Dicts/DictionaryStore';


const { t, locale } = useI18n();

interface IProps {
  recKey: string | null
}

const props = defineProps<IProps>();

const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const foto = ref("");
const gender = ref("");
const isRecLock = ref();
let readonly = ref(false);

const list = ref([]);
const Int = ref(45.000);




const fioOptions = reactive({
  class: "mb-1",
  type: EDataType.string,
  constraints: { max: 128, min: 2 },
  maska: {
    mask: "Aa",
    tokens: { A: { pattern: /[A-я]/, transform: (chr: string) => chr.toUpperCase() }, a: { pattern: /[a-я]/, multiple: true } }
  }
});


const PhotoActionsMenu = [
  { id: "1", title: "Выбрать фото", icon: "mdi-pencil", disabled: false, action: (props, fieldsOptions) => props.openFileDialog(), traits: { dbClient: "u" } },
  { id: "2", title: "Удалить фото", icon: "mdi-delete", disabled: false, action: (props, fieldsOptions) => delPhoto(fieldsOptions), traits: { dbClient: "d" } },
]

let rec = ref<ClientRecord>();
let recDoc = ref<ClientDocumentsRecord>();
let recAddr = ref<ClientAddressesRecord>();
let recCont = ref<ClientContactsRecord>();
let recSd = ref<ClientSdRecord>();

if (props.recKey) {
  rec.value = await recStore.fetch(ClientRecord, props.recKey);
  recDoc.value = await recStore.getOrCreate(ClientDocumentsRecord, props.recKey);
  recAddr.value = await recStore.getOrCreate(ClientAddressesRecord, props.recKey);
  recCont.value = await recStore.getOrCreate(ClientContactsRecord, props.recKey);
  recSd.value = await recStore.getOrCreate(ClientSdRecord, props.recKey);
}
else {
  rec.value = await recStore.createNew(ClientRecord, (data) => { });
  recDoc.value = await recStore.createNew(ClientDocumentsRecord, (data) => { });
  recAddr.value = await recStore.createNew(ClientAddressesRecord, (data) => { });
  recCont.value = await recStore.createNew(ClientContactsRecord, (data) => { });
  recSd.value = await recStore.createNew(ClientSdRecord, (data) => { });
}


watch(isRecLock, (val) => {
  if (!val) {
    warnToast("Запись заблокирована для изменения. Редакция невозможна");
    readonly.value = true;
  }
  else
    readonly.value = false;
});

let pingLockInterval: any = null;

if (!rec.value.IsNew) {
  isRecLock.value = await rec.value.lock();

  pingLockInterval = setInterval(async () => {
    isRecLock.value = await rec.value!.lock();
  }, 150 * 1000)
}


const setPhoto = async (file?: File) => {
  if (file) {
    await recSd.value?.setMPhoto(file)
    foto.value = URL.createObjectURL(file);
  }
  else {
    let blob = await recSd.value?.getCurrentPhoto();
    if (blob)
      foto.value = URL.createObjectURL(blob);
    else
      foto.value = "/doctor-test.jpg";
  }
}

setPhoto();

const delPhoto = (fieldsOptions) => {
  recSd.value!.delMPhoto();
  foto.value = "/doctor-test.jpg";
  fieldsOptions.changedCnt++;
}


if (rec.value.Data!.gender != "u")
  gender.value = rec.value.Data!.gender;

watch(gender, (val, oldval) => {
  rec.value!.MData.gender = gender.value = val;
});



const save = async () => {

  if (rec.value!.IsNew) {
    await rec.value!.save();
    recDoc.value!.Key = rec.value!.Key;
    recAddr.value!.Key = rec.value!.Key;
    recCont.value!.Key = rec.value!.Key;
    recSd.value!.Key = rec.value!.Key;
  }
  else
    await rec.value!.save();

  await recDoc.value!.save();
  await recAddr.value!.save();
  await recCont.value!.save();
  await recSd.value!.save();
}



const cancelModifingData = () => {
  rec.value!.cancelModifingData();
  recDoc.value!.cancelModifingData();
  recAddr.value!.cancelModifingData();
  recCont.value!.cancelModifingData();
  recSd.value!.cancelModifingData();
}


const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};


const close = () => {
  if (pingLockInterval) {
    clearInterval(pingLockInterval);
    rec.value!.unlock();
  }
  return rec.value?.Key;
}


defineExpose({ eventsHandler });

/*
let t1= iocc.get<MoApiClient>("MoApiClient");
let dict=t1.getDictionaryStore().getDictionary(EDictionaries.FileTypes); //"4a1f6ee3-e6ce-4f15-afac-a5edbd0fbdba"


let zn= await dict.GetValByCode(1);
let f=zn;
*/
/*
let t1= iocc.get<MoApiClient>("MoApiClient");
let t2= iocc.get(MoApiClient);
let eq= t1==t2;

let dict=t1.getDictionaryStore().getDictionary("1212");
debugger;
await t1.sendRtm("onDictionaryChanged", "1212", 2);
//await t1.sendRtm("testAsync");
*/
</script>