<template>
  <v-row class="ma-1">
    <v-col class="w-50" style="min-width: 400; ">
      <v-card v-if="loading == true" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
        <img src="../../public/cat-laptop.jpg" alt="cat">
      </v-card>
      <v-card v-if="dataTableVars.rows.length == 0 && loading == false" max-width="400" class="mx-auto" elevation="0">
        <v-card-text class="text-h6">Ничего не найдено, попробуйте изменить условия поиска</v-card-text>
        <img src="/cat-laptop-notfound.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto">
      </v-card>


      <KeepAlive>
        <DataTable :visibility="loading == false && dataTableVars.rows.length > 0" :table-descr="dataTableDescr"
          v-model:columns="dataTableVars.columns" ref="refDataTable" :rows="dataTableVars.rows"
          :selected="dataTableVars.selected" @on-row-dbl-click="(rowitem) => editClient(rowitem.key, rowitem.index)"
          @onColumnsChanged="loadData()" @onColumnsChangedDelayed="saveSettings()" />
      </KeepAlive>

    </v-col>

    <v-expand-x-transition>
      <SimpleFilterForm ref="filterForm" :filterSettings="filterSetting" />
    </v-expand-x-transition>

  </v-row>
</template>

<script setup lang="ts">
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { IPageData, PageMap } from '~~/lib/PageMap';
import ConfirmActionDialog from '~~/components/forms/ConfirmActionDialog.vue';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { QueryParams } from '~~/lib/MoApi/RequestArgs';
import { ClientsViews, IClientListView } from '~/lib/MoApi/Views/ClientsViews';
import ClientProfileDialog from '~~/components/forms/ClientProfileDialog.vue';
import SimpleFilterForm from '~~/components/forms/SimpleFilterForm';
import * as Utils from '~~/lib/Utils';
import { EMessageType } from '~~/lib/globalTypes'
import { useI18n } from "vue-i18n"
import type { UserContext } from '~~/lib/UserContext';
import type { IDataTableDescription, IDataTableHeadersDescription } from '~/componentComposables/dataTables/useDataTable';
import * as vHelpers from '~~/libVis/Helpers';
import { debug } from 'console';
import { ClientRecord } from '~/lib/MoApi/Records/ClientRecord';
import { ClientDocumentsRecord } from '~/lib/MoApi/Records/ClientDocumentsRecord';
import { ClientSdRecord } from '~/lib/MoApi/Records/ClientSd';
import { ClientAddressesRecord } from '~/lib/MoApi/Records/ClientAddressesRecord';
import { ClientContactsRecord } from '~/lib/MoApi/Records/ClientContactsRecord';




type TClientFilterVals = {
  fio?: string | null;
  phone?: string | null;
  email?: string | null;
  snils?: string | null;
}

const PAGE_PATH = "/list/clients";

const { t } = useI18n()
let loading = ref(false)
let filterForm = ref();

const iocc = useContainer();
const userCtx = iocc.get<UserContext>('UserContext');
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get<RecordsStore>("RecordsStore");
const clientsViews = iocc.get(ClientsViews);

let checkEmpl = ref([]);
let deleteBtn = ref(true);

let filterVals: Ref<TClientFilterVals | null> = ref(null);
let refDataTable = ref();

const pageSettings = userCtx.EmployeeAppProfile?.getPageSettings(PAGE_PATH) || { tcols: ["fio", "bd", "mainPhone", "mainEmail"] }


let ttt=recStore.canRecRead(ClientRecord);

let pageMapData: IPageData = reactive({
  title: "Клиенты", icon: "",
  mainBtnBar: [
    {
      id: "update", title: t("update"), icon: "mdi-autorenew", disabled: false, color: "secondary", bkgColor: "red",
      action: () => updateData()
    },
    {
      id: "addClient", title: t("add"), icon: "mdi-account", disabled: false, color: "secondary", bkgColor: "red",
      action: () => addClient()
    },
    {
      id: "filter", title: "", icon: "mdi-filter", disabled: false, color: "secondary", bkgColor: "red",
      action: () => { filterForm.value.toggleVis() }
    },
  ]
});
pageMap.setPageData(PAGE_PATH, pageMapData);


const dataTableDescr = ref<IDataTableDescription>({
  headers: [
    { key: 'fio', title: 'ФИО', align: 'center', alignData: "start", width: "400", sortable: true, requestNames: ["name", "surname", "patronymic"] },
    { key: 'bd', title: 'Дата рождения', align: 'center', alignData: "center", width: "250", sortable: true, requestNames: ["birthdate"] },
    { key: 'gen', title: 'Пол', align: 'center', alignData: "center", width: "50", sortable: true, requestNames: ["gender"] },
    { key: 'mainPhone', title: 'Телефон', align: 'center', alignData: "center", width: "220", sortable: true, traits: { dbClientContacts: "r" }, requestNames: ["mainPhone"] },
    { key: 'mainEmail', title: 'Электронная почта', align: 'center', alignData: "center", width: "240", sortable: true, traits: { dbClientContacts: "r" }, requestNames: ["mainEmail"] },
    { key: 'snils', title: 'СНИЛС', align: 'center', alignData: "center", sortable: true, traits: { dbClientDocuments: "r" }, requestNames: ["snils"] }
  ],

  actionsMenu: (item) => [
    { id: "1", title: "Редакировать", icon: "mdi-pencil", disabled: false, action: () => editClient(item.key, item.index), traits: { dbClient: "u" } },
    { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { }, traits: { dbClient: "d" } },

  ]
});


const dataTableVars = ref({
  itemsPerPage: 10,
  rows: [] as any[],
  page: 1,
  selected: [],
  columns: pageSettings.tcols
});



const filterSetting = {

  getFields() {
    return {
      fio: {
        type: "string",
        title: "ФИО",
        hint: null,
        rules: [(v: string) => !v || v.length >= 2 || "Минимум 2 символа"],
        constraints: { min: 2, max: 384 },
      },

      email: {
        type: "string",
        title: "Электронная почта",
        hint: "Введите минимум 2 символа",
        rules: [(v: string) => !v || v.length >= 2 || "Минимум 2 символа"],
        constraints: { min: 2, max: 64 },
        traits: { dbClientContacts: "r" }
      },

      phone: {
        type: "string",
        title: "Телефон",
        hint: "Введите минимум 6 символов",
        rules: [],
        constraints: { min: 6, mask: '#-###-###-##-##-###-###' },
        traits: { dbClientContacts: "r" }
      },

      snils: {
        type: "string",
        title: "СНИЛС",
        hint: "Введите минимум 2 символа",
        rules: [],
        constraints: { mask: '###-###-### ##' },
        traits: { dbClientDocuments: "r" }
      }

    }
  },

  defaultFocus: "fio",

  //onCheckFilterVals(inputData: any) {
  //  return false;
  //},

  async onFind(inputData: any) {
    if (!loading.value) {
      filterVals.value = inputData;

      loadData();
    }
    return true;
  },
}




const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown":
      if (!loading.value) {
        if (refDataTable.value) {
          let inc = (d.key == 'ArrowLeft') ? -1 : (d.key == 'ArrowRight') ? 1 : 0;

          if (inc != 0) {
            if (filterForm.value.isVisible())
              filterForm.value.blur();
            refDataTable.value.addCurrPage(inc);
            break;
          }
        }

        if (!filterForm.value.isVisible() && d.keyCode >= 32) {
          filterForm.value.clear();
          filterForm.value.show()
        }


        if (filterForm.value.isVisible() && (d.keyCode >= 32 || ['Enter', 'Delete', 'Backspace'].includes(d.key)))
          return filterForm.value.eventsHandler(e, d);

      }
      break;

    case "onPageActivate":
      //d==RouteLocationNormalizedLoaded
      break;

  }
  return false;
};



const updateData = () => {
  //  let btn = pageMapData.mainBtnBar!.find((o) => o.id == "addClient");
  //  btn!.disabled = true;
  //  btn!.color = "red";
  loadData();
}

const addClient = async () => {
  openDialog(ClientProfileDialog, { recKey: null }, true, (e, d) => (e == "onBeforeClose") ? d ? onAddClient(d) : true : true)
}

const editClient = async (key, index?) => {
  openDialog(ClientProfileDialog, { recKey: key }, true, (e, d) => (e == "onBeforeClose") ? onUpdateClient(d, index) : true)
}

const deleteEmpl = async (id: any) => {

}


const onAddClient = (key) => {
  if (key && !filterForm.value.isFindable())
    loadData();
  return true;
}



