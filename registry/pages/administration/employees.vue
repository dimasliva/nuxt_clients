<template>
  <VCard v-if="loading == true" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
    <img src="@/cat-laptop.jpg" alt="cat" class="w-50 d-inline mx-auto">
  </VCard>
  <v-card v-if="data.length == 0 && loading == false"  max-width="400" class="mx-auto" elevation="0" >
    <v-card-text class="text-h6">Ничего не найдено, попробуйте изменить условия поиска</v-card-text>
    <img src="@/cat-laptop-notfound.jpg" alt="cat withj laptop" class="w-50 d-inline mx-auto">
  </v-card>
  <VRow class="ma-1">
    <Table @cheked="checkEmpl = $event, disabledFunc(), loadEmplData()" @person="checkEmpl = $event, loadEmplData()" :info="filteredData.length? filteredData : data" :checkbox-show="show" :page="page" :headers="th" :actions="tableActions"></Table>
    <v-expand-x-transition>
      <VCard v-show="drawer" class="mx-auto mb-auto" width="300">
        <VForm v-model="form" @keydown.enter="btnDis() ? btnDis(): (search(), page = 1)" @keyup.delete="(e) => {if(e.key == 'Delete'){ fio='', phone='', email='', params = [], value = [], stopAutoReq()}}">
          <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon @click="drawer=false">mdi-close</v-icon></v-row>
            <VTextField v-model="fio" clearable hint="Введите минимум 2 символа"  ref="fioF" @click:clear="() => {filterItems('', th[0].key),fio='', stopAutoReq()}"
               @update:focused="lastField=fioF, searchField = false" :label="th[0].title" class="ma-1" variant="underlined" color="secondary" @update:model-value="() => {filterItems(fio, th[0].key), autoReq(fio)}"/>
            <VTextField v-model="phone" type="number"  clearable hint="Введите минимум 6 цифр" ref="phoneF" @click:clear="() => {filterItems('', th[1].key), phone='', stopAutoReq()}"
               @update:focused="lastField=phoneF, searchField = false" :label="th[1].title" class="ma-1" variant="underlined" color="secondary" @input="autoReq(phone)" @update:model-value="() => {filterItems(phone, th[1].key)}"/>
            <VTextField v-model="email" clearable hint="Введите минимум 3 символа" ref="emailF" @click:clear="() => {filterItems('', th[2].key), email='', stopAutoReq()}"
               @update:focused="lastField=emailF, searchField = false" :label="th[2].title" class="ma-1" variant="underlined" color="secondary" @input="autoReq(email)" @update:model-value="() => {filterItems(email, th[2].key)}"/>
            <VTextField v-model="itemPerPage" label="Количество элементов на странице" class="ma-1" min="5" max="100" step="5" variant="underlined" color="secondary" type="number" @input="itemPerPage > 5? true : itemPerPage = 5 "></VTextField>
            <v-row class="ma-1" style="min-width: 200pt;">
              <VBtn :disabled="btnDis()" variant="text" @click="search()">Поиск</VBtn>
              <VBtn  variant="text" @click="() => {clearFilters()}">Сбросить</VBtn>
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
let fio = ref<string>('')
let phone = ref<string>('')
let email = ref<string>('')
let message = ref('')

const emits = defineEmits(['cheked']);
const iocc=useContainer();
const apiClient = iocc.get<MoApiClient>("MoApiClient");
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get(RecordsStore);
const employeesViews = iocc.get(EmployeesViews);
let checkEmpl = ref<any>([]);
let extraEmplInfo = ref<any>();
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
  let f = fio.value.length;
  let p = phone.value.length;
  let e = email.value.length;
  if(f < 2 && p < 6 && e < 3){
    return true;
  } else if (f > 0 && f < 2) {
    return true;
  } else if (p > 0 && p < 6) {
    return true;
  } else if (e > 0 && e < 3) {
    return true;
  } else {
    return false;
  }
}
const pageDataLoad = () =>{ pageMap.setPageData("/administration/employees", {title: "Сотрудники", icon: "",
mainBtnBar:[
  { id: "update", title: "Обновить", icon: "mdi-autorenew", disabled:false, color:"secondary", bkgColor:"red", 
  action: () => updateData() },
  { id: "addEmployee", title: "Добавить", icon: "mdi-account", disabled:false, color:"secondary", bkgColor:"red", 
  action: () =>{ openDialog(EmplProfileDialog,  {empl: {}, extr: {}, action: addEmployee, header: 'Добавление сотрудника', button: 'Добавить', adding: true}, true, () => foc.value = true); foc.value = false} },
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
    recStr.value = `${select}>='${where}'`;
  } else {
    let temp = '';
    let rwhere = '';
    for(let i = 0; i < select.length; i++){
      rwhere = ((select[i+1] ==='name')||(select[i+1] ==='patronymic'))? where[i] : where[i]+'%';
      temp += `${select[i]} like '${rwhere}' and `
    }
    recStr.value = temp.slice(0, -4)
  }

  let recArr = await employeesViews.getEmployeeListView<IEmployeeListView>(new QueryParams("id, surname, name, patronymic, mainPhone, mainEmail", recStr.value, quantity));

  const empl:IEmployeeListView[] = [];
  let row: IEmployeeListView | undefined;
  while (row = recArr.getNext()) {
    empl.push(row);
  }
  let tempData = empl;
  for(let i=0; i < tempData.length;i+= +itemPerPage.value){
    data.value.push(tempData.slice(i,i+ +itemPerPage.value));
  }
  loading.value = false;
}

let currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 7);

const updateData = () => {
  data.value = [];
  params.value.length? filteredData(): getEmplData('changedAt', currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 100);
}

const addEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, phone?: string, mail?: string) => {
  let rec = await recStore.createNew<EmployeeRecord, IEmployeeRecordData>(EmployeeRecord, (data) => {
    data.name = name;
    data.surname = surname;
    data.patronymic = patronymic;
    data.gender = gender;
    data.birthdate = birthdate;
    data.roles = "admin";
  })

  let emplcont = await recStore.getOrCreate(EmployeeContactsRecord, rec.Key);
  emplcont.Data!.MainPhone = phone || null;
  emplcont.Data!.MainEmail = mail || null;
  emplcont.save();
  message.value = 'Сотрудник успешно добавлен!';
  updateData();
  rec&&emplcont? resultAnswer.value = true : resultAnswer.value = false;
}

const loadEmplData = async () => {
  let rec = await recStore.getOrCreate(EmployeeRecord, checkEmpl.value.id);
  extraEmplInfo.value = rec.Data;
}

const editEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, mainPhone: string, mainEmail: string, id: string) => {
const rec = await recStore.fetch(EmployeeRecord, id);
if (rec.Key == id) {
  // Обновить данные сотрудника
  rec.Data!.name = name;
  rec.Data!.surname = surname;
  rec.Data!.patronymic = patronymic;
  rec.Data!.gender = gender;
  rec.Data!.birthdate = birthdate;
  // Сохранить изменения
  await rec.save();
  // Обновить данные контактов сотрудника
  const emplcont = await recStore.getOrCreate(EmployeeContactsRecord, id);
  emplcont.Data!.MainPhone = mainPhone || null;
  emplcont.Data!.MainEmail = mainEmail || null;
  await emplcont.save();
  // Вернуть результат обновления
  message.value = 'Данные сотрудника изменены!'
  rec&&emplcont? resultAnswer.value = true : resultAnswer.value = false;
  updateData();
  return true;
}

return false;
}
  
const deleteEmpl = async(id: any) => {
  const rec = await recStore.fetch(EmployeeRecord, id);
if (rec.Key == id) {
  await rec.delete();
  message.value = 'Запись сотрудника удалена.'
  rec? resultAnswer.value = true : resultAnswer.value = false;
}
  updateData();
  disabledFunc();
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
      params.value.splice(value.value.length)
    } else if(!params.value.includes(select)){
      params.value.push(select);
      value.value.push(where);
    } else {
      let ind = params.value.indexOf(select) //С помощью ind делаем динамическое редактирование отдельных элементов, без необходимости обновлять форму целиком.
      value.value.splice(ind, 1, where)
    }
  } 
  else {
    let emptIndex = value.value.findIndex((el) => {
      return el === '';
    })
    params.value.splice(emptIndex, 1);
    value.value.splice(emptIndex, 1);
  }
}

const filteredData = () => {
  data.value = [];
  getEmplData(params.value, value.value, 100);
}

let th = [{title: "ФИО", key: ["surname", "name", "patronymic"]},{title: "Телефон", key: "mainPhone"}, {title: "E-mail", key: "mainEmail"}]

let data = ref<any>([])

let tableActions = ref([
  { id: "change", title: "Редактировать", icon: "mdi-pencil", color:"secondary", bkgColor:"red", 
  action: () =>  {openDialog(EmplProfileDialog, {empl: checkEmpl.value, extr: extraEmplInfo.value, action: editEmployee, header: 'Карточка сотрудника', button: 'Сохранить', adding: false}, true, () => foc.value = true); foc.value = false; loadEmplData()} },
  { id: "delete", title: "Удалить", icon: "mdi-delete", color:"secondary", bkgColor:"red", 
  action: () =>  openDialog(ConfirmActionDialog, {empl: checkEmpl.value, action: deleteEmpl}) },
])

let req: any = ref(null);

const stopAutoReq = () => {
  if (req !== null) {
    clearTimeout(req);
    req = null;
  }
}

const search = () => {
  stopAutoReq();
  filteredData(); 
  page.value = 1; 
  checkEmpl.value = []; 
}

const autoReq = (model) => {
  if(model !== ''){
    stopAutoReq();
    req = setTimeout(() => {
      if(!btnDis()){
        search();
        page.value = 1; 
        checkEmpl.value = [];
        req = null;
      } else {
        stopAutoReq();
      }
    }, 3000);
  }
}

const clearFilters = () => {
  stopAutoReq();
  fio.value='';
  phone.value='';
  email.value=''; 
  params.value = [];
  value.value = []; 
  data.value = []; 
  page.value = 1; 
  checkEmpl.value = []; 
  getEmplData('changedAt',currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 100);

}

onMounted(() => {
addEventListener('keydown', autoFocus);
})
onBeforeUnmount(() => {
removeEventListener('keydown', autoFocus);
})
onBeforeUpdate(() => {
  disabledFunc();
})

getEmplData('changedAt',currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 100);

</script>

<style>
#input-24.v-field__input::-webkit-outer-spin-button,
#input-24.v-field__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

