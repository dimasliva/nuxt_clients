<template>
  <FormsEditWindowDialog title="Профиль сотрудника" :on-save="save" :on-close="close" :readonly="readonly">
    <template #default="{ fieldsOptions }">
      <v-card-text>
        <v-row class="mt-1">
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


            <!--Управление аккаунтом-->
            <v-menu v-if="chkTrait(['dbEmployee'], 's')">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props"
                  :disabled="fieldsOptions.readonly || fieldsOptions.changedCnt != 0 || fieldsOptions.errCnt != 0"
                  variant="tonal">
                  Аккаунт
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-list @mouseleave="(e) => { isActive.value = false }">
                  <v-list-item v-for="action in AccountActionsMenu"
                    @click-once="() => action.action(props, fieldsOptions)">
                    <v-icon :icon="action.icon" size="x-small" />
                    {{ action.title }}
                  </v-list-item>
                </v-list>
              </template>
            </v-menu>

          </v-col>
        </v-row>

        <v-row>
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.strictstringarray" />
        </v-row>

        <v-expansion-panels model-value="1" class="mt-2">
          <v-expansion-panel elevation="0" value="1">
            <v-expansion-panel-title class="text-subtitle-1">Контакты</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="mt-3" />
              <v-row>
                <v-col sm="6">
                  <!--Телефон-->
                  <InputField style="width: 265px;" :state="fieldsOptions" :type="EDataType.phone" required
                    label="Телефон" v-model="recCont!.MData.mainPhone" />
                </v-col>
                <v-col sm="6">
                  <!--Email-->
                  <InputField style="width: 265px;" required :state="fieldsOptions" :type="EDataType.email"
                    label="Электронная почта" v-model="recCont!.MData.mainEmail" />
                </v-col>
              </v-row>
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

const { t, locale } = useI18n();

class VisWrap<T>{
  modelValue: T;
  key: number = getNextSerialKey();

  constructor(data: T, public isNew: boolean, public isFocused = false) {
    this.modelValue = <T>reactive(data as object);
  };

  static fromArr<T>(arr: T[] | null | undefined) {
    if (!arr)
      return null;
    return arr.map((item) => new VisWrap(item, false));
  }

  static toArr<T>(arr: VisWrap<T>[] | null | undefined) {
    if (!arr)
      return null;

    return arr.map((item) => item.modelValue);
  }
}

interface IProps {
  recKey: string | null
}

const props = defineProps<IProps>();

const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const foto = ref("");
const gender = ref("");
const isRecLock = ref();
const isAccount = ref(false);
let readonly = ref(false);
const accountStatus = ref(EEmployeeAccountStatus.NotPresent);

let dictStore = iocc.get<MoApiClient>("MoApiClient").getDictionaryStore();
let dictPersDocs = dictStore.getDictionary(EDictionaries.PersonalDocumentTypes);
let userCtx=iocc.get<UserContext>("UserContext");
const persIdentDocLists = ref(Dictionary.itemsToValueTitle((await dictPersDocs.getItems(0))!));
const persDocLists = ref(Dictionary.itemsToValueTitle(
  Object.assign((await dictPersDocs.getItems(1 * Dictionary.DICT_SECTION_K))!, await dictPersDocs.getItems(Dictionary.DICT_USER_SECTION))));


const capWordMask = {
  mask: "Aa",
  tokens: { A: { pattern: /[A-я]/, transform: (chr: string) => chr.toUpperCase() }, a: { pattern: /[a-я,0-9]/, multiple: true } }
}

const capLettersNumbersMask = {
  mask: "a",
  tokens: { a: { pattern: /[A-z,А-я,0-9]/, multiple: true } }
}



const fioOptions = reactive({
  class: "mb-1",
  type: EDataType.string,
  constraints: { max: 128, min: 2 },
  maska: capWordMask
});


const PhotoActionsMenu = [
  { id: "1", title: "Выбрать фото", icon: "mdi-pencil", disabled: false, action: (props, fieldsOptions) => props.openFileDialog(), traits: { dbEmployee: "u" } },
  { id: "2", title: "Удалить фото", icon: "mdi-delete", disabled: false, action: (props, fieldsOptions) => delPhoto(fieldsOptions), traits: { dbEmployee: "d" } },
]

let rolesRec: RolesRecord = null!;


let rec = ref<EmployeeRecord>();
let recDoc = ref<EmployeeDocumentsRecord>();
let recCont = ref<EmployeeContactsRecord>();