const getWhereFromFilter = (filterVals: TClientFilterVals) => {
  let whereArr: string[] = [];
  let fioStr = Utils.normalizeFio(filterVals.fio);

  if (fioStr) {
    let fioArr = fioStr.split(' ');
    fioArr[fioArr.length - 1] += '%';
    whereArr.push(`surname like '${fioArr[0]}'`);
    if (fioArr[1]) whereArr.push(`name like '${fioArr[1]}'`);
    if (fioArr[2]) whereArr.push(`patronymic like '${fioArr[2]}'`);
  }

  let tmp = filterVals.phone?.trim();
  if (tmp) whereArr.push(`mainPhone='${tmp}'`);
  tmp = filterVals.email?.trim();
  if (tmp) whereArr.push(`mainEmail='${tmp}'`);
  tmp = filterVals.snils?.trim();
  if (tmp) whereArr.push(`snils='${tmp}'`);


  if (whereArr.length == 0) return "";
  return whereArr.join(" and ");
}


const convertRow = (rawData) => {
  return {
    id: rawData.id,
    fio: (rawData.surname || "") + " " + (rawData.name || "") + " " + (rawData.patronymic || ""),
    bd: rawData.birthdate ? new Intl.DateTimeFormat().format(new Date(rawData.birthdate)) : "",
    gen: vHelpers.getGenderStr(rawData.gender),
    mainPhone: rawData.mainPhone,
    mainEmail: rawData.mainEmail,
    snils: rawData.snils
  }
};

const onUpdateClient = (key, index?) => {

  (async () => {
    var row;

    if (index != null)
      row = dataTableVars.value.rows[index]
    else
      row = dataTableVars.value.rows.find((i) => i.id == key);

    if (row) {
      let rec = await recStore.fetch(ClientRecord, key);
      let recDoc = await recStore.getOrCreate(ClientDocumentsRecord, key);
      let recAddr = await recStore.getOrCreate(ClientAddressesRecord, key);
      let recCont = await recStore.getOrCreate(ClientContactsRecord, key);
      let recSd = await recStore.getOrCreate(ClientSdRecord, key);

      row.fio = (rec.Data!.surname || "") + " " + (rec.Data!.name || "") + " " + (rec.Data!.patronymic || "");
      row.bd = rec.Data!.birthdate ? new Intl.DateTimeFormat().format(new Date(rec.Data!.birthdate)) : "";
      row.gen = vHelpers.getGenderStr(rec.Data!.gender);
      row.mainPhone = recCont.Data!.mainPhone;
      row.mainEmail = recCont.Data!.mainEmail;
      row.snils = recDoc.Data!.snils;
    }
  })();

  return true;
}

const getData = async (select: string, where: string, sortedBy: string, quantity: number) => {

  const startTime = performance.now();
  let recArr = await clientsViews.getClientListView(new QueryParams(select, where, sortedBy, quantity));

  const endTime = performance.now();
  console.debug(`clients count=${recArr.getLength()} for ${endTime - startTime} ms`);

  const res: any[] = [];
  let row: IClientListView | undefined;

  while (row = recArr.getNext())
    res.push(convertRow(row));

  return res;
}



const getRequestFilterFields = (tableHeaders: any[], selColumns?: string[]) => {
  let res: any[] = [];
  tableHeaders.forEach((item) => {
    if (!selColumns || selColumns.includes(item.key))
      if (Utils.chkRights(null, item.traits))
        if (item.requestNames)
          res = res.concat(item.requestNames);
  });
  return res;
}



const loadData = () => vHelpers.action(async () => {
  loading.value = true;
  let requestFields = ["id"].concat(getRequestFilterFields(dataTableDescr.value.headers, dataTableVars.value.columns));

  let where = "changedAt <= '3000-01-01'";
  let limit = 100;

  if (filterForm.value.isFindable()) {
    limit = 0;
    where = getWhereFromFilter(filterVals.value!)
  }

  dataTableVars.value.rows = await getData(requestFields.join(","), where, "changedAt desc", limit);
  vHelpers.chkMaxItemsLimit(dataTableVars.value.rows);

  if (refDataTable.value)
    refDataTable.value.reset();
})
  .catch((exc) => {
    dataTableVars.value.rows.length = 0;
  })
  .finally(() => {
    loading.value = false;
  });


const saveSettings = () => {
  userCtx.EmployeeAppProfile?.setPageSettings(PAGE_PATH, pageSettings);
  userCtx.EmployeeAppProfile?.save();
}



onMounted(() => {
  filterForm.value.show();
  loadData();
})

defineExpose({ eventsHandler });
</script>