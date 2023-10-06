<script  lang="ts">

import { QueryParams } from '~/lib/MoApi/RequestArgs';
import ClientProfileDialog from '~/components/forms/ClientProfileDialog.vue';
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~/libVis/Helpers';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription, IDataTableHeadersDescription } from '~/componentComposables/dataTables/useDataTable';
import { ClientRecord } from '~/lib/MoApi/Records/ClientRecord';
import { ClientDocumentsRecord } from '~/lib/MoApi/Records/ClientDocumentsRecord';
import { ClientSdRecord } from '~/lib/MoApi/Records/ClientSd';
import { ClientAddressesRecord } from '~/lib/MoApi/Records/ClientAddressesRecord';
import { ClientContactsRecord } from '~/lib/MoApi/Records/ClientContactsRecord';
import { ListTemplate } from '~/componentComposables/list/listTemplate';
import { ClientsViews, IClientListView } from '~/lib/MoApi/Views/ClientsViews';

let t: any;

type TClientFilterVals = {
  fio?: string | null;
  phone?: string | null;
  email?: string | null;
  snils?: string | null;
}


class ClientList extends ListTemplate<TClientFilterVals>
{
  clientsViews = this.iocc.get(ClientsViews);

  //Указание пути текущей страницы
  PAGE_PATH = "/list/clients";

  //Настройки по умолчанию
  defPageSettings = { tcols: ["fio", "bd", "mainPhone", "mainEmail"] };


  //Указание компонента формы редакции модели
  modelEditDialog = ClientProfileDialog;

  //Настрока таблицы
  dataTableDescr = ref<IDataTableDescription>({
    headers: [
      { key: 'fio', title: 'ФИО', align: 'center', alignData: "start", width: "400", sortable: true, requestNames: ["name", "surname", "patronymic"] },
      { key: 'bd', title: 'Дата рождения', align: 'center', alignData: "center", width: "250", sortable: true, requestNames: ["birthdate"] },
      { key: 'gen', title: 'Пол', align: 'center', alignData: "center", width: "50", sortable: true, requestNames: ["gender"] },
      { key: 'mainPhone', title: 'Телефон', align: 'center', alignData: "center", width: "220", sortable: true, traits: { dbClientContacts: "r" }, requestNames: ["mainPhone"] },
      { key: 'mainEmail', title: 'Электронная почта', align: 'center', alignData: "center", width: "240", sortable: true, traits: { dbClientContacts: "r" }, requestNames: ["mainEmail"] },
      { key: 'snils', title: 'СНИЛС', align: 'center', alignData: "center", sortable: true, traits: { dbClientDocuments: "r" }, requestNames: ["snils"] }
    ],

    actionsMenu: (item) => [
      { id: "1", title: "Редакировать", icon: "mdi-pencil", disabled: false, action: () => this.edit(item.key, item.index), traits: { dbClient: "u" } },
      { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { this.del(item.key,  item.index) }, traits: { dbClient: "d" } },

    ]
  });

  async del(key:string, index){
    let res=await useDelQU("Вы действительно хотите удалить запись клиента?");
    if(res){
      let rec = await this.recStore.fetch(ClientRecord, key);

    }
  }

  //Настрока формы фильтра
  filterFieldSetting = {
    fields: {
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
    },

    defaultFocus: "fio"
  };


  //Получение строки поиска из данных, введеных в форме фильтра
  getWhereFromFilter = (filterVals: TClientFilterVals) => {
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

  //Конвертация данных из формата апи в формат для таблицы
  convertRow = (rawData) => {
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

  //Вызывается при изменении модели и необходимости обновления 1 строчки в таблице
  onUpdateModel(key, index?) {

    (async () => {
      var row;

      if (index != null)
        row = this.dataTableVars.value.rows[index]
      else
        row = this.dataTableVars.value.rows.find((i) => i.id == key);

      if (row) {
        let rec = await this.recStore.fetch(ClientRecord, key);
        let recDoc = await this.recStore.getOrCreate(ClientDocumentsRecord, key);
        let recAddr = await this.recStore.getOrCreate(ClientAddressesRecord, key);
        let recCont = await this.recStore.getOrCreate(ClientContactsRecord, key);
        let recSd = await this.recStore.getOrCreate(ClientSdRecord, key);

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


  //получения данных из апи
  async getApiData(params: QueryParams) {
    return await this.clientsViews.getClientListView(params);
  }

}



export default {
  setup(props, { expose }) {
    t = useI18n().t;
    const o = new ClientList();
    o.setup();

    const del =()=>{
      
    }

    expose({
      eventsHandler: (e, d) => o.eventsHandler(e, d)
    });

    return o.render();
  }
}


</script>