if (props.recKey) {
  let recs = await recStore.getRecordsM([
    { id: { key: userCtx.AuthorityData!.companyId!, type: RolesRecord } },
    { id: { key: props.recKey, type: EmployeeRecord } },
    { id: { key: props.recKey, type: EmployeeDocumentsRecord }, optional: true },
    { id: { key: props.recKey, type: EmployeeContactsRecord }, optional: true }
  ]);

  rolesRec = recs[0] as RolesRecord;
  rec.value = recs[1] as EmployeeRecord;
  recDoc.value = recs[2] as EmployeeDocumentsRecord;
  recCont.value = recs[3] as EmployeeContactsRecord;

  accountStatus.value = await rec.value.getStatusEmployeeAccount();
}
else {
  rolesRec = await recStore.fetch(RolesRecord, "0");
  rec.value = await recStore.createNew(EmployeeRecord, (data) => { });
  recDoc.value = await recStore.createNew(EmployeeDocumentsRecord, (data) => { });
  recCont.value = await recStore.createNew(EmployeeContactsRecord, (data) => { });
}


///Документы



///Блокировка записей
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
    await rec.value?.setMPhoto(file)
    foto.value = URL.createObjectURL(file);
  }
  else {
    let blob = await rec.value?.getCurrentPhoto();
    if (blob)
      foto.value = URL.createObjectURL(blob);
    else
      foto.value = "/doctor-test.jpg";
  }
}

setPhoto();

const delPhoto = (fieldsOptions) => {
  rec.value!.delMPhoto();
  foto.value = "/doctor-test.jpg";
  fieldsOptions.changedCnt++;
}


if (rec.value.Data!.gender != "u")
  gender.value = rec.value.Data!.gender;

watch(gender, (val, oldval) => {
  rec.value!.MData.gender = gender.value = val;
});


const AccountActionsMenu = computedAsync(async () => {
  let res = [] as any;
  if (accountStatus.value == EEmployeeAccountStatus.NotPresent) {
    res.push({ id: "1", title: "Создать аккаунт", icon: "mdi-account-plus", disabled: false, action: () => createAccount(), traits: { dbEmployee: "s" } });
  }
  else
    if (accountStatus.value == EEmployeeAccountStatus.isActive) {
      res.push({ id: "1", title: "Отключить аккаунт", icon: "mdi-account-cancel", disabled: false, action: () => setAccountActivity(false), traits: { dbEmployee: "s" } });
      res.push({ id: "2", title: "Удалить аккаунт", icon: "mdi-account-remove", disabled: false, action: () => delAccount(), traits: { dbEmployee: "s" } });
    }
    else
      if (accountStatus.value == EEmployeeAccountStatus.isNotActive) {
        res.push({ id: "1", title: "Включить аккаунт", icon: "mdi-account", disabled: false, action: (props, fieldsOptions) => setAccountActivity(true), traits: { dbEmployee: "s" } });
        res.push({ id: "2", title: "Удалить аккаунт", icon: "mdi-account-remove", disabled: false, action: () => delAccount(), traits: { dbEmployee: "s" } });
      }

  return res;
});


const createAccount = async () => {

  if (await rec.value!.isAccountPresent(recCont.value!.MData.mainEmail!)) {
    errToast(`Логин ${recCont.value!.MData.mainEmail} уже существует`);
    return;
  }

  try {
    await rec.value!.createEmployeeAccount(recCont.value!.Data!.mainEmail!);
    accountStatus.value = EEmployeeAccountStatus.isActive;
    infoToast(`Аккаунт создан`);
  }
  catch {
    errToast(`Ошибка создания аккаунта`);
  }
}


const setAccountActivity = async (active: boolean) => {

  try {
    await rec.value!.setAccountActivity(active);
    accountStatus.value = active ? EEmployeeAccountStatus.isActive : EEmployeeAccountStatus.isNotActive;
    infoToast(active ? `Аккаунт включен` : `Аккаунт отключен`);
  }
  catch {
    errToast(`Ошибка изменения состояния аккаунта`);
  }
}


const delAccount = async () => {

  try {
    if (await useDelQU("Удалить аккаунт")) {
      await rec.value!.deleteEmployeeAccount();
      accountStatus.value = EEmployeeAccountStatus.NotPresent;
      infoToast(`Аккаунт удален`);
    }
  }
  catch {
    errToast(`Ошибка удаления аккаунта`);
  }
}


const save = async () => {

  if (rec.value!.IsNew) {
    await rec.value!.save();
    recDoc.value!.Key = rec.value!.Key;
    recCont.value!.Key = rec.value!.Key;
  }
  else
    await rec.value!.save();

  await recDoc.value!.save();
  await recCont.value!.save();
}



const cancelModifingData = () => {
  rec.value!.cancelModifingData();
  recDoc.value!.cancelModifingData();
  recCont.value!.cancelModifingData();
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

</script>


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>