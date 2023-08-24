<template>
  <v-card v-if="nright" max-width="400" class="mx-auto" elevation="0" loading>
    <v-card-text class="text-h6">У вас нет доступа к этой странице, сейчас мы вас бережно перенесем на домашнюю страницу.</v-card-text>
    <img src="../../public/cat-laptop-rights.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto">
  </v-card>
  <v-expand-transition>
    <v-responsive v-show="drawer" class="mx-auto" max-width="800px">
      <v-text-field v-model="search" @update:model-value="searchRole()"  clearable density="compact" class="ma-0 pa-0" variant="underlined" placeholder="Введите название роли, например: admin"></v-text-field>
    </v-responsive>
  </v-expand-transition>
  <div class="ma-4" v-if="upd"> 
    <v-expansion-panels>
        <v-expansion-panel v-for="(value, index) in role" :key="index">
          <v-expansion-panel-title class="text-h6">{{ roleName[index] }}</v-expansion-panel-title>
          <v-expansion-panel-text>
            <FormsRoleGrid :rights-set="value" :role-name="roleName[index]" @updated="completeEdit()" :user-rights="userRights"></FormsRoleGrid>
          </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
  </div>
  <v-card v-else-if="emptyRoles" max-width="400" class="mx-auto" elevation="0">
    <v-card-text class="text-h6">Такой роли мы не нашли.</v-card-text>
    <img src="../../public/cat-laptop-notfound.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto">
  </v-card>
  <v-snackbar v-model="result" :timeout="2000" color="primary" variant="tonal">{{ message }}</v-snackbar>  
</template>
  
<script setup lang="ts">
import { PageMap, IPageData } from '~~/lib/PageMap';
import { UserContext } from '~~/lib/UserContext';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { EmployeeRecord } from '~~/lib/MoApi/Records/EmployeeRecord';
import { RolesRecord} from '~~/lib/MoApi/Records/RolesRecord';
import RoleCreatorDialog  from '~~/components/forms/RoleCreatorDialog.vue';

let createBtn = { id: "create", title: "Создать", icon: "mdi-plus-circle", disabled:false, color:"secondary", bkgColor:"red", action: () => openDialog(RoleCreatorDialog, {roleNames: roleName.value, rightsSet: role.value, onCloseFunc: closeAfterCreation,}) };
let searchBtn = { id: "filter", title: "", icon: "mdi-magnify", disabled:false, color:"secondary", bkgColor:"red",  action: () => drawer.value = !drawer.value };
const iocc=useContainer();
const empAuth = iocc.get(UserContext);
const recStore = iocc.get(RecordsStore);
const pageMap = iocc.get<PageMap>("PageMap");
let pageMapData: IPageData = reactive({title: "Роли & права", icon: "mdi-account-circle", mainBtnBar:[]});

pageMap.setPageData("/administration/rights", pageMapData);

let emptyRoles = ref(false)
let result = ref(false);
let message = ref('');
let search = ref('');
let drawer = ref(false);
let userRights = ref<any>({});
let upd = ref(true);
let role = ref<any>([]);
let roleName = ref();
let nright = ref(false);

const searchRole = () => {
  if(search.value){
    let names = roleName.value.flat();
    let roles = role.value.flat(); 
    roleName.value = names.filter((name) => name.toLowerCase().includes(search.value.toLowerCase()));
    if(roleName.value.length){
    emptyRoles.value = false;
      role.value = [];
      roleName.value.map((n) =>{
        role.value.push(roles[names.indexOf(n)]);
      })
      updFunc();
    } else {
      upd.value = false;
      emptyRoles.value = true;
    }
  } else {
    emptyRoles.value = false;
    role.value = [];
    roleName.value = [];
    reqRole();
    updFunc();
  }
}

const redirFunc = () => {
  nright.value = true;
  setTimeout(() => {
    navigateTo('/dashboard');
    nright.value = false;
  }, 2000);
}

const closeAfterCreation = () => {
  setTimeout(() => {    
   reqRole();
  message.value = 'Роль успешно создана!';
  result.value = true;
  updFunc();
  }, 300)
}

const updFunc = async () => {
  upd.value = false;
  await nextTick();
  upd.value = true;
}

const completeEdit = () => {
  setTimeout(() => {    
    reqRole();
    updFunc();
    message.value = 'Роль успешно обновлена!';
    result.value = true;
  }, 300)
}

const checkRole = async () => {
  // Проверка роли пользователя
  let k = empAuth.AuthorityData?.userId;
  let r = (await recStore.getOrCreate(EmployeeRecord, k!)).Data?.roles;
  let rec = await recStore.fetch(RolesRecord, k!);
  let thisEmpRights = rec.Data!.roles[r!];
  // Присвоение соотвествующих прав
  if(thisEmpRights['#CompanyAdmin']){
    userRights.value = thisEmpRights['#CompanyAdmin'];
  } else if(thisEmpRights['dbRoles']){
    userRights.value = thisEmpRights['dbRoles'];
  } else {
    redirFunc();
  }
  if(userRights.value.includes('c')){
    pageMapData.mainBtnBar?.push(createBtn);
  }
  pageMapData.mainBtnBar?.push(searchBtn);
}
checkRole();

const reqRole = async () => {
  let rec = await recStore.fetch(RolesRecord, '');
  role.value = Object.values(rec.Data!.roles); 
  roleName.value = Object.keys(rec.Data!.roles);
};
reqRole();

</script>

<style>
.v-expansion-panel-text__wrapper{
  padding: 0;
}
</style>