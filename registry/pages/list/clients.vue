<template>
  <VRow class="ma-1">
    <VCol style="min-width: 400;">
      <VCard v-if="loading == true" max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка...">
        <img src="../../public/cat-laptop.jpg" alt="cat">
      </VCard>
      <v-card v-if="dataTableVars.rows.length == 0 && loading == false" max-width="400" class="mx-auto" elevation="0">
        <v-card-text class="text-h6">Ничего не найдено, попробуйте изменить условия поиска</v-card-text>
        <img src="/cat-laptop-notfound.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto">
      </v-card>


      <KeepAlive>
        <DataTable :visibility="loading == false && dataTableVars.rows.length > 0" :headers="dataTableVars.headers"
          ref="refDataTable" :rows="dataTableVars.rows" :selected="dataTableVars.selected"
          :actionsMenu="dataTableVars.actionsMenu" />
      </KeepAlive>

    </VCol>

    <v-expand-x-transition>
      <SimpleFilterForm ref="filterForm" :filterSettings="filterSetting" />
    </v-expand-x-transition>

  </VRow>
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




type TClientFilterVals = {
  fio?: string | null;
  phone?: string | null;
  email?: string | null;
  snils?: string | null;
}

const { t } = useI18n()
let page = ref(1)
let itemPerPage = ref<number>(10)
let show = ref(false)
let loading = ref(false)
let filterForm = ref();

const iocc = useContainer();
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get(RecordsStore);
const clientsViews = iocc.get(ClientsViews);
let checkEmpl = ref([]);
let deleteBtn = ref(true);

let filterVals: Ref<TClientFilterVals | null> = ref(null);
let lastField: Ref<any>;
let resultAnswer = ref(false);
let refDataTable = ref();



const dataTableVars: any = ref({
  itemsPerPage: 10,
  headers: [
    { align: 'start', sortable: false, key: "actions" },
    { title: 'ФИО', align: 'start', sortable: true, key: 'fio' },
    { title: 'Телефон', align: 'start', sortable: true, key: 'mainPhone' },
    { title: 'Электронная почта', align: 'start', sortable: true, key: 'mainEmail' },
    { title: 'СНИЛС', align: 'start', sortable: true, key: 'snils' }
  ],

  actionsMenu: [
    { id: "1", title: "Редакировать", icon: "mdi-pencil", disabled: false, action: () => { } },
    { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { } },

  ] as IMenu[],

  rows: [],
  page: 1
});


let pageMapData: IPageData = reactive({
  title: "Клиенты", icon: "",
  mainBtnBar: [
    {
      id: "update", title: t("update"), icon: "mdi-autorenew", disabled: false, color: "secondary", bkgColor: "red",
      action: () => updateData()
    },
    {
      id: "addClient", title: t("add"), icon: "mdi-account", disabled: false, color: "secondary", bkgColor: "red",
      action: () => { createToast(EMessageType.Error, "Это ошибка!"); return; openDialog(ClientProfileDialog, { empl: {}, action: addClient, header: 'Добавление клиента', button: 'Добавить', adding: true }, true); }
    },
    {
      id: "filter", title: "", icon: "mdi-filter", disabled: false, color: "secondary", bkgColor: "red",
      action: () => { filterForm.value.toggleVis() }
    },
  ]
});

pageMap.setPageData("/list/clients", pageMapData);



const filterSetting = {

  getFields() {
    return {
      fio: {
        type: "string",
        title: "ФИО",
        hint: null,
        rules: [(v: string) => !v || v.length >= 2 || "Минимум 2 символа"],
        constraints: { min: 2, max: 10 },
      },

      email: {
        type: "string",
        title: "Электронная почта",
        hint: "Введите минимум 2 символа",
        rules: [(v: string) => !v || v.length >= 2 || "Минимум 2 символа"],
        constraints: { min: 2, max: 10 },
      },

      phone: {
        type: "string",
        title: "Телефон",
        hint: "Введите минимум 6 символов",
        rules: [],
        constraints: { min: 6, mask: '#-###-###-##-##-###-###' },
      },

      snils: {
        type: "string",
        title: "СНИЛС",
        hint: "Введите минимум 2 символа",
        rules: [],
        constraints: { mask: '###-###-### ##' },
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
      break;

  }
  return false;
};



let currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 7);

const updateData = () => {
  //  let btn = pageMapData.mainBtnBar!.find((o) => o.id == "addClient");
  //  btn!.disabled = true;
  //  btn!.color = "red";
  loadData();
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




const getData = async (select: string, where: TClientFilterVals, sortedBy: string, quantity: number) => {
  let whereArr: string[] = [];
  let fioStr = Utils.normalizeFio(where.fio);

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
  tmp = where.snils?.trim();
  if (tmp) whereArr.push(`snils='${tmp}'`);

  if (whereArr.length == 0) return [];
  let wherestr = whereArr.join(" and ");
  const startTime = performance.now();
  let recArr = await clientsViews.getClientListView(new QueryParams(select, wherestr, sortedBy, quantity));
  const res: IClientListView[] = [];
  let row: IClientListView | undefined;

  while (row = recArr.getNext()) {
    res.push(row);
  }
  const endTime = performance.now();
  console.debug(`clients count=${recArr.getLength()} for ${endTime - startTime} ms`);
  return res;
}


const loadData = async () => {
  try {
    loading.value = true;
    let rawData = await getData("id,name,surname,patronymic,mainPhone,mainEmail,snils", filterVals.value!, "changedAt desc", 5000);
    let model: any = [];
    for (let i = 0; i < rawData.length; i++) {
      let row = rawData[i];
      model.push({
        id: row.id,
        fio: (row.surname || "") + " " + (row.name || "") + " " + (row.patronymic || ""),
        mainPhone: row.mainPhone,
        mainEmail: row.mainEmail,
        snils: row.snils
      });
    }
    dataTableVars.value.rows = model;

    if (refDataTable.value)
      refDataTable.value.reset();
  }
  catch (exc: any) {
    if (exc.status == '429')
      createToast(EMessageType.Error, t(`err_msg_FrequentRequests`));
    else
      createToast(EMessageType.Error, t(`err_msg_${exc.code}`));
  }
  finally {
    loading.value = false;
  }
}



let tableActions = ref([
  {
    id: "change", title: t("edit"), icon: "mdi-pencil", color: "secondary", bkgColor: "red",
    action: () => { openDialog(ClientProfileDialog, { empl: checkEmpl.value, action: editClient, header: 'Карточка клиента', button: 'Сохранить', adding: false }, true,); }
  },
  {
    id: "delete", title: t("delete"), icon: "mdi-delete", color: "secondary", bkgColor: "red",
    action: () => openDialog(ConfirmActionDialog, { empl: checkEmpl.value, action: deleteEmpl })
  },
])


defineExpose({ eventsHandler });


</script>