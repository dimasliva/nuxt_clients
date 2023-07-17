<template>
  <VCard v-if="loading == true" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
    <img src="@/cat-laptop.jpg" alt="cat">
  </VCard>
  <VRow class="ma-1">
    <Table @cheked="checkEmpl = $event, disabledFunc()" @person="checkEmpl = $event" :info="filteredData.length? filteredData : data" :checkbox-show="show" :page="page" :headers="th" :actions="tableActions"></Table>
    <v-expand-x-transition>
      <VCard v-show="drawer" class="mx-auto mb-auto" width="300">
        <VForm v-model="form" @keydown.enter="btnDis() ? btnDis(): (filteredData(), page = 1)" @keyup.delete="(e) => {if(e.key == 'Delete'){ fio='', phone='', email='', params = [], value = []}}">
          <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon @click="drawer=false">mdi-close</v-icon></v-row>
            <VTextField v-model="fio" clearable hint="Введите минимум 2 символа" ref="fioF" @click:clear="() => {filterItems('', th[0].key),fio=''}" @update:focused="lastField=fioF, searchField = false" :label="th[0].title" class="ma-1" variant="underlined" color="secondary" @update:model-value="filterItems(fio, th[0].key)"/>
            <VTextField v-model="phone" clearable hint="Введите минимум 6 символов" ref="phoneF" @click:clear="() => {filterItems('', th[1].key), phone=''}" @update:focused="lastField=phoneF, searchField = false" :label="th[1].title" class="ma-1" variant="underlined" color="secondary" @update:model-value="filterItems(phone, th[1].key)"/>
            <VTextField v-model="email" clearable hint="Введите минимум 3 символа" ref="emailF" @click:clear="() => {filterItems('', th[2].key), email=''}" @update:focused="lastField=emailF, searchField = false" :label="th[2].title" class="ma-1" variant="underlined" color="secondary" @update:model-value="filterItems(email, th[2].key)"/>
            <VTextField v-model="itemPerPage" label="Количество элементов на странице" class="ma-1" variant="underlined" color="secondary" type="number"></VTextField>
            <v-row class="ma-1" style="min-width: 200pt;">
              <VBtn :disabled="btnDis()" variant="text" @click="() => {filteredData(), page = 1}">Поиск</VBtn>
              <VBtn  variant="text" @click="() => { fio='', phone='', email='', params = [], value = [], data = [], page = 1, getClientData('changedAt',currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 100)}">Сбросить</VBtn>
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
import { PageMap } from '~~/lib/PageMap';
import EmplProfileDialog  from '~~/components/forms/EmplProfileDialog.vue';
import ConfirmActionDialog  from '~~/components/forms/ConfirmActionDialog.vue';
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
const iocc=useContainer();
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

const props = defineProps({
  field : {
    type : Boolean
  }
})

let searchField = ref(props.field)

const autoFocus = (e: KeyboardEvent) => {
  const key = e.key;
    if(foc.value == true && loading.value == false && props.field == true){
      if (/[a-яA-Я0-9]/.test(key) && key.length == 1) {
        console.log(key)
        drawer.value = true;
        lastField.value ? lastField.value.focus() : fioF.value.focus();
      }
    }
    if (key === 'ArrowLeft'  && page.value > 1) {
      page.value--
    } else if (key === 'ArrowRight' && page.value < data.value.length) {
      page.value++
    }
}

const btnDis = () => {
  if((fio.value.length < 2 ) && (phone.value.length < 6) && (email.value.length < 3)){
    return true
  } else {
    return false
  }
}

const pageDataLoad = () =>{ pageMap.setPageData("/administration/clients", {title: "Клиенты", icon: "",
mainBtnBar:[
  { id: "update", title: "Обновить", icon: "mdi-autorenew", disabled:false, color:"secondary", bkgColor:"red", 
  action: () => updateData() },
  { id: "addClient", title: "Добавить", icon: "mdi-account", disabled:false, color:"secondary", bkgColor:"red", 
  action: () =>{ openDialog(EmplProfileDialog,  {empl: {}, action: addClient, header: 'Добавление клиента', button: 'Добавить', adding: true}, true, () => foc.value = true); foc.value = false} },
  { id: "delete", title: "Удалить", icon: "mdi-delete", disabled: deleteBtn.value, color:"secondary", bkgColor:"red", 
  action: () => openDialog(ConfirmActionDialog, {empl: checkEmpl.value, action: deleteEmpl}) },
  { id: "filter", title: "", icon: "mdi-filter", disabled:false, color:"secondary", bkgColor:"red", 
     action: () =>  (drawer.value = !drawer.value) },
  ]
});
}
pageDataLoad();


const getClientData = async(select: string|string[], where: string|string[], quantity: number ) => {

}

let currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 7);

const updateData = () => {
  data.value = [];
  params.value.length? filteredData(): getClientData('changedAt', currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 100);
}

const addClient = async (name: string, surname: string, patronymic: string, gender: string, phone?: string, mail?: string) => {

}

const editClient = async (name: string, surname: string, patronymic: string, gender: string, mainPhone: string, mainEmail: string, id: string) => {

}
  
const deleteEmpl = async(id: any) => {

}
  
