<template>
  <VCard v-if="loading == true && nright == false" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
    <img src="../../public/cat-laptop.jpg" alt="cat" class="w-50 d-inline mx-auto">
  </VCard>
  <v-card v-if="nright"  max-width="400" class="mx-auto" elevation="0" loading>
    <v-card-text class="text-h6">У вас нет доступа к этой странице, сейчас вы будете перенаправленны на панель управления.</v-card-text>
    <img src="../../public/cat-laptop-rights.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto">
  </v-card>
  <VRow class="ma-1 flex-nowrap" >
    <Table v-show="loading === false && nright == false && data.length > 0" @cheked="checkEmpl = $event, disabledFunc(), loadEmplData()" @person="checkEmpl = $event, loadEmplData()" :info="filteredData.length? filteredData : data" :checkbox-show="show" :rights="empRights" :page="page" :headers="th" :actions="tableActions"></Table>
  <v-card v-if="data.length == 0 && loading == false && nright == false"  max-width="400" class="mx-auto" elevation="0" >
    <v-card-text class="text-h6">Ничего не найдено, попробуйте изменить условия поиска</v-card-text>
      <img src="../../public/cat-laptop-notfound.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto">
  </v-card>
    <v-expand-x-transition>
      <VCard v-show="drawer" class="mb-auto mx-1" :location="filtLoc" :position="filtPos">
        <VForm v-model="form" @keydown.enter="btnDis() ? btnDis(): (search(), page = 1)" @keyup.delete="(e) => {if(e.key == 'Delete'){ fio='', phone='', email='', params = [], value = [], stopAutoReq()}}">
          <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon @click="drawer=false">mdi-close</v-icon></v-row>
            <VTextField v-model="fio" v-if="empRights.empProfRights.includes('r')" clearable hint="Введите минимум 2 символа"  ref="fioF" @click:clear="() => {filterItems('', th[0].key),fio='', stopAutoReq()}"
               @update:focused="lastField=fioF, searchField = false" :label="th[0].title"  variant="underlined" color="secondary" @update:model-value="() => {filterItems(fio, th[0].key), autoReq(fio)}"/>
            <VTextField v-model="phone" v-if="empRights.empContRights.includes('r')" v-maska:[phoneOptions] clearable hint="Введите минимум 6 цифр" ref="phoneF" @click:clear="() => {filterItems('', th[1].key), phone='', stopAutoReq()}"
               @update:focused="lastField=phoneF, searchField = false" :label="th[1].title"  variant="underlined" color="secondary" @input="autoReq(phone.replace(/[+() --]/g, '').trim())" @update:model-value="() => {filterItems(phone.replace(/[+() --]/g, '').trim(), th[1].key)}"/>
            <VTextField v-model="email" v-if="empRights.empContRights.includes('r')" clearable hint="Введите минимум 3 символа" ref="emailF" @click:clear="() => {filterItems('', th[2].key), email='', stopAutoReq()}"
               @update:focused="lastField=emailF, searchField = false" :label="th[2].title"  variant="underlined" color="secondary" @input="autoReq(email)" @update:model-value="() => {filterItems(email, th[2].key)}"/>
            <VTextField v-model="itemPerPage" label="Количество элементов на странице"  min="5" max="100" step="5" variant="underlined" color="secondary" type="number" @input="itemPerPage > 5? true : itemPerPage = 5 "></VTextField>
            <v-card-actions style="min-width: 200pt;">
              <VBtn :disabled="btnDis()" variant="text" @click="search()">Поиск</VBtn>
              <VBtn  variant="text" @click="() => {clearFilters()}">Сбросить</VBtn>
            </v-card-actions>
          </VCol>
        </VForm>
      </VCard>
    </v-expand-x-transition>
  </VRow>
  <v-bottom-navigation bg-color="tertiary" elevation="0" grow>
    <v-pagination class="w-100" v-if="data.length" v-show="!drawer||pagVis" rounded="pill" :length="data.length" v-model="page" :total-visible="7" :size="pagSize"></v-pagination>
  </v-bottom-navigation>
  <v-snackbar v-model="resultAnswer" :timeout="2000" color="primary" variant="tonal">{{ message }}</v-snackbar>  
</template>
  
<script setup lang="ts">
import { UserContext } from '~~/lib/UserContext';
import Table from '~~/components/forms/Table.vue';
import { IPageData, PageMap } from '~~/lib/PageMap';
import { useDisplay } from 'vuetify/lib/framework.mjs';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { QueryParams } from '~~/lib/MoApi/RequestArgs';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import {EmployeeAccount} from '~~/lib/MoApi/Records/EmployeeAccount';
import EmplProfileDialog  from '~~/components/forms/EmplProfileDialog.vue';
import ConfirmActionDialog  from '~~/components/forms/ConfirmActionDialog.vue';
import { EmployeesViews, IEmployeeListView } from '~~/lib/MoApi/Views/EmployeesViews';
import { EmployeeRecord, IEmployeeRecordData } from '~~/lib/MoApi/Records/EmployeeRecord';
import { RolesRecord, IRoleRecordData} from '~~/lib/MoApi/Records/RolesRecord';
import { EmployeeContactsRecord, IEmployeeContactsRecordData } from '~~/lib/MoApi/Records/EmployeeContactsRecord';

let page = ref(1)
let itemPerPage = ref<number>(10)
let form = ref(false)
let drawer = ref(true)
let show = ref(false)
let loading = ref(true)
let fio = ref<string>('')
let phone = ref<string>('')
let email = ref<string>('')
let message = ref('')
const phoneOptions = {
  mask: "+7(###) ###-##-##"
}
let { name } = useDisplay();
let filtPos = computed(() => {
  switch (name.value) {
    case 'xs': return 'absolute'
    case 'sm': return 'absolute'
    case 'md': return 'absolute'
    case 'lg': return undefined
    case 'xl': return undefined
    case 'xxl': return undefined
  }
    return undefined
});
let pagSize = computed(() => {
  switch (name.value) {
    case 'xs': return 'x-small'
    case 'sm': return 'x-small'
    case 'md': return 'small'
    case 'lg': return 'default'
    case 'xl': return 'default'
    case 'xxl': return 'x-large'
  }
    return undefined
});
let pagVis = computed(() => {
  switch (name.value) {
    case 'xs': return false
    case 'sm': return false
    case 'md': return false
    case 'lg': return true
    case 'xl': return true
    case 'xxl': return true
  }
    return undefined
});
let filtLoc = computed(() => {
  switch (name.value) {
    case 'xs': return 'center'
    case 'sm': return 'center'
    case 'md': return 'right'
    case 'lg': return undefined
    case 'xl': return undefined
    case 'xxl': return undefined
  }
    return undefined
});

const iocc=useContainer();
const apiClient = iocc.get<MoApiClient>("MoApiClient");
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get(RecordsStore);
const employeesViews = iocc.get(EmployeesViews);
const empAuth = iocc.get(UserContext);
let checkEmpl = ref<any>([]);
let extraEmplInfo = ref<any>();
let foc = ref(true)
const fioF = ref<any>(null)
const phoneF = ref<any>(null)
const emailF = ref<any>(null)
const lastField = ref<HTMLElement>()
let resultAnswer = ref(false);
let role = ref();
let nright = ref(false)
let allRoles = ref<any>()

const props = defineProps({
  field : {
    type : Boolean
  }
})

let searchField = ref(props.field)

const autoFocus = (e: KeyboardEvent) => {
  const key = e.key;
  if(foc.value == true && loading.value == false){
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
  } else if (p > 0 && p < 9) {
    return true;
  } else if (e > 0 && e < 3) {
    return true;
  } else {
    return false;
  }
}


let updBtn = { id: "update", title: "Обновить", icon: "mdi-autorenew", disabled:false, color:"secondary", bkgColor:"red", action: () => updateData() };
let addBtn = { id: "addEmployee", title: "Добавить", icon: "mdi-account", disabled:false, color:"secondary", bkgColor:"red",  action: () =>{ openDialog(EmplProfileDialog,  {rights: empRights.value, empl: {}, extr: {}, action: addEmployee, header: 'Добавление сотрудника', button: 'Добавить', adding: true, compRoles: allRoles.value}, true, () => foc.value = true); foc.value = false} };
let delBtn = { id: "delete", title: "Удалить", icon: "mdi-delete", color:"secondary",disabled: true,  bkgColor:"red",  action: () => openDialog(ConfirmActionDialog, {empl: checkEmpl.value, action: deleteEmpl}) };
let filtBtn = { id: "filter", title: "", icon: "mdi-filter", disabled:false, color:"secondary", bkgColor:"red",  action: () => drawer.value = !drawer.value };
let chnBtn = { id: "change", title: "Редактировать", icon: "mdi-pencil", color:"secondary", bkgColor:"red", action: () =>  {openDialog(EmplProfileDialog, {rights: empRights.value, empl: checkEmpl.value, extr: extraEmplInfo.value, action: editEmployee, header: 'Карточка сотрудника', button: 'Сохранить', adding: false, compRoles: allRoles.value}, true, () => foc.value = true); foc.value = false; loadEmplData();} };

let tableActions = ref<any>([])

let empRights = ref({
  empProfRights :'',
  empContRights :''
})

const eventsHandler= (e: string, d: any) => {
  switch (e) {
    case "onKeydown": autoFocus(d); return true;
  }
  return false;
};

const redirFunc = () => {
  nright.value = true;
      setTimeout(() => {
        navigateTo('/dashboard');
        nright.value = false;
      }, 2000);
}

const checkRole = async () => {
  pageMapData.mainBtnBar = [];
  tableActions.value = [];
  let k = empAuth.AuthorityData?.userId;
  let r = (await recStore.getOrCreate(EmployeeRecord, k!)).Data?.roles;
  //Запрос роли сотрудника и проверка прав доступа
  let rec = await recStore.fetch(RolesRecord, '');
  allRoles.value = Object.keys(rec.Data!.roles);
  role.value = rec.Data!.roles[r!];
  // role.value = {
  //   "dbEmployee": "cruds",
  //   "dbEmployeeContacts": "cds",
  // }
  //Создание необходимого функционала, в соответствии с правами 
  if(role.value['#CompanyAdmin']){
  //Если роль админ компании, то все права разрешены  
    for(let r in empRights.value){
      empRights.value[r] = role.value['#CompanyAdmin'];
    }
      pageMapData.mainBtnBar!.push(updBtn, addBtn, delBtn, filtBtn);
    tableActions.value.push(chnBtn, delBtn);
  } else if(!role.value.dbEmployee&&!role.value.dbEmployeeContacts){
    redirFunc();
  } else {
    // В зависимости от доступных прав отображаем действия на странице
    empRights.value.empProfRights = role.value.dbEmployee;
    empRights.value.empContRights = role.value.dbEmployeeContacts;
      pageMapData.mainBtnBar.push(updBtn);
    tableActions.value.push(chnBtn)
    if(empRights.value.empProfRights.includes('c')&&empRights.value.empContRights.includes('c')){
      pageMapData.mainBtnBar.push(addBtn);
    }
    if(empRights.value.empProfRights.includes('d')&&empRights.value.empContRights.includes('d')){
      pageMapData.mainBtnBar.push(delBtn);
      tableActions.value.push(delBtn);
    }
    if(empRights.value.empProfRights.includes('r')||empRights.value.empContRights.includes('r')){
      pageMapData.mainBtnBar.push(filtBtn)
    }
    if(!empRights.value.empProfRights.includes('r')&&!empRights.value.empContRights.includes('r')){
      redirFunc();
    }
  }
}

let pageMapData: IPageData = reactive({title: "Сотрудники", icon: "", mainBtnBar: []});

pageMap.setPageData("/administration/employees", pageMapData);

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

  let selStr = ref('');

  if(role.value.dbEmployee.includes('r')){
    selStr.value = 'id, name, surname, patronymic'
  }
  if(role.value.dbEmployeeContacts.includes('r')){
    selStr.value += ', mainPhone, mainEmail'
  }

  if(!selStr.value){
    loading.value = false;
    redirFunc();
  } else {
    let recArr = await employeesViews.getEmployeeListView(new QueryParams(selStr.value, recStr.value, null, quantity));
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

}

let currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 7);

const updateData = () => {
  data.value = [];
  params.value.length? filteredData(): getEmplData('changedAt', currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 5000);
}

const addEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, roles: string, phone?: string, mail?: string, id?:string, login?: string) => {
  let rec = await recStore.createNew<EmployeeRecord, IEmployeeRecordData>(EmployeeRecord, (data) => {
    data.name = name;
    data.surname = surname;
    data.patronymic = patronymic;
    data.gender = gender;
    data.birthdate = birthdate;
    data.roles = roles;
  })

  if(login){
  let emplAcc = await recStore.getOrCreate(EmployeeAccount, rec.Key);
  emplAcc.Data!.login = login;
  emplAcc.Data!.phone = phone!;
  emplAcc.Data!.email = mail!;
  emplAcc.save();
}

  let emplcont = await recStore.getOrCreate(EmployeeContactsRecord, rec.Key);
  emplcont.Data!.mainPhone = phone || null;
  emplcont.Data!.mainEmail = mail || null;
  emplcont.save();
  message.value = 'Сотрудник успешно добавлен!';
  updateData();
  rec&&emplcont? resultAnswer.value = true : resultAnswer.value = false;
}

const loadEmplData = async () => {
  if(checkEmpl.value.id){
    let rec = await recStore.getOrCreate(EmployeeRecord, checkEmpl.value.id);
    extraEmplInfo.value = rec.Data;
  }
}

const editEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, roles: string, mainPhone: string, mainEmail: string, id: string) => {
const rec = await recStore.fetch(EmployeeRecord, id);
if (rec.Key == id) {
  // Обновить данные сотрудника
  rec.Data!.name = name;
  rec.Data!.surname = surname;
  rec.Data!.patronymic = patronymic;
  rec.Data!.gender = gender;
  rec.Data!.birthdate = birthdate;
  rec.Data!.roles = roles;
  // Сохранить изменения
  await rec.save();
  // Обновить данные контактов сотрудника
  const emplcont = await recStore.getOrCreate(EmployeeContactsRecord, id);
  emplcont.Data!.mainPhone = mainPhone || null;
  emplcont.Data!.mainEmail = mainEmail || null;
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
disabledFunc();
updateData();
}
  
const disabledFunc = () => {
  let btn = pageMapData.mainBtnBar!.find((o) => o.id == "delete");
  checkEmpl.value.length >= 1 && checkEmpl.value.length <= 100? btn!.disabled = false : btn!.disabled = true;
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
  getEmplData(params.value, value.value, 5000);
}

let th = [{title: "ФИО", key: ["surname", "name", "patronymic"]},{title: "Телефон", key: "mainPhone"}, {title: "E-mail", key: "mainEmail"}]

let data = ref<any>([])

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
  getEmplData('changedAt',currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 5000);

}
onMounted(() => {
  setTimeout(() => {
    getEmplData('changedAt',currentDate.toISOString().slice(0, -14).replace(/-/g, '') , 5000);
    loading.value = false;
  }, 300);
})

onActivated(() => {
  checkRole();
})

defineExpose({eventsHandler});


</script>

<style>
#input-24.v-field__input::-webkit-outer-spin-button,
#input-24.v-field__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>