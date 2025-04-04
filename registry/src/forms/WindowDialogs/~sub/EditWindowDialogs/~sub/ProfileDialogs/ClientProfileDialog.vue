<template>
  <EditWindowDialog title="Профиль клиента" :on-save="save" :on-close="close" :readonly="readonly">
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

            <!--Поле выбора пола-->
            <InputField :state="fieldsOptions" :type="EDataType.strictstring" style=" max-width: 10dvh; height: 10px;"
              label="Пол" :items="[{ value: 'm', title: 'М' }, { value: 'f', title: 'Ж' }]" v-model="gender" required />
          </v-col>
        </v-row>

        <v-expansion-panels model-value="1" class="mt-2">
          <v-expansion-panel elevation="0" value="1">
            <v-expansion-panel-title class="text-subtitle-1">Контакты</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="mt-3" />
              <v-row>
                <v-col sm="6">
                  <!--Основной телефон-->
                  <InputField style="width: 265px;" :state="fieldsOptions" :type="EDataType.phone"
                    label="Основной телефон" v-model="recCont!.MData.mainPhone" />
                </v-col>
                <v-col sm="6">
                  <!--Резервный телефон-->
                  <InputField style="width: 265px;" :state="fieldsOptions" :type="EDataType.phone"
                    label="Резервный телефон" v-model="recCont!.MData.reservPhone" />
                </v-col>
              </v-row>
              <v-col sm="6">
                <!--Email-->
                <InputField style="width: 265px;" :state="fieldsOptions" :type="EDataType.email"
                  label="Электронная почта" v-model="recCont!.MData.mainEmail" />
              </v-col>
              <v-row>

              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!--Документ, удостоверящий личность-->
        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Документ, удостоверящий личность</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row class="mt-3">
                <v-col>
                  <InputField :state="fieldsOptions" :type="EDataType.strictstring" label="Документ"
                    :items="persIdentDocLists" :item-props="(item) => { return { lines: 'two' } }"
                    v-model="recDoc!.MData.mainDocument" />
                </v-col>
              </v-row>

              <v-row>
                <v-col sm="2">
                  <InputField :state="fieldsOptions" :type="EDataType.string" label="Серия"
                    :maska="capLettersNumbersMask" v-model="recDoc!.MData.mainDocumentSeries"
                    :constraints="{ max: 32 }" />
                </v-col>
                <v-col sm="3">
                  <InputField :state="fieldsOptions" :type="EDataType.string" label="Номер"
                    :maska="capLettersNumbersMask" v-model="recDoc!.MData.mainDocumentNumber"
                    :constraints="{ max: 32 }" />
                </v-col>

                <v-col sm="3">
                  <InputField :state="fieldsOptions" :type="EDataType.date" label="Дата выдачи"
                    :maska="capLettersNumbersMask" v-model="recDoc!.MData.mainDocumentWhen"
                    :constraints="{ min: '1900-01-01', max: new Date() }" />
                </v-col>

                <v-col sm="3">
                  <InputField :state="fieldsOptions" :type="EDataType.string" label="Код подразделения"
                    :maska="capLettersNumbersMask" v-model="recDoc!.MData.mainDocumentWhoCode"
                    :constraints="{ max: 8 }" />
                </v-col>
              </v-row>
              <v-row>
                <v-col sm="12">
                  <InputField :state="fieldsOptions" :type="EDataType.string" label="Кем выдан"
                    :maska="capLettersNumbersMask" v-model="recDoc!.MData.mainDocumentWho"
                    :constraints="{ max: 256 }" />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!--Другие документы-->
        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Другие документы</v-expansion-panel-title>
            <v-expansion-panel-text>

              <v-row class="mt-3 justify-start">
                <v-menu scrollStrategy="close">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="text" size="small" prepend-icon="mdi-plus">Добавить</v-btn>
                  </template>
                  <v-list max-height="200" width="300" density="compact">
                    <v-list-item v-for="item in persDocLists" :title="item.title"
                      @click="() => onAddDoc(fieldsOptions, item.value)" />
                  </v-list>
                </v-menu>
              </v-row>

              <!--
                <v-col sm="4">
                  <InputField :state="fieldsOptions" :type="EDataType.string" label="СНИЛС"
                    :maska="{ mask: '###-###-### ##' }" :constraints="{ max: 32 }" :model-value="recDoc!.MData.snils" />
                </v-col>
-->


              <v-row v-for="item in docsDescr" :key="item.key">

                <v-col sm-10 class="pt-0">
                  <CustomPersonalDocumentInput :state="fieldsOptions" v-bind="<any>item"
                    @update:model-value="(val) => item.onChanged(val)" />
                </v-col>
                <v-col sm="2" class="d-flex align-center pl-0 pt-0">
                  <v-btn icon="mdi-delete" variant="plain" size="small"
                    @click="() => item.onDelete(fieldsOptions)"></v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Адрес фактического проживания</v-expansion-panel-title>
            <v-expansion-panel-text>
              <AddressInput :state="fieldsOptions"
                :model-value="recAddr!.MData.mainAddress || recStore.dataEntityFactory(AddressEntity)"
                @update:model-value="(val) => recAddr!.MData.mainAddress = val" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Адрес постоянной регистрации</v-expansion-panel-title>
            <v-expansion-panel-text>
              <InputField :state="fieldsOptions" :type="EDataType.bool" label="Совпадает с фактическим"
                v-model="recAddr!.MData.addressesEqual" hide-details></InputField>
              <AddressInput v-if="!recAddr!.MData.addressesEqual" :state="fieldsOptions"
                :model-value="recAddr!.MData.permanentRegistration || recStore.dataEntityFactory(AddressEntity)"
                @update:model-value="(val) => recAddr!.MData.permanentRegistration = val" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>




      </v-card-text>
    </template>
  </EditWindowDialog>>
</template>

<script setup lang="ts">
import  {EditWindowDialog}  from '~/src/forms/WindowDialogs/~sub/EditWindowDialogs';

import '@vuepic/vue-datepicker/dist/main.css'
import { ERecLockArg, RecordsStore } from '~/src/common/lib/MoApi/Records/RecordsStore';
import { PageMap } from '~/src/common/lib/PageMap';
import { UserContext } from '~/src/common/lib/UserContext';
import { ClientRecord } from '~/src/common/lib/MoApi/Records/ClientRecord'
import { useI18n } from "vue-i18n"
import { ClientDocumentsRecord } from '~/src/common/lib/MoApi/Records/ClientDocumentsRecord';
import { ClientSdRecord } from '~/src/common/lib/MoApi/Records/ClientSdRecord';
import { ClientAddressesRecord } from '~/src/common/lib/MoApi/Records/ClientAddressesRecord';
import { ClientContactsRecord } from '~/src/common/lib/MoApi/Records/ClientContactsRecord';
import * as vHelpers from '~uilib/Helpers';
import InputField from '~/src/widgets/Layers/InputField.vue';
import AddressInput from '~/src/components/AddressInput.vue';
import { EDataType } from '~/src/common/lib/globalTypes';
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';
import { EDictionaries } from '~/src/common/lib/Dicts/DictionaryStore';
import AddressEntity from '~/src/common/lib/MoApi/Records/DataEntities/AddressEntity';
import { Dictionary } from "~/src/common/lib/Dicts/Dictionary";
import * as persDocDictConst from "~/src/common/lib/Dicts/DictPersonalDocumentsConst";
import PersonalDocumentEntity from '~/src/common/lib/MoApi/Records/DataEntities/PersonalDocumentEntity';
import { getNextSerialKey } from '~/src/common/lib/Utils';
import { useEditForm, useEditFormBegin, type IEditFormProps } from '~/src/forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';


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


const props = defineProps<IEditFormProps>();

const { eventsHandler, diC, recStore } = useEditFormBegin(props);

defineExpose({ eventsHandler });

const foto = ref("");

let dictStore = diC.get<MoApiClient>("MoApiClient").getDictionaryStore();
let dictPersDocs = dictStore.getDictionary(EDictionaries.PersonalDocumentTypes);
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
  { id: "1", title: "Выбрать фото", icon: "mdi-pencil", disabled: false, action: (props, fieldsOptions) => props.openFileDialog(), traits: { dbClient: "u" } },
  { id: "2", title: "Удалить фото", icon: "mdi-delete", disabled: false, action: (props, fieldsOptions) => delPhoto(fieldsOptions), traits: { dbClient: "d" } },
]

let rec = ref<ClientRecord>();
let recDoc = ref<ClientDocumentsRecord>();
let recAddr = ref<ClientAddressesRecord>();
let recCont = ref<ClientContactsRecord>();
let recSd = ref<ClientSdRecord>();

const loadFunc = async () => {
  if (props.recKey) {

    rec.value = await recStore.fetch(ClientRecord, props.recKey, ERecLockArg.Try, true);

    let recs = await recStore.getRecordsM([
      { id: { key: props.recKey, type: ClientDocumentsRecord }, optional: true },
      { id: { key: props.recKey, type: ClientAddressesRecord }, optional: true },
      { id: { key: props.recKey, type: ClientContactsRecord }, optional: true },
      { id: { key: props.recKey, type: ClientSdRecord }, optional: true }
    ]);

    recDoc.value = recs[0] as ClientDocumentsRecord;
    recAddr.value = recs[1] as ClientAddressesRecord;
    recCont.value = recs[2] as ClientContactsRecord;
    recSd.value = recs[3] as ClientSdRecord;
  }
  else {
    rec.value = await recStore.createNew(ClientRecord, (data) => { });
    recDoc.value = await recStore.createNew(ClientDocumentsRecord, (data) => { });
    recAddr.value = await recStore.createNew(ClientAddressesRecord, (data) => { });
    recCont.value = await recStore.createNew(ClientContactsRecord, (data) => { });
    recSd.value = await recStore.createNew(ClientSdRecord, (data) => { });
  }
  return rec;
}


const saveFunc = async () => {
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


const { readonly, close, save } = await useEditForm(loadFunc, saveFunc, props.readonly);


///Документы

//получаем  recDoc.value!.MData.otherDocuments как реактивную переменную
const otherDocuments = reactive(VisWrap.fromArr(recDoc.value!.MData.otherDocuments) || []);


// изменения otherDocuments автоматически отображаются в recDoc.value!.MData.otherDocuments
watch(otherDocuments, (val) => {
  var res = VisWrap.toArr(val) || [];
  recDoc.value!.MData.otherDocuments = (res.length > 0) ? <any>res : null;
});


const docsDescr = computedAsync(async () => {

  //другие документы
  let res = otherDocuments.map((item, inx) => {
    let obj = {
      key: item.key,
      typeCode: item.modelValue.typeCode,
      modelValue: item.modelValue,
      opened: item.isNew,
      focused: item.isFocused,
      onChanged: (val) => {
        item.modelValue.fromJsonObj(val.getJsonObj())
      },

      onDelete: (fieldsOptions) => {
        fieldsOptions.changedCnt++;
        otherDocuments.splice(inx, 1);
      }
    }
    item.isNew = false;
    item.isFocused = false;

    return obj;
  });

  return res.reverse();
});

const onAddDoc = (fieldsOptions, typeCode) => {
  fieldsOptions.changedCnt++;
  otherDocuments.push(new VisWrap(recStore.dataEntityFactory(PersonalDocumentEntity, {
    typeCode: typeCode
  }), true, true));
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


const gender = computed({

  get() {
    return rec.value!.MData!.gender=="u"? "": rec.value!.MData!.gender
  },

  set(newValue) {
    rec.value!.MData!.gender = newValue || 'u';
  }
});



const cancelModifingData = () => {
  rec.value!.cancelModifingData();
  recDoc.value!.cancelModifingData();
  recAddr.value!.cancelModifingData();
  recCont.value!.cancelModifingData();
  recSd.value!.cancelModifingData();
}



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


<style scoped>
.v-expansion-panels {
  z-index: auto;
  /*необходим что бы выпадающий календарь у полей даты не перекрывался expansion-panels*/
}
</style>