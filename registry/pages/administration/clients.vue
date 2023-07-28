<template>
  <VRow class="ma-1">
    <VCol>
      <VCard v-if="loading == true" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
        <img src="../../public/cat-laptop.jpg" alt="cat">
      </VCard>
      <v-card v-if="data.length == 0 && loading == false" max-width="400" class="mx-auto" elevation="0">
        <v-card-text class="text-h6">Ничего не найдено, попробуйте изменить условия поиска</v-card-text>
        <img src="/cat-laptop-notfound.jpg" alt="cat withj laptop" class="w-50 d-inline mx-auto">
      </v-card>
      <Table v-if="loading == false && data.length > 0" @cheked="checkEmpl = $event, disabledFunc()"
        @person="checkEmpl = $event" :info="filteredData.length ? filteredData : data" :checkbox-show="show" :page="page"
        :headers="th" :actions="tableActions">
      </Table>
    </VCol>

    <v-expand-x-transition>
      <VCard v-show="drawer" class="mx-auto mb-auto" width="300">
        <VForm v-model="form" @keydown.enter="btnDis() ? btnDis() : (filteredData(), page = 1)"
          @keyup.delete="(e) => { if (e.key == 'Delete') { fio = '', phone = '', email = '', params = [], value = [] } }">
          <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Поиск <v-spacer></v-spacer><v-icon
                @click="drawer = false">mdi-close</v-icon></v-row>
            <VTextField v-model="fio" clearable hint="Введите минимум 2 символа" ref="fioF"
              @click:clear="() => { filterItems('', th[0].key), fio = '' }" @update:focused="lastField = fioF"
              :label="th[0].title" class="ma-1" variant="underlined" color="secondary"
              @update:model-value="filterItems(fio, th[0].key)" />
            <VTextField v-model="phone" clearable hint="Введите минимум 6 символов" ref="phoneF"
              @click:clear="() => { filterItems('', th[1].key), phone = '' }" @update:focused="lastField = phoneF"
              :label="th[1].title" class="ma-1" variant="underlined" color="secondary"
              @update:model-value="filterItems(phone, th[1].key)" />
            <VTextField v-model="email" clearable hint="Введите минимум 3 символа" ref="emailF"
              @click:clear="() => { filterItems('', th[2].key), email = '' }" @update:focused="lastField = emailF"
              :label="th[2].title" class="ma-1" variant="underlined" color="secondary"
              @update:model-value="filterItems(email, th[2].key)" />
            <VTextField v-model="itemPerPage" label="Количество элементов на странице" class="ma-1" variant="underlined"
              color="secondary" type="number"></VTextField>
            <v-row class="ma-1" style="min-width: 200pt;">
              <VBtn :disabled="btnDis()" variant="text" @click="() => { filteredData(), page = 1 }">Поиск</VBtn>
              <VBtn variant="text"
                @click="() => { fio = '', phone = '', email = '', params = [], value = [], data = [], page = 1, getClientData('changedAt', currentDate.toISOString().slice(0, -14).replace(/-/g, ''), 100) }">
                Сбросить</VBtn>
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
import { EmployeeRecord, IEmployeeRecordData } from '~~/lib/MoApi/Records/EmployeeRecord';
import Table from '~~/components/forms/Table.vue';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { IPageData, PageMap } from '~~/lib/PageMap';
import EmplProfileDialog from '~~/components/forms/EmplProfileDialog.vue';
import ConfirmActionDialog from '~~/components/forms/ConfirmActionDialog.vue';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { EmployeesViews, IEmployeeListView } from '~~/lib/MoApi/Views/EmployeesViews';
import { QueryParams } from '~~/lib/MoApi/RequestArgs';
import { EmployeeContactsRecord, IEmployeeContactsRecordData } from '~~/lib/MoApi/Records/EmployeeContactsRecord';

let page = ref(1)
let itemPerPage = ref<number>(10)
let form = ref(false)
let drawer = ref(true)
let show = ref(false)
let loading = ref(false)
let fio = ref('')
let phone = ref('')
let email = ref('')
let message = ref('')

const emits = defineEmits(['cheked']);
const iocc = useContainer();
const apiClient = iocc.get<MoApiClient>("MoApiClient");
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get(RecordsStore);
const employeesViews = iocc.get(EmployeesViews);
let checkEmpl = ref([]);
let deleteBtn = ref(true);
let foc = ref(true)
const fioF = ref<any>(null)
const phoneF = ref<any>(null)
const emailF = ref<any>(null)
const lastField = ref<HTMLElement>()
let resultAnswer = ref(false);


const autoFocus = (e: KeyboardEvent) => {
  const key = e.key;
  if (foc.value == true && loading.value == false) {
    if (/[a-яA-Я0-9]/.test(key) && key.length == 1) {
      console.log(key)
      drawer.value = true;
      lastField.value ? lastField.value.focus() : fioF.value.focus();
    }
  }
  if (key === 'ArrowLeft' && page.value > 1) {
    page.value--
  } else if (key === 'ArrowRight' && page.value < data.value.length) {
    page.value++
  }
}

const btnDis = () => {
  if ((fio.value.length < 2) && (phone.value.length < 6) && (email.value.length < 3)) {
    return true
  } else {
    return false
  }
}


let pageMapData: IPageData = reactive({
  title: "Клиенты", icon: "",
  mainBtnBar: [
    {
      id: "update", title: "Обновить", icon: "mdi-autorenew", disabled: false, color: "secondary", bkgColor: "red",
      action: () => updateData()
    },
    {
      id: "addClient", title: "Добавить", icon: "mdi-account", disabled: false, color: "secondary", bkgColor: "red",
      action: () => { openDialog(EmplProfileDialog, { empl: {}, action: addClient, header: 'Добавление клиента', button: 'Добавить', adding: true }, true, () => foc.value = true); foc.value = false }
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


const eventsHandler= (e: string, d: any) => {
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

const removeSpaces = (str: string | null | undefined): string => {
  if (!str) return "";
  str = str.trim();
  str = str.replace(/ +/g, ' ');
  return str;
}

const toTitleCase = (str: string): string => {
  return str.replace(/\S+\s*/g, function (txt: string): string {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}


const filterItems = (where: string, select: string | string[]) => {
  if (where !== '') {
    where = removeSpaces(where);
    if (Array.isArray(select)) { // Обрабатываем случай, когда в строке может быть больше одного параметра, например ФИО.
      where = toTitleCase(where);
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
    action: () => { openDialog(EmplProfileDialog, { empl: checkEmpl.value, action: editClient, header: 'Карточка клиента', button: 'Сохранить', adding: false }, true, () => foc.value = true); foc.value = false }
  },
  {
    id: "delete", title: "Удалить", icon: "mdi-delete", color: "secondary", bkgColor: "red",
    action: () => openDialog(ConfirmActionDialog, { empl: checkEmpl.value, action: deleteEmpl })
  },
])


defineExpose({eventsHandler});


</script>