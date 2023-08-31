<template>
  <v-card width="700" style="height: 80dvh;">
    <v-card-title class="mx-2">
      <v-row class="pt-4">
        <div class="text-h5 ma-2">Профиль клиента</div>

        <v-spacer></v-spacer>
        <v-icon @click="close(null)">mdi-close</v-icon>
      </v-row>
    </v-card-title>
    <v-card-text>
      <v-row class="mt-1 justify-center ">
        <v-col>
          <v-row>
            <img class="bg-secondary rounded-circle" height="128" width="128" :src="foto" />
          </v-row>
          <v-row>
            <FilePicker @onFileSelect="(f) => setPhoto(f)" text="Выбор фото" variant="elevated" rounded color="primary"
              accept="image/*">
              <template #default="{ loading, openFileDialog }">

                <v-menu >
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text"
                    ></v-btn>
                  </template>

                  <template v-slot:default="{ isActive }">
                    <v-list @mouseleave="(e) => { isActive.value = false }">
                      <v-list-item v-for="action in PhotoActionsMenu" @click-once="() => action.action(item)">
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
      </v-row>


      <v-row class="mt-10">
        <v-col sm="4">
          <v-text-field label="Фамилия" v-model="rec!.MData.surname" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иванов" density="compact" v-maska:[fioMaskOptions] />
        </v-col>

        <v-col sm="4">
          <v-text-field label="Имя" v-model="rec!.MData.name" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иван" density="compact" :rules="[(v: string) => !!v || $t('required')]"
            v-maska:[fioMaskOptions] />
        </v-col>

        <v-col sm="4">
          <v-text-field label="Отчество" v-model="rec!.MData.patronymic" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иванович" density="compact" v-maska:[fioMaskOptions] />
        </v-col>

      </v-row>

      <v-row class="">
        <v-col sm="4">
          <DatePicker v-model="rec!.MData.birthdate" :label="$t('birthdate')" />
        </v-col>
      </v-row>

    </v-card-text>
    <v-card-actions class="mr-4 mb-1">
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="text" @click="cancelModifingData(); close(null)">
        {{ $t('close') }}
      </v-btn>
      <v-btn color="primary" variant="text" @click="onSaveBtnClick()">
        Сохранить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
 
<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { PageMap } from '~/lib/PageMap';
import { UserContext } from '~/lib/UserContext';
import { ClientRecord } from '~/lib/MoApi/Records/ClientRecord'
import { VDatePicker } from 'vuetify/labs/VDatePicker'
import { useI18n } from "vue-i18n"
import { FilelinkRecord, IFilelinkRecordData } from '~/lib/MoApi/Records/FilelinkRecord';
import { ClientDocumentsRecord } from '~/lib/MoApi/Records/ClientDocumentsRecord';
import { ClientSdRecord } from '~/lib/MoApi/Records/ClientSd';
import { ClientAddressesRecord } from '~/lib/MoApi/Records/ClientAddressesRecord';
import { ClientContactsRecord } from '~/lib/MoApi/Records/ClientContactsRecord';

const { t, locale } = useI18n();


interface IProps {
  recKey: string | null;
}

const props = defineProps<IProps>();

const iocc = useContainer();
const userCtx = iocc.get<UserContext>('UserContext');
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get(RecordsStore);
const foto = ref("");

const fioMaskOptions = {
  mask: "Aa",
  tokens: { A: { pattern: /[A-я]/, transform: (chr: string) => chr.toUpperCase() }, a: { pattern: /[a-я]/, multiple: true } }
}

const PhotoActionsMenu=  [
      { id: "1", title: "Выбрать фото", icon: "mdi-pencil", disabled: false, action: () => true, traits: { dbClient: "u" } },
      { id: "2", title: "Удалить фото", icon: "mdi-delete", disabled: false, action: () => { }, traits: { dbClient: "d" } },
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



const isRecLock = ref();

watch(isRecLock, (val) => {
  if (!val)
    warnToast("Запись заблокирована для изменения. Редакция невозможна");
})

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
      foto.value = "";
  }
}

setPhoto();


const onSaveBtnClick = async () => {
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

  close(rec.value!.Key);
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


const close = (result) => {
  if (pingLockInterval) {
    clearInterval(pingLockInterval);
    rec.value!.unlock();
  }

  closeDialog(result)
}


defineExpose({ eventsHandler });




</script>