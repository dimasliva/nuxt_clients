<template>
  <EditWindowDialog title="Профиль сотрудника" :on-save="save" :on-close="close" :readonly="readonly">
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
              :label="t('birthdate')" :constraints="{ min: '1900-01-01', max: new Date() }" />


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
          <!--Роли-->
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.strictstringarray" label="Роли" required
            :items="rolesLst" v-model="rolesVis" />
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
  </EditWindowDialog>>
</template>

<script setup lang="ts">
import '@vuepic/vue-datepicker/dist/main.css'
import { ERecLockArg, RecordsStore } from '~/src/common/lib/MoApi/Records/RecordsStore';
import { UserContext } from '~/src/common/lib/UserContext';
import { EEmployeeAccountStatus, EmployeeRecord } from '~/src/common/lib/MoApi/Records/EmployeeRecord'
import { useI18n } from "vue-i18n"
import { EmployeeDocumentsRecord } from '~/src/common/lib/MoApi/Records/EmployeeDocumentsRecord';
import { EmployeeContactsRecord } from '~/src/common/lib/MoApi/Records/EmployeeContactsRecord';
import * as vHelpers from '~uilib/Helpers';
import InputField from '~uibase/components/InputField.vue';
import { EDataType } from '~/src/common/lib/globalTypes';
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';
import { getNextSerialKey } from '~/src/common/lib/Utils';
import { Exception } from '~/src/common/lib/Exceptions';
import { chkTrait } from "~/src/common/lib/Utils";
import { RolesRecord } from '~/src/common/lib/MoApi/Records/RolesRecord';
import { useEditForm, useEditFormBegin } from '~forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';
import type { IProfileDialogProps } from './types';

const { t, locale } = useI18n();

class VisWrap<T> {
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


const props = defineProps<IProfileDialogProps>();

const { eventsHandler, diC, recStore } = useEditFormBegin(props);

defineExpose({ eventsHandler });

const foto = ref("");
const accountStatus = ref(EEmployeeAccountStatus.NotPresent);

let userCtx = diC.get<UserContext>("UserContext");


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
const rolesLst = ref<any[]>([]);


let rec = ref<EmployeeRecord>();
let recDoc = ref<EmployeeDocumentsRecord>();
let recCont = ref<EmployeeContactsRecord>();

const loadFunc = async () => {
  if (props.recKey) {
    rec.value = await recStore.fetch(EmployeeRecord, props.recKey, ERecLockArg.Try, true);
    let recs = await recStore.getRecordsM([
      { id: { key: userCtx.AuthorityData!.companyId!, type: RolesRecord } },
      { id: { key: props.recKey, type: EmployeeDocumentsRecord }, optional: true },
      { id: { key: props.recKey, type: EmployeeContactsRecord }, optional: true }
    ]);

    rolesRec = recs[0] as RolesRecord;
    recDoc.value = recs[1] as EmployeeDocumentsRecord;
    recCont.value = recs[2] as EmployeeContactsRecord;

    accountStatus.value = await rec.value.getStatusEmployeeAccount();
  }
  else {
    rolesRec = await recStore.fetch(RolesRecord, "0");
    rec.value = await recStore.createNew(EmployeeRecord, (data) => { });
    recDoc.value = await recStore.createNew(EmployeeDocumentsRecord, (data) => { });
    recCont.value = await recStore.createNew(EmployeeContactsRecord, (data) => { });
  }
  return rec;
}

const saveFunc = async () => {
  if (rec.value!.IsNew) {
    await rec.value!.save();
    recDoc.value!.MData.id = rec.value!.Key;
    recCont.value!.MData.id = rec.value!.Key;
  }
  else
    await rec.value!.save();

  await recDoc.value!.save();
  await recCont.value!.save();
}


const { readonly, close, save } = await useEditForm(loadFunc, saveFunc, props.readonly);

//роли
let roles = rolesRec.Data!.roles.getRoles();
for (let item in roles)
  rolesLst.value.push({ value: item, title: item });


const rolesVis = computed({
  get: () => rec.value!.MData.roles ? rec.value!.MData.roles.split(",") : null,
  set: (val) => rec.value!.MData.roles = (val!.length > 0) ? val!.join(",") : ""
});

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



const gender = computed({
  get() {
    return rec.value!.MData!.gender == "u" ? "" : rec.value!.MData!.gender
  },

  set(newValue) {
    rec.value!.MData!.gender = newValue || 'u';
  }
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


const cancelModifingData = () => {
  rec.value!.cancelModifingData();
  recDoc.value!.cancelModifingData();
  recCont.value!.cancelModifingData();
}





</script>


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>