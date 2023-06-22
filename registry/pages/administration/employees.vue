<template>
    <VRow class="ma-1">
      <Table @cheked="checkEmpl = $event, disabledFunc(), $emit('clicked')" @empl="checkEmpl = $event" :info="filteredData.length? filteredData : data" :checkbox-show="show" :headers="th" :actions="tableActions"></Table>
      <v-expand-x-transition>
        <VCard v-show="drawer" class="ma-auto" width="300">
          <VForm v-model="form" @keydown.enter="form ? filteredData() : btnDis()">
            <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon @click="drawer=false">mdi-close</v-icon></v-row>
              <VTextField v-model="fio" clearable hint="Введите минимум 2 символа" ref="fioF" @click:clear="filterItems('', th[0].key)" @update:focused="lastField=fioF, searchField = false" :label="th[0].title" class="ma-1" variant="outlined" color="secondary" @update:model-value="filterItems(fio, th[0].key)"/>
              <VTextField v-model="phone" clearable hint="Введите минимум 6 символов" ref="phoneF" @click:clear="filterItems('', th[1].key)" @update:focused="lastField=phoneF, searchField = false" :label="th[1].title" class="ma-1" variant="outlined" color="secondary" @update:model-value="filterItems(phone, th[1].key)"/>
              <VTextField v-model="email" clearable hint="Введите минимум 3 символа" ref="emailF" @click:clear="filterItems('', th[2].key)" @update:focused="lastField=emailF, searchField = false" :label="th[2].title" class="ma-1" variant="outlined" color="secondary" @update:model-value="filterItems(email, th[2].key)"/>
              <v-row class="ma-1" style="min-width: 200pt;">
                <VBtn :disabled="btnDis()" variant="outlined" @click="filteredData()">Поиск</VBtn>
                <VBtn class="ml-2"  variant="outlined" @click="() => {fio='', phone='', email='', params = [], value = []}">Сбросить</VBtn>
              </v-row>
            </VCol>
          </VForm>
        </VCard>
      </v-expand-x-transition>
    </VRow>
    <VCard v-if="loading == true" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
      <img src="@/cat.gif" alt="cat">
    </VCard>  
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

let form = ref(false)
let drawer = ref(true)
let show = ref(false)
let loading = ref(false)
let fio = ref('')
let phone = ref('')
let email = ref('')

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

const props = defineProps({
  field : {
    type : Boolean
  }
})

let searchField = ref(props.field)

const autoFocus = (e: any) => {
  const key = e.key;
    if(foc.value == true && loading.value == false && props.field == true){
      if (/[а-яА-Яa-zA-Z0-9]/.test(key)) {
        drawer.value = true;
        lastField.value? lastField.value.focus() : fioF.value.focus();
      }
    }
  }

const btnDis = () => {
  if((fio.value.length < 2) && (phone.value.length < 6) && (email.value.length < 3)){
    return true
  } else {
    return false
  }
}

const pageDataLoad = () =>{ pageMap.setPageData("/administration/employees", {title: "Сотрудники", icon: "",
mainBtnBar:[
  { id: "update", title: "Обновить", icon: "mdi-autorenew", disabled:false, color:"secondary", bkgColor:"red", 
  action: () => createPersons(1) },
  { id: "addEmployee", title: "Добавить", icon: "mdi-account", disabled:false, color:"secondary", bkgColor:"red", 
  action: () =>{ openDialog(EmplProfileDialog,  {empl: '', action: addEmployee, header: 'Добавление сотрудника', button: 'Добавить'}, true, () => foc.value = true); foc.value = false} },
  { id: "delete", title: "Удалить", icon: "mdi-delete", disabled: deleteBtn.value, color:"secondary", bkgColor:"red", 
  action: () => openDialog(ConfirmActionDialog, {empl: checkEmpl.value, action: deleteEmpl}) },
  { id: "filter", title: "", icon: "mdi-filter", disabled:false, color:"secondary", bkgColor:"red", 
     action: () =>  (drawer.value = !drawer.value) },
  ]
});
}
pageDataLoad();


const getEmplData = async(select: string|string[], where: string|string[], quantity: number ) => {
  loading.value = true;
  let recStr = ref('');
  if(typeof select == "string" && typeof where == "string"){
    recStr.value = `${select} like '${where}%'`;
    console.log(recStr.value)
  } else {
    let temp = '';
    let rwhere = '';
    for(let i = 0; i < select.length; i++){
      rwhere = ((select[i+1] ==='name')||(select[i+1] ==='patronymic'))? where[i] : where[i]+'%';
      temp += `${select[i]} like '${rwhere}' and `
    }
    recStr.value = temp.slice(0, -4)
    console.log(recStr.value)
  }
  let recArr = await employeesViews.getEmployeeListView<IEmployeeListView>(new QueryParams("id, surname, name, patronymic, mainPhone, mainEmail", recStr.value, quantity));

  const empl:IEmployeeListView[] = [];
  let row: IEmployeeListView | undefined;
  while (row = recArr.getNext()) {
    empl.push(row);
  }
  data.value = empl;
  loading.value = false;
}

const addEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string) => {
  let rec = await recStore.createNew<EmployeeRecord, IEmployeeRecordData>(EmployeeRecord, (data) => {
    data.name = name;
    data.surname = surname;
    data.patronymic = patronymic;
    data.gender = gender;
    data.birthdate = "2023-05-25T05:12:08.774Z";
    data.roles = "admin";
  })
}

const editEmployee = async (name: string, surname: string, patronymic: string, gender: string, id: string) => {

}
  
const disabledFunc = () => {
  (checkEmpl.value.length >= 1 && checkEmpl.value.length <= 5000)? deleteBtn.value = false : deleteBtn.value = true;
  pageDataLoad();
}
  
const deleteEmpl = async(id: any) => {
  console.log(id);
  disabledFunc();
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
  getEmplData(params.value, value.value, 500);
}

let th = [{title: "ФИО", key: ["surname", "name", "patronymic"]},{title: "Телефон", key: "mainPhone"}, {title: "E-mail", key: "mainEmail"}]

let data = ref<any>([])

let tableActions = ref([
  { id: "change", title: "Редактировать", icon: "mdi-pencil", color:"secondary", bkgColor:"red", 
  action: () =>  openDialog(EmplProfileDialog, {empl: checkEmpl.value, action: editEmployee, header: 'Карточка сотрудника', button: 'Сохранить'}) },
  { id: "delete", title: "Удалить", icon: "mdi-delete", color:"secondary", bkgColor:"red", 
  action: () =>  openDialog(ConfirmActionDialog, {empl: checkEmpl.value, action: deleteEmpl}) },
])

onMounted(() => {
addEventListener('keydown', autoFocus);
})
onBeforeUnmount(() => {
removeEventListener('keydown', autoFocus);
})

const createPersons = (q: number) => {
  const genders = ["m", "f"];
  const namesM = ["Иван", "Петр", "Сергей", "Андрей", "Дмитрий", "Александр", "Михаил", "Николай", "Владимир", "Олег", "Артем", "Алексей", "Константин", "Виктор", "Геннадий", "Григорий", "Евгений", "Егор", "Захар", "Игорь", "Кирилл", "Леонид", "Максим", "Роман", "Руслан", "Семен", "Станислав", "Тимофей", "Федор", "Юрий", "Ярослав"];
  const namesF = [ "Анастасия", "Александра", "Алина", "Анна", "Валерия", "Виктория", "Галина", "Дарья", "Екатерина", "Елена", "Ирина", "Карина", "Кристина", "Лариса", "Любовь", "Маргарита", "Марина", "Надежда", "Наталья", "Оксана", "Ольга", "Полина", "Светлана", "Татьяна", "Ульяна", "Юлия"];
  const surnamesM = ["Иванов", "Петров", "Сидоров", "Кузнецов", "Смирнов", "Михайлов", "Федоров", "Соколов", "Новиков", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьев", "Борисов", "Яковлев", "Григорьев", "Романов", "Воробьев"];
  const surnamesF = ["Сергеева", "Кузьмина", "Новикова", "Морозова", "Волкова", "Алексеева", "Лебедева", "Семенова", "Егорова", "Павлова", "Козлова", "Степанова", "Николаева", "Орлова", "Андреева", "Макарова", "Никитина", "Захарова", "Зайцева", "Соловьева", "Борисова", "Яковлева", "Григорьева", "Романова", "Воробьева"]
  const patronymicsM = ["Иванович", "Петрович", "Сергеевич", "Андреевич", "Дмитриевич", "Александрович", "Михайлович", "Николаевич", "Владимирович", "Олегович", "Артемович", "Алексеевич", "Константинович", "Викторович", "Геннадьевич", "Григорьевич", "Евгеньевич", "Егорович", "Захарович", "Игоревич", "Кириллович", "Леонидович", "Максимович", "Романович", "Русланович", "Семенович", "Станиславович", "Тимофеевич", "Федорович", "Юрьевич", "Ярославович"];
  const patronymicsF = [ "Ивановна", "Петровна", "Сергеевна", "Андреевна", "Дмитриевна", "Александровна", "Михайловна", "Николаевна", "Владимировна", "Олеговна", "Артемовна", "Алексеевна", "Константиновна", "Викторовна", "Геннадьевна", "Григорьевна", "Евгеньевна", "Егоровна", "Захаровна", "Игоревна", "Кирилловна", "Леонидовна", "Максимовна", "Романовна", "Руслановна", "Семеновна", "Станиславовна", "Тимофеевна", "Федоровна", "Юрьевна", "Ярославовна"]
  
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
    // addEmployee( name, surname, patronymic, gender, birthdate);
  }
}

</script>