const disabledFunc = () => {
  (checkEmpl.value.length >= 1 && checkEmpl.value.length <= 5000)? deleteBtn.value = false : deleteBtn.value = true;
  pageDataLoad();
  emits('cheked', checkEmpl.value);
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
  

const filterItems = (where: string, select: string|string[]) => {
  if(where !== ''){
    where = removeSpaces(where);
    if(Array.isArray(select)){ // Обрабатываем случай, когда в строке может быть больше одного параметра, например ФИО.
    where = toTitleCase(where);
      let currWhere = where.split(" ");
      select.map((str, i) => {
        if(!params.value.includes(str)){
          params.value.push(str);
          value.value.push(currWhere[i]);
        } else {
          let ind = params.value.indexOf(str)
          value.value.splice(ind, 1, currWhere[ind])
        }
      })
      value.value = value.value.filter((el)=>{
        return el !== undefined;
      })
      params.value.splice(currWhere.length)
    } else if(!params.value.includes(select)){
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

let th = [{title: "ФИО", key: ["surname", "name", "patronymic"]},{title: "Телефон", key: "mainPhone"}, {title: "E-mail", key: "mainEmail"}]

let data = ref<any>([])

let tableActions = ref([
  { id: "change", title: "Редактировать", icon: "mdi-pencil", color:"secondary", bkgColor:"red", 
  action: () =>  {openDialog(EmplProfileDialog, {empl: checkEmpl.value, action: editClient, header: 'Карточка клиента', button: 'Сохранить', adding: false}, true, () => foc.value = true); foc.value = false} },
  { id: "delete", title: "Удалить", icon: "mdi-delete", color:"secondary", bkgColor:"red", 
  action: () =>  openDialog(ConfirmActionDialog, {empl: checkEmpl.value, action: deleteEmpl}) },
])

onMounted(() => {
addEventListener('keydown', autoFocus);
})
onBeforeUnmount(() => {
removeEventListener('keydown', autoFocus);
})


getClientData('changedAt',currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 100);

const createPersons = (q: number) => {
  const genders = ["m", "f"];
  const namesM = ["Иван", "Петр", "Сергей", "Андрей", "Дмитрий", "Александр", "Михаил", "Николай", "Владимир", "Олег", "Артем", "Алексей", "Константин", "Виктор", "Геннадий", "Григорий", "Евгений", "Егор", "Захар", "Игорь", "Кирилл", "Леонид", "Максим", "Роман", "Руслан", "Семен", "Станислав", "Тимофей", "Федор", "Юрий", "Ярослав"];
  const namesF = [ "Анастасия", "Александра", "Алина", "Анна", "Валерия", "Виктория", "Галина", "Дарья", "Екатерина", "Елена", "Ирина", "Карина", "Кристина", "Лариса", "Любовь", "Маргарита", "Марина", "Надежда", "Наталья", "Оксана", "Ольга", "Полина", "Светлана", "Татьяна", "Ульяна", "Юлия"];
  const surnamesM = ["Иванов", "Петров", "Сидоров", "Кузнецов", "Смирнов", "Михайлов", "Федоров", "Соколов", "Новиков", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьев", "Борисов", "Яковлев", "Григорьев", "Романов", "Воробьев"];
  const surnamesF = ["Сергеева", "Кузьмина", "Новикова", "Морозова", "Волкова", "Алексеева", "Лебедева", "Семенова", "Егорова", "Павлова", "Козлова", "Степанова", "Николаева", "Орлова", "Андреева", "Макарова", "Никитина", "Захарова", "Зайцева", "Соловьева", "Борисова", "Яковлева", "Григорьева", "Романова", "Воробьева"];
  const patronymicsM = ["Иванович", "Петрович", "Сергеевич", "Андреевич", "Дмитриевич", "Александрович", "Михайлович", "Николаевич", "Владимирович", "Олегович", "Артемович", "Алексеевич", "Константинович", "Викторович", "Геннадьевич", "Григорьевич", "Евгеньевич", "Егорович", "Захарович", "Игоревич", "Кириллович", "Леонидович", "Максимович", "Романович", "Русланович", "Семенович", "Станиславович", "Тимофеевич", "Федорович", "Юрьевич", "Ярославович"];
  const patronymicsF = [ "Ивановна", "Петровна", "Сергеевна", "Андреевна", "Дмитриевна", "Александровна", "Михайловна", "Николаевна", "Владимировна", "Олеговна", "Артемовна", "Алексеевна", "Константиновна", "Викторовна", "Геннадьевна", "Григорьевна", "Евгеньевна", "Егоровна", "Захаровна", "Игоревна", "Кирилловна", "Леонидовна", "Максимовна", "Романовна", "Руслановна", "Семеновна", "Станиславовна", "Тимофеевна", "Федоровна", "Юрьевна", "Ярославовна"];
  
  for (let i = 0; i < q; i++) {
    let gender = genders[Math.floor(Math.random() * genders.length)];
    let name = '';
    let surname = ''; 
    let patronymic = '';
    if(gender == 'm'){
      name = namesM[Math.floor(Math.random() * namesM.length)];
      surname = surnamesM[Math.floor(Math.random() * surnamesM.length)];
      patronymic = patronymicsM[Math.floor(Math.random() * patronymicsM.length)];
    } else {
      name = namesF[Math.floor(Math.random() * namesF.length)];
      surname = surnamesF[Math.floor(Math.random() * surnamesF.length)];
      patronymic = patronymicsF[Math.floor(Math.random() * patronymicsF.length)];
    }
    const year = Math.floor(Math.random() * (2003 - 1950 + 1)) + 1950;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const birthdate = `${day < 10 ? "0" + day : day}.${month < 10 ? "0" + month : month}.${year}`;
    console.log(name, surname, patronymic, gender, birthdate);
    // addClient( name, surname, patronymic, gender, birthdate);
  }
}

</script>