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
      <v-row class="mt-1 justify-center">
        <img class="mr-4  bg-secondary rounded-circle" height="128" width="128" :src="foto" @click="() => upldFoto()" />

      </v-row>
      <v-file-input id="avatar" label="File input" variant="outlined"></v-file-input>
      <v-row class="mt-10">
        <v-col sm="4">
          <v-text-field label="Фамилия" v-model="rec.MData.surname" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иванов" density="compact" v-maska:[fioMaskOptions] />
        </v-col>

        <v-col sm="4">
          <v-text-field label="Имя" v-model="rec.MData.name" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иван" density="compact" :rules="[(v: string) => !!v || $t('required')]"
            v-maska:[fioMaskOptions] />
        </v-col>

        <v-col sm="4">
          <v-text-field label="Отчество" v-model="rec.MData.patronymic" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иванович" density="compact" v-maska:[fioMaskOptions] />
        </v-col>

      </v-row>

      <v-row class="">
        <v-col sm="4">
          <DatePicker v-model="rec.MData.birthdate" :label="$t('birthdate')" />
        </v-col>
      </v-row>

    </v-card-text>
    <v-card-actions class="mr-4 mb-1">
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="text" @click="rec.cancelModifingData(); close(null)">
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

const rec = ref(props.recKey ? await recStore.fetch(ClientRecord, props.recKey) : await recStore.createNew(ClientRecord, (data) => { }));

const isRecLock = ref();

watch(isRecLock, (val) => {
  if (!val)
    warnToast("Запись заблокирована для изменения. Редакция невозможна");
})

isRecLock.value = await rec.value.lock();


let pingLockInterval = setInterval(async () => {
  isRecLock.value = await rec.value.lock();
}, 150 * 1000)


let flrec = await recStore.fetch(FilelinkRecord, "8c9b8add-8a62-4efd-8e49-d27e50550414");
foto.value = URL.createObjectURL(await flrec.GetBlob());


const upldFoto = async () => {
  const input: any = document.getElementById('avatar');

  let nflrec = await recStore.createNew<FilelinkRecord, IFilelinkRecordData>(FilelinkRecord, (data) => { data.title = "avatar" });
  debugger;
  nflrec.SetFile(input.files[0]);
  nflrec.save();

}

const onSaveBtnClick = async () => {
  await rec.value.save();
  close(rec.value.Key);
}


const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};


const close = (result) => {
  clearInterval(pingLockInterval);
  rec.value.unlock();
  closeDialog(result)
}


defineExpose({ eventsHandler });




</script>