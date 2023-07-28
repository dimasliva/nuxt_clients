<template>
  <VRow class="ma-1">
    <VCol>
      <VCard v-if="loading == true" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
        <img src="../../public/cat-laptop.jpg" alt="cat">
      </VCard>
      <v-card v-if="data.length == 0 && loading == false" max-width="400" class="mx-auto" elevation="0">
        <v-card-text class="text-h6">Ничего не найдено, попробуйте изменить условия поиска</v-card-text>
        <img src="/cat-laptop-notfound.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto">
      </v-card>
      <Table v-if="loading == false && data.length > 0" @cheked="checkEmpl = $event, disabledFunc()"
        @person="checkEmpl = $event" :info="[]" :checkbox-show="show" :page="page" :headers="th" :actions="tableActions">
      </Table>
    </VCol>

    <v-expand-x-transition>
      <VCard v-show="drawer" class="mx-auto mb-auto" width="300">
        <VForm v-model="form">
          <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Поиск <v-spacer></v-spacer><v-icon
                @click="drawer = false">mdi-close</v-icon></v-row>

            <!--Для корректной работы ограничения длины строки должны быть заданы rules или v-maska или что то другое, что считывает значение после ввода --->
            <VTextField v-model="filtredData.fio" clearable hint="Введите минимум 2 символа"
              :ref="filtredData.$.fio.cRef" @click:clear="filtredData.fio = ''"
              @update:focused="lastField = filtredData.$.fio.cRef" label="ФИО" class="ma-1" variant="underlined"
              color="secondary" :rules="[]" />

            <VTextField v-model="filtredData.phone" clearable hint="Введите минимум 6 символов"
              :ref="filterFieldsRefs.phone" v-maska:[filtredData.$.phone] @click:clear="filtredData.phone = ''"
              @update:focused="lastField = filterFieldsRefs.phone" label="Телефон" class="ma-1" variant="underlined"
              color="secondary" />

            <VTextField v-model="filtredData.email" clearable hint="Введите минимум 3 символа"
              :ref="filterFieldsRefs.email" @click:clear="filtredData.email = ''"
              @update:focused="lastField = filterFieldsRefs.email" label="Электронная почта" class="ma-1"
              variant="underlined" color="secondary" :rules="[]" />

            <VTextField v-model="filtredData.snils" clearable hint="Введите 11 символов" :ref="filterFieldsRefs.snils"
              v-maska:[filtredData.$.snils] @click:clear="filtredData.snils = ''"
              @update:focused="lastField = filterFieldsRefs.snils" label="СНИЛС" class="ma-1" variant="underlined"
              color="secondary" />

            <v-row class="ma-1" style="min-width: 200pt;">
              <VBtn :disabled="btnsStates.btnFind" color="primary" variant="text"
                @click="() => { filteredData(), page = 1 }">Поиск</VBtn>
              <VBtn color="primary" variant="text" @click="filtredData.clear()"> Сбросить</VBtn>
            </v-row>
          </VCol>
        </VForm>
      </VCard>
    </v-expand-x-transition>

  </VRow>
  <v-pagination v-if="data.length" :length="data.length" v-model="page" :total-visible="7"></v-pagination>
  <v-snackbar v-model="resultAnswer" :timeout="2000" color="primary" variant="tonal">{{ message }}</v-snackbar>
</template>

<script setup lang="ts">
import Table from '~~/components/forms/Table.vue';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { IPageData, PageMap } from '~~/lib/PageMap';
import ConfirmActionDialog from '~~/components/forms/ConfirmActionDialog.vue';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { QueryParams } from '~~/lib/MoApi/RequestArgs';
import { ClientsViews } from '~/lib/MoApi/Views/ClientsViews';
import ClientProfileDialog from '~~/components/forms/ClientProfileDialog.vue';
import * as Helpers from '~~/lib/Helpers';
import maska from 'plugins/maska';


class FilterDataBase {

  clear() {
    for (let item in <any>this) {
      if (item.charAt(0) != '$')
        this[item] = null;
    }
  }

  static proxyHandler = {
    set(obj, prop, value) {
      let rules = obj["$"][prop].rules;
      if (rules) {
        if (rules.max && value && value.length > rules.max) return false;

      }
      return Reflect.set(obj, prop, value);
    }

  }
}


class FilterData extends FilterDataBase {

  fio:string | null = null;
  phone: string | null = null;
  email: string | null = null;
  snils: string | null = null;


  $ = {
    fio: { 
      rules:{ max: 10},
      cRef: ref()
     },
    email: { max: 10 },
    phone: { mask: '#-###-###-##-##-###-###' },
    snils: { mask: '###-###-### ##' }
  }

  static create = () => new Proxy<FilterData>(new FilterData, FilterData.proxyHandler);
}

const filtredData = reactive(FilterData.create());


let page = ref(1)
let itemPerPage = ref<number>(10)
let form = ref(false)
let drawer = ref(true)
let show = ref(false)
let loading = ref(false)


const emits = defineEmits(['cheked']);
const iocc = useContainer();
const apiClient = iocc.get<MoApiClient>("MoApiClient");
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get(RecordsStore);
const clientsViews = iocc.get(ClientsViews);
let checkEmpl = ref([]);
let deleteBtn = ref(true);

let lastField: Ref<any>;
let resultAnswer = ref(false);


const btnsStates = {
  btnFind: false
}

const filterFieldsRefs = {
  fio: ref(),
  phone: ref(),
  email: ref(),
  snils: ref()
};


let pageMapData: IPageData = reactive({
  title: "Клиенты", icon: "",
  mainBtnBar: [
    {
      id: "update", title: "Обновить", icon: "mdi-autorenew", disabled: false, color: "secondary", bkgColor: "red",
      action: () => updateData()
    },
    {
      id: "addClient", title: "Добавить", icon: "mdi-account", disabled: false, color: "secondary", bkgColor: "red",
      action: () => { openDialog(ClientProfileDialog, { empl: {}, action: addClient, header: 'Добавление клиента', button: 'Добавить', adding: true }, true); }
    },
    {
      id: "delete", title: "Удалить", icon: "mdi-delete", disabled: deleteBtn.value, color: "secondary", bkgColor: "red",
      action: () => openDialog(ConfirmActionDialog, { empl: checkEmpl.value, action: deleteEmpl })
    },
    {
      id: "filter", title: "", icon: "mdi-filter", disabled: false, color: "secondary", bkgColor: "red",
      action: () => (drawer.value = !drawer.value)
    },
  ]
});

pageMap.setPageData("/administration/clients", pageMapData);


const autoFocus = (e: KeyboardEvent) => {
  const key = e.key;
  if (loading.value == false) {
    console.log(key)
    if (/[a-яA-Я0-9]/.test(key) && key.length == 1) {
      drawer.value = true;
      if (!lastField)
        lastField = filterFieldsRefs.fio;
      lastField.value.focus();
    }
  }
  if (key === 'ArrowLeft' && page.value > 1) {
    page.value--
  } else if (key === 'ArrowRight' && page.value < data.value.length) {
    page.value++
  }
}

const updateFilterButtonsState = () => {
  if ((filtredData.fio || "").length < 2 && (filtredData.phone || "").length < 6 && (filtredData.email || "").length < 3) {
    return true
  } else {
    return false
  }
}





const eventsHandler = (e: string, d: any) => {

  switch (e) {
    case "onKeydown": autoFocus(d); return true;
  }
  return false;
};



const getClientData = async (select: string | string[], where: string | string[], quantity: number) => {

}

let currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 7);

const updateData = () => {
  let btn = pageMapData.mainBtnBar!.find((o) => o.id == "addClient");
  btn!.disabled = true;
  btn!.color = "red";
}

const addClient = async (name: string, surname: string, patronymic: string, gender: string, phone?: string, mail?: string) => {

}

const editClient = async (name: string, surname: string, patronymic: string, gender: string, mainPhone: string, mainEmail: string, id: string) => {

}

const deleteEmpl = async (id: any) => {

}

const disabledFunc = () => {
  debugger;
  (checkEmpl.value.length >= 1 && checkEmpl.value.length <= 5000) ? deleteBtn.value = false : deleteBtn.value = true;
}

let params = ref<string[]>([]);
let value = ref<string[]>([]);



const filterItems = (where: string, select: string | string[]) => {
  if (where !== '') {
    where = Helpers.removeSpaces(where);
    if (Array.isArray(select)) { // Обрабатываем случай, когда в строке может быть больше одного параметра, например ФИО.
      where = Helpers.toTitleCase(where);
      let currWhere = where.split(" ");
      select.map((str, i) => {
        if (!params.value.includes(str)) {
          params.value.push(str);
          value.value.push(currWhere[i]);
        } else {
          let ind = params.value.indexOf(str)
          value.value.splice(ind, 1, currWhere[ind])
        }
      })
      value.value = value.value.filter((el) => {
        return el !== undefined;
      })
      params.value.splice(currWhere.length)
    } else if (!params.value.includes(select)) {
      params.value.push(select);
      value.value.push(where);
    } else {
      let ind = params.value.indexOf(select) //С помощью ind делаем динамическое редактирование отдельных элементов, без необходимости обновлять форму целиком.
      value.value.splice(ind, 1, where)
    }
  } else {
    let emptIndex = value.value.findIndex((el) => {
      return el === '';
    })
    params.value.splice(emptIndex, 1);
    value.value.splice(emptIndex, 1);
  }
}

const filteredData = () => {
  data.value = [];
  getClientData(params.value, value.value, 500);
}

let th = [{ title: "ФИО", key: ["surname", "name", "patronymic"] }, { title: "Телефон", key: "mainPhone" }, { title: "E-mail", key: "mainEmail" }]

let data = ref<any>([])

let tableActions = ref([
  {
    id: "change", title: "Редактировать", icon: "mdi-pencil", color: "secondary", bkgColor: "red",
    action: () => { openDialog(ClientProfileDialog, { empl: checkEmpl.value, action: editClient, header: 'Карточка клиента', button: 'Сохранить', adding: false }, true, () => foc.value = true); foc.value = false }
  },
  {
    id: "delete", title: "Удалить", icon: "mdi-delete", color: "secondary", bkgColor: "red",
    action: () => openDialog(ConfirmActionDialog, { empl: checkEmpl.value, action: deleteEmpl })
  },
])


defineExpose({ eventsHandler });


</script>