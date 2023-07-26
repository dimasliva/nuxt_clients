<template>
  <VRow class="ma-1">
    <Table @cheked="checkEmpl = $event, disabledFunc(), $emit('clicked')" @empl="checkEmpl = $event" :info="data"
      :checkbox-show="show" :headers="th" :actions="tableActions"></Table>
    <v-expand-x-transition>
      <VCard v-show="drawer" class="ma-auto" width="300">
        <VForm v-model="form" @keydown.enter="form ? getEmplData() : btnDis()">
          <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon
                @click="drawer = false">mdi-close</v-icon></v-row>
            <VTextField v-model="filters.fio" clearable hint="Введите минимум 2 символа" ref="fioF"
              @update:focused="lastField = fioF, searchField = false" :label="th[0].title" class="ma-1" variant="outlined"
              color="secondary" />
            <VTextField v-model="filters.phone" clearable hint="Введите минимум 6 символов" ref="phoneF"
              @update:focused="lastField = phoneF, searchField = false" :label="th[1].title" class="ma-1"
              variant="outlined" color="secondary" />
            <VTextField v-model="filters.email" clearable hint="Введите минимум 3 символа" ref="emailF"
              @update:focused="lastField = emailF, searchField = false" :label="th[2].title" class="ma-1"
              variant="outlined" color="secondary" />
            <v-row class="ma-1" style="min-width: 200pt;">
              <VBtn :disabled="btnDis()" variant="outlined" @click="console.log(generatePhoneNumber())">Поиск</VBtn>
              <VBtn class="ml-2" variant="outlined"
                @click="() => { filters.fio = '', filters.phone = '', filters.email = '' }">
                Сбросить</VBtn>
            </v-row>
          </VCol>
        </VForm>
      </VCard>
    </v-expand-x-transition>
  </VRow>
  <VCard v-if="loading == true" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
  </VCard>
</template>
  
<script setup lang="ts">
import { EmployeeRecord, IEmployeeRecordData } from '~~/lib/MoApi/Records/EmployeeRecord';
import Table from '~~/components/forms/Table.vue';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { PageMap } from '~~/lib/PageMap';
import EmplProfileDialog from '~~/components/forms/EmplProfileDialog.vue';
import ConfirmActionDialog from '~~/components/forms/ConfirmActionDialog.vue';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { EmployeesViews, IEmployeeListView } from '~~/lib/MoApi/Views/EmployeesViews';
import { QueryParams } from '~~/lib/MoApi/RequestArgs';
import { EmployeeContactsRecord } from '~~/lib/MoApi/Records/EmployeeContactsRecord';


type TEmployeeFilter = {
  fio?: string | null;
  phone?: string | null;
  email?: string | null;
}

let form = ref(false)
let drawer = ref(true)
let show = ref(false)
let loading = ref(false)

let filters = ref<TEmployeeFilter>({
  fio: "",
  phone: "",
  email: ""
});


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

const props = defineProps({
  field: {
    type: Boolean
  }
})

let searchField = ref(props.field)

const autoFocus = (e: any) => {
  const key = e.key;
  if (foc.value == true && loading.value == false && props.field == true) {
    if (/[а-яА-Яa-zA-Z0-9]/.test(key)) {
      drawer.value = true;
      lastField.value ? lastField.value.focus() : fioF.value.focus();
    }
  }
}

const btnDis = () => {
  const f = filters.value;
  if ((f.fio!.length < 2) && (f.phone!.length < 6) && (f.email!.length < 3)) {
    return true
  } else {
    return false
  }
}

const pageDataLoad = () => {
  pageMap.setPageData("/administration/employees_test", {
    title: "Сотрудники", icon: "",
    mainBtnBar: [
      {
        id: "update", title: "Обновить", icon: "mdi-autorenew", disabled: false, color: "secondary", bkgColor: "red",
        action: async () => await createPersons(100000)
      },
      {
        id: "addEmployee", title: "Добавить", icon: "mdi-account", disabled: false, color: "secondary", bkgColor: "red",
        action: () => { openDialog(EmplProfileDialog, { empl: '', action: addEmployee, header: 'Добавление сотрудника', button: 'Добавить' }, true, () => foc.value = true); foc.value = false }
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
}
pageDataLoad();


const getData = async (select: string, where: TEmployeeFilter, quantity: number) => {
  let whereArr: string[] = [];
  let fioStr = removeSpaces(where.fio);
  fioStr = toTitleCase(fioStr);
  if (fioStr) {
    let fioArr = fioStr.split(' ');
    fioArr[fioArr.length - 1] += '%';
    whereArr.push(`surname like '${fioArr[0]}'`);
    if (fioArr[1]) whereArr.push(`name like '${fioArr[1]}'`);
    if (fioArr[2]) whereArr.push(`patronymic like '${fioArr[2]}'`);
  }

  let tmp = where.phone?.trim();
  if (tmp) whereArr.push(`mainPhone='${tmp}'`);
  tmp = where.email?.trim();
  if (tmp) whereArr.push(`mainEmail='${tmp}'`);

  if (whereArr.length == 0) return [];
  let wherestr = whereArr.join(" and ");
  const startTime = performance.now();
  let recArr = await employeesViews.getEmployeeListView(new QueryParams(select, wherestr, null, quantity));
  const empl: IEmployeeListView[] = [];
  let row: IEmployeeListView | undefined;

  while (row = recArr.getNext()) {
    
    empl.push(row);
  }
  const endTime = performance.now();
  console.debug(`employees count=${recArr.getLength()} for ${endTime-startTime} ms`);
  return empl;
}


const getEmplData = async () => {
  loading.value = true;
  data.value = await getData("id,name,surname,patronymic,mainPhone,mainEmail", filters.value, 5000);
  loading.value = false;
}

const addEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, phone?: string, mail?: string) => {
  let rec = await recStore.createNew<EmployeeRecord, IEmployeeRecordData>(EmployeeRecord, (data) => {
    data.name = name;
    data.surname = surname;
    data.patronymic = patronymic;
    data.gender = gender;
    data.birthdate = "2023-05-25T05:12:08.774Z";
    data.roles = "admin";
  })

  let emplcont = await recStore.getOrCreate(EmployeeContactsRecord, rec.Key);
  emplcont.Data!.MainEmail = mail || null;
  emplcont.Data!.MainPhone = phone || null;
  emplcont.save();
}

const editEmployee = async (name: string, surname: string, patronymic: string, gender: string, id: string) => {

}

const disabledFunc = () => {
  (checkEmpl.value.length >= 1 && checkEmpl.value.length <= 5000) ? deleteBtn.value = false : deleteBtn.value = true;
  pageDataLoad();
}

const deleteEmpl = async (id: any) => {
  console.log(id);
  disabledFunc();
}

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



const filteredData = () => {
  getEmplData();
}

let th = [{ key: 'fio', title: "ФИО" }, { key: 'mainPhone', title: "Телефон" }, { key: 'mainEmail', title: "E-mail" }]

let data = ref<any>([])

let tableActions = ref([
  {
    id: "change", title: "Редактировать", icon: "mdi-pencil", color: "secondary", bkgColor: "red",
    action: () => openDialog(EmplProfileDialog, { empl: checkEmpl.value, action: editEmployee, header: 'Карточка сотрудника', button: 'Сохранить' })
  },
  {
    id: "delete", title: "Удалить", icon: "mdi-delete", color: "secondary", bkgColor: "red",
    action: () => openDialog(ConfirmActionDialog, { empl: checkEmpl.value, action: deleteEmpl })
  },
])

onMounted(() => {
  addEventListener('keydown', autoFocus);
})
onBeforeUnmount(() => {
  removeEventListener('keydown', autoFocus);
})


function generatePhoneNumber() {
  let phoneNumber = "7"; // Assuming the country code is +1 for the United States

  // Generate the remaining 10 digits of the phone number
  for (let i = 0; i < 10; i++) {
    phoneNumber += Math.floor(Math.random() * 10);
  }

  return phoneNumber;
}


function generateEmailAddress() {
  const emailProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"];
  const randomProviderIndex = Math.floor(Math.random() * emailProviders.length);
  const emailProvider = emailProviders[randomProviderIndex];

  let email = "";

  // Generate a random string of characters for the email address
  for (let i = 0; i < 10; i++) {
    const randomCharCode = Math.floor(Math.random() * 26) + 97; // ASCII code for lowercase letters
    const randomChar = String.fromCharCode(randomCharCode);
    email += randomChar;
  }

  email += "@" + emailProvider;

  return email;
}


const genders = ["m", "f"];
const namesM = ["Иван", "Петр", "Сергей", "Андрей", "Дмитрий", "Александр", "Михаил", "Николай", "Владимир", "Олег", "Артем", "Алексей", "Константин", "Виктор", "Геннадий", "Григорий", "Евгений", "Егор", "Захар", "Игорь", "Кирилл", "Леонид", "Максим", "Роман", "Руслан", "Семен", "Станислав", "Тимофей", "Федор", "Юрий", "Ярослав"];
const namesF = ["Анастасия", "Александра", "Алина", "Анна", "Валерия", "Виктория", "Галина", "Дарья", "Екатерина", "Елена", "Ирина", "Карина", "Кристина", "Лариса", "Любовь", "Маргарита", "Марина", "Надежда", "Наталья", "Оксана", "Ольга", "Полина", "Светлана", "Татьяна", "Ульяна", "Юлия"];
const surnamesM = ["Иванов", "Петров", "Сидоров", "Кузнецов", "Смирнов", "Михайлов", "Федоров", "Соколов", "Новиков", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьев", "Борисов", "Яковлев", "Григорьев", "Романов", "Воробьев"];
const surnamesF = ["Сергеева", "Кузьмина", "Новикова", "Морозова", "Волкова", "Алексеева", "Лебедева", "Семенова", "Егорова", "Павлова", "Козлова", "Степанова", "Николаева", "Орлова", "Андреева", "Макарова", "Никитина", "Захарова", "Зайцева", "Соловьева", "Борисова", "Яковлева", "Григорьева", "Романова", "Воробьева"]
const patronymicsM = ["Иванович", "Петрович", "Сергеевич", "Андреевич", "Дмитриевич", "Александрович", "Михайлович", "Николаевич", "Владимирович", "Олегович", "Артемович", "Алексеевич", "Константинович", "Викторович", "Геннадьевич", "Григорьевич", "Евгеньевич", "Егорович", "Захарович", "Игоревич", "Кириллович", "Леонидович", "Максимович", "Романович", "Русланович", "Семенович", "Станиславович", "Тимофеевич", "Федорович", "Юрьевич", "Ярославович"];
const patronymicsF = ["Ивановна", "Петровна", "Сергеевна", "Андреевна", "Дмитриевна", "Александровна", "Михайловна", "Николаевна", "Владимировна", "Олеговна", "Артемовна", "Алексеевна", "Константиновна", "Викторовна", "Геннадьевна", "Григорьевна", "Евгеньевна", "Егоровна", "Захаровна", "Игоревна", "Кирилловна", "Леонидовна", "Максимовна", "Романовна", "Руслановна", "Семеновна", "Станиславовна", "Тимофеевна", "Федоровна", "Юрьевна", "Ярославовна"]

const createPersons = async (q: number) => {

console.info("employees create started");
  loading.value = true;
  var itemsPertasks=Math.floor(q/8);
  var promises:Promise<void>[]=[];
  promises.push(emplCreateTask(itemsPertasks));
  promises.push(emplCreateTask(itemsPertasks));
  promises.push(emplCreateTask(itemsPertasks));
  promises.push(emplCreateTask(itemsPertasks));
  promises.push(emplCreateTask(itemsPertasks));
  promises.push(emplCreateTask(itemsPertasks));
  promises.push(emplCreateTask(itemsPertasks));
  promises.push(emplCreateTask(itemsPertasks));

  await Promise.all(promises);
  var cnt=q%8;
  if(cnt) 
    await emplCreateTask(cnt);

console.info("employees created");
  loading.value = false;
}

const emplCreateTask = async (size: number) => {
  for (let i = 0; i < size; i++) {
    let gender = genders[Math.floor(Math.random() * genders.length)];
    let name = '';
    let surname = '';
    let patronymic = '';
    if (gender == 'm') {
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
    //console.log(name, surname, patronymic, gender, birthdate);
    await addEmployee(name, surname, patronymic, gender, birthdate, generatePhoneNumber(), generateEmailAddress());
  }

};

</script>

