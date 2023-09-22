<template>
  <v-card width="800" style="height: 90dvh;">
    <v-card-title class="mx-2">
      <v-row class="pt-4">
        <div class="text-h5 ma-2">Профиль клиента</div>

        <v-spacer></v-spacer>
        <v-icon @click="close(null)">mdi-close</v-icon>
      </v-row>
    </v-card-title>
    <v-card-text>
      <v-row class="mt-1 ">
        <v-col xs="3" sm="3">

          <v-row class="mt-1 justify-start ">
            <img class="bg-secondary rounded-circle" height="128" width="128" :src="foto" />

            <!--Фото-->
            <FilePicker @onFileSelect="(f) => { setPhoto(f); fieldsOptions.state.changedCnt++; }" text="Выбор фото"
              variant="elevated" rounded color="primary" accept="image/*">
              <template #default="props">

                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text"></v-btn>
                  </template>

                  <template v-slot:default="{ isActive }">
                    <v-list @mouseleave="(e) => { isActive.value = false }">
                      <v-list-item v-for="action in PhotoActionsMenu" @click-once="() => action.action(props)">
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
          <InputField v-bind="fioOptions" label="Фамилия" v-model="rec!.MData.surname" required placeholder="Иванов" />
          <InputField v-bind="fioOptions" label="Имя" placeholder="Иван" required v-model="rec!.MData.name" />
          <InputField v-bind="fioOptions" label="Отчество" v-model="rec!.MData.patronymic" placeholder="Иванович" />
        </v-col>

        <v-col sm="1"></v-col>

        <v-col sm="3">
          <!--Поле даты рождения-->
          <InputField v-bind="fieldsOptions" class="pb-4" :type="EDataType.date" v-model="rec!.MData.birthdate"
            :label="$t('birthdate')" :constraints="{ min: '1900-01-01', max: new Date() }" />

          <!--Поле выбора пола-->
          <InputField v-bind="fieldsOptions" :type="EDataType.strictstring" style=" max-width: 10dvh; height: 10px;"
            label="Пол" :items="[{ value: 'm', title: 'М' }, { value: 'f', title: 'Ж' }]" v-model="gender" required />
        </v-col>
      </v-row>

      <v-row>
        <InputField class="mb-5" v-bind="fieldsOptions" :type="EDataType.strictstringarray" style=" max-width: 50dvh;"
          label="Список" :items="[{ value: 'm', title: 'М' }, { value: 'f', title: 'Ж' }]" v-model="list" />
      </v-row>

      <v-row class="mt-1  mb-5">
        <InputField v-bind="fieldsOptions" :type="EDataType.int" label="Плавающее" v-model="Int" required
          :constraints="{ min: -10, max: 100, numAfterPoint: 2, fixed: true }" />
      </v-row>

      <v-row class="mt-1 ">
        <InputField v-bind="fieldsOptions" :type="EDataType.string" label="Плавающее2" v-model="Int" />
      </v-row>

    </v-card-text>
    <v-card-actions class="mr-4 mb-1">
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="text" @click="cancelModifingData(); close(null)">
        {{ $t('close') }}
      </v-btn>
      <v-btn color="primary" variant="text" :disabled="fieldsOptions.state.changedCnt == 0 || fieldsOptions.state.errCnt > 0"
        @click="onSaveBtnClick()">
        Сохранить
      </v-btn>
    </v-card-actions>
  </v-card>
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

const { t, locale } = useI18n();


interface IProps {
  recKey: string | null;
}

const props = defineProps<IProps>();

const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const foto = ref("");
const gender = ref("");
const isRecLock = ref();

const list = ref([]);
const Int = ref(45.000);

const fieldsOptions = reactive({
  state: {
    errCnt: 0,
    changedCnt: 0,
    readonly: isRecLock.value
  }
})


const fioOptions = reactive(Object.assign({
  class: "mb-1",
  type: EDataType.string,
  constraints: { max: 128, min: 2 },
  maska: {
    mask: "Aa",
    tokens: { A: { pattern: /[A-я]/, transform: (chr: string) => chr.toUpperCase() }, a: { pattern: /[a-я]/, multiple: true } }
  }
},
  fieldsOptions));


const PhotoActionsMenu = [
  { id: "1", title: "Выбрать фото", icon: "mdi-pencil", disabled: false, action: (props) => props.openFileDialog(), traits: { dbClient: "u" } },
  { id: "2", title: "Удалить фото", icon: "mdi-delete", disabled: false, action: (props) => delPhoto(), traits: { dbClient: "d" } },
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

const delPhoto = () => {
  recSd.value!.delMPhoto();
  foto.value = "";
  fieldsOptions.state.changedCnt++;
}


if (rec.value.Data!.gender != "u")
  gender.value = rec.value.Data!.gender;

watch(gender, (val, oldval) => {
  rec.value!.MData.gender = gender.value = val;
});



const save = async () => {

  let res = false;

  await vHelpers.action(async () => {
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
  })
    .then(() => { res = true; fieldsOptions.state.changedCnt = 0; });


  return res;
}


const onSaveBtnClick = async () => {
  if (await save())
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