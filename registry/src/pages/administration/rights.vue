<template>
  <v-card v-if="nright" max-width="400" class="mx-auto" elevation="0" loading>
    <v-card-text class="text-h6">У вас нет доступа к этой странице, сейчас вы будете перенаправлены на домашнюю
      страницу.</v-card-text>
    <img src="../../public/cat-laptop-rights.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto">
  </v-card>
  <v-expand-transition>
    <v-responsive v-show="drawer" class="mx-auto" max-width="800px">
      <v-text-field v-model="search" @update:model-value="searchRole()" ref="searchField" clearable density="compact"
        class="ma-0 pa-0" variant="underlined" placeholder="Введите название роли, например: admin"></v-text-field>
    </v-responsive>
  </v-expand-transition>
  <v-card v-if="emptyRoles" max-width="400" class="mx-auto" elevation="0">
    <v-card-text class="text-h6">Ничего не найдено.</v-card-text>
  </v-card>
  <div id="roleContainer" class="ma-4 overflow-y-auto">
    <v-expansion-panels v-model="panels">
      <v-expansion-panel v-for="(value, index) in role" :key="index" elevation="0" class=" h-75">
        <v-expansion-panel-title class="text-h6">{{ roleName[index] }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <FormsRoleGrid v-if="upd" :rights-set="value" :role-name="roleName[index]" @updated="completeEdit()"
            :user-rights="userRights" :all-rights="allRights"></FormsRoleGrid>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
  <v-snackbar v-model="result" :timeout="2000" color="primary" variant="tonal">{{ message }}</v-snackbar>
</template>
  
<script setup lang="ts">
import { useDisplay } from 'vuetify/lib/framework.mjs';
import { PageMap, type IFrameHeaderData } from '~/src/common/lib/PageMap';
import { UserContext } from '~/src/common/lib/UserContext';
import { RecordsStore } from '~/src/common/lib/MoApi/Records/RecordsStore';
import { EmployeeRecord } from '~/src/common/lib/MoApi/Records/EmployeeRecord';
import { RolesRecord } from '~/src/common/lib/MoApi/Records/RolesRecord';
import RoleCreatorDialog from '~forms/RoleCreatorDialog.vue';
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';

const searchAction = () => {
  if (drawer.value) {
    search.value = '';
    emptyRoles.value = false;
    reqRole();
    updFunc();
  }
  drawer.value = !drawer.value;
}
let createBtn = { id: "create", title: "Создать", icon: "mdi-plus-circle", disabled: false, color: "primary", bkgColor: "red", action: () => openDialog(RoleCreatorDialog, { roleNames: roleName.value, rightsSet: role.value, allRightsSet: allRights.value, onCloseFunc: closeAfterCreation, }) };
let searchBtn = { id: "filter", title: "", icon: "mdi-magnify", disabled: false, color: "primary", bkgColor: "red", action: () => searchAction() };
const iocc = useContainer();
const api = iocc.get<MoApiClient>("MoApiClient");
const empAuth = iocc.get(UserContext);
const recStore = iocc.get(RecordsStore);
const pageMap = iocc.get<PageMap>("PageMap");
const allRec = api.getRecordsApiSection();
let pageMapData: IFrameHeaderData = reactive({ title: "Роли & права", icon: "mdi-account-circle", mainBtnBar: [] });
let panels = ref<any>([])

pageMap.setPageData("/administration/rights", pageMapData);

let { name } = useDisplay();
let blockHeight = computed(() => {
  switch (name.value) {
    case 'xs': return '60vh'
    case 'sm': return '65vh'
    case 'md': return '65vh'
    case 'lg': return '70vh'
    case 'xl': return '80vh'
    case 'xxl': return '80vh'
  }

  return undefined
});

const heightFunc = async () => {
  await nextTick();
  document.getElementById('roleContainer')!.style.height = blockHeight.value!;
}

heightFunc();

let emptyRoles = ref(false)
let result = ref(false);
let message = ref('');
let search = ref('');
let drawer = ref(false);
let userRights = ref<any>({});
let upd = ref(true);
let role = ref<any>([]);
const searchField = ref<any>(null)
let roleName = ref();
let nright = ref(false);

const autoFocus = (e: KeyboardEvent) => {
  const key = e.key;
  if (/[a-яA-Я0-9]/.test(key) && key.length == 1) {
    drawer.value = true;
    searchField.value.focus();
  }
}

const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": autoFocus(d); return true;
  }
  return false;
};


const searchRole = () => {
  if (search.value) {
    let names = roleName.value.flat();
    let roles = role.value.flat();
    roleName.value = names.filter((name) => name.toLowerCase().includes(search.value.toLowerCase()));
    if (roleName.value.length) {
      emptyRoles.value = false;
      role.value = [];
      roleName.value.map((n) => {
        role.value.push(roles[names.indexOf(n)]);
      })
      updFunc();
    } else {
      upd.value = false;
      emptyRoles.value = true;
      reqRole();
      updFunc();
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
    updFunc();
    result.value = true;
  }, 300)
}

const updFunc = () => {
  upd.value = false;
  nextTick();
  upd.value = true;
}

const completeEdit = () => {
  setTimeout(() => {
    reqRole();
    message.value = 'Роль успешно обновлена!';
    updFunc();
    result.value = true;
  }, 700)
}

let allRights = ref();


const checkRole = async () => {
  // Проверка роли пользователя
  let k = empAuth.AuthorityData?.userId;
  let rec = await recStore.fetch(RolesRecord, k!);
  let r = (await recStore.getOrCreate(EmployeeRecord, k!)).Data?.roles;
  allRights.value = await allRec.getAllRecords();
  let thisEmpRights = rec.Data!.roles.getRole(r!)!;
  // Присвоение соотвествующих прав
  if (thisEmpRights['#AllRecords']) {
    userRights.value = thisEmpRights['#AllRecords'];
  } else if (thisEmpRights['dbRoles']) {
    userRights.value = thisEmpRights['dbRoles'];
  } else {
    redirFunc();
  }
  if (userRights.value.includes('c')) {
    pageMapData.mainBtnBar?.push(createBtn);
  }
  pageMapData.mainBtnBar?.push(searchBtn);
  let tempArr: any = [];
  allRights.value.map((rec) => {
    if (rec.name != 'Coupling' && rec.name != 'Relation')
      tempArr.push('db' + rec.name)
  })
  allRights.value = tempArr.reduce((acc: any, curr: any) => {
    acc[curr] = '';
    return acc;
  }, {})
  allRights.value['#AllRecords'] = ''
}
checkRole();

const reqRole = async () => {
  let rec = await recStore.fetch(RolesRecord, '');
  role.value = Object.values(rec.Data!.roles.getRoles());
  roleName.value = Object.keys(rec.Data!.roles.getRoles());
};
reqRole();


defineExpose({ eventsHandler });

</script>

<style scoped>
.v-expansion-panel-text__wrapper {
  padding: 0;
}
</style>