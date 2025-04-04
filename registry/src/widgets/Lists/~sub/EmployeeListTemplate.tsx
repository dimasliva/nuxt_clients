
import { QueryParams } from '~/src/common/lib/MoApi/RequestArgs';
import EmployeeProfileDialog from '~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/ProfileDialogs/EmplProfileDialog.vue';
import * as Utils from '~/src/common/lib/Utils';
import * as vHelpers from '~uilib/Helpers';
import type { IDataTableDescription, IDataTableHeadersDescription } from '~widgets/DataTables';
import { EmployeeRecord } from '~/src/common/lib/MoApi/Records/EmployeeRecord';
import { EmployeeContactsRecord } from '~/src/common/lib/MoApi/Records/EmployeeContactsRecord';
import { ListTemplate, type IListTemplateProps } from '~/src/widgets/Lists/ListTemplate';
import { EmployeesViews } from '~/src/common/lib/MoApi/Views/EmployeesViews';
import { recognizeDataInString } from '~/src/common/lib/Utils';
import { EDataType } from '~/src/common/lib/globalTypes';
import type { IRenderedTemplateComponentProps } from '~components/types';
import { Container } from 'inversify';


type TEmployeeFilterVals = {
  fio?: string | null;
  phone?: string | null;
  email?: string | null;
  snils?: string | null;
}



export class EmployeeListTemplate extends ListTemplate<TEmployeeFilterVals> {



  protected _employeesViews: EmployeesViews = null!;


  constructor(deps: Container, opts?: IListTemplateProps | null) {
    super(deps, opts);

    if (deps instanceof Container) {
      this._employeesViews = deps.get(EmployeesViews);
    }
    else {
      this._employeesViews = deps["EmployeesViews"];
    }
  }


  PAGE_TITLE = "Сотрудники";

  //Настройки по умолчанию
  defPageSettings = { tcols: ["fio", "bd", "mainPhone", "mainEmail"] };

  //Название колонки, по которой будет осуществляться сортировка
  override titleColName ="fio";

  //Указание компонента формы редакции модели
  modelEditDialog = EmployeeProfileDialog;

  //Настрока таблицы
  dataTableDescr = ref<IDataTableDescription>({
    headers: [
      { key: 'fio', title: 'ФИО', align: 'center', alignData: "start", width: "400", sortable: true, requestNames: ["name", "surname", "patronymic"] },
      { key: 'mainPhone', title: 'Телефон', align: 'center', alignData: "center", width: "220", sortable: true, traits: { dbEmployeeContacts: "r" }, requestNames: ["mainPhone"] },
      { key: 'mainEmail', title: 'Электронная почта', align: 'center', alignData: "center", width: "240", sortable: true, traits: { dbEmployeeContacts: "r" }, requestNames: ["mainEmail"] },
      //  { key: 'snils', title: 'СНИЛС', align: 'center', alignData: "center", sortable: true, traits: { dbEmployeeDocuments: "r" }, requestNames: ["snils"] }
    ],

    actionsMenu: this.props?.selectMode  ? undefined : (item) => [
      { id: "1", title: "Редакировать", icon: "mdi-pencil", disabled: false, action: () => this.edit(item.key, item.index), traits: { dbEmployee: "u" } },
      { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { this.del(item.key, item.index) }, traits: { dbEmployee: "d" } },

    ]
  });


  async del(key: string, index) {
    await this._onDelModel("Вы действительно хотите удалить запись сотрудника?", EmployeeRecord, key, index);
  }


  chkFioRule = (v: string) => {
    let recdata = recognizeDataInString(v);
    return (recdata.words.length == 0 && !v) || (recdata.words.length > 0 && recdata.words[0].length >= 2) || "Минимум 2 символа фамилии"
  }

  //Настрока формы фильтра
  filterFieldSetting = {
    fields: {
      fio: {
        type: EDataType.string,
        title: "ФИО",
        hint: null,
        rules: [(v: string) => this.chkFioRule(v)],
        constraints: { min: 2, max: 384, check: (v) => this.chkFioRule(v) == true },
      },

      email: {
        type: EDataType.string,
        title: "Электронная почта",
        hint: "Введите минимум 2 символа",
        rules: [(v: string) => !v || v.length >= 2 || "Минимум 2 символа"],
        constraints: { min: 2, max: 64 },
        traits: { dbEmployeeContacts: "r" }
      },

      phone: {
        type: EDataType.string,
        title: "Телефон",
        hint: "Введите минимум 6 символов",
        rules: [],
        constraints: { min: 6, mask: '#-###-###-##-##-###-###' },
        traits: { dbEmployeeContacts: "r" }
      },
      /*
            snils: {
              type: "string",
              title: "СНИЛС",
              hint: "Введите минимум 2 символа",
              rules: [],
              constraints: { mask: '###-###-### ##' },
              traits: { dbEmployeeDocuments: "r" }
            }
            */
    },

    defaultFocus: "fio"
  };


  //Получение строки поиска из данных, введеных в форме фильтра
  getWhereFromFilter = (filterVals: TEmployeeFilterVals) => {
    let whereArr: string[] = [];
    let fioStr = Utils.normalizeFio(filterVals.fio);
    let phone = '';
    let email = '';

    if (fioStr) {
      let recdata = recognizeDataInString(fioStr);

      let fioArr = recdata.words;
      fioArr[fioArr.length - 1] += '%';
      whereArr.push(`surname like '${fioArr[0]}'`);
      if (fioArr[1]) whereArr.push(`name like '${fioArr[1]}'`);
      if (fioArr[2]) whereArr.push(`patronymic like '${fioArr[2]}'`);

      //if (recdata.date)
      //  whereArr.push(`birthdate= '${recdata.date.toISOString()}'`);


      phone = recdata.phone || '';
      email = recdata.email || '';
    }

    let tmp = filterVals.phone?.trim() || phone;
    if (tmp) whereArr.push(`mainPhone='${tmp}'`);
    tmp = filterVals.email?.trim() || email;
    if (tmp) whereArr.push(`mainEmail='${tmp}'`);
    tmp = filterVals.snils?.trim() || '';
    if (tmp) whereArr.push(`snils='${tmp}'`);

    if (whereArr.length == 0) return "";
    return whereArr.join(" and ");
  }

  //Конвертация данных из формата апи в формат для таблицы
  convertRow = async (rawData) => {
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
        let rec = await this._recStore.fetch(EmployeeRecord, key);
        // let recDoc = await this.recStore.getOrCreate(EmployeeDocumentsRecord, key);
        let recCont = await this._recStore.getOrCreate(EmployeeContactsRecord, key);


        row.fio = (rec.Data!.surname || "") + " " + (rec.Data!.name || "") + " " + (rec.Data!.patronymic || "");
        row.bd = rec.Data!.birthdate ? new Intl.DateTimeFormat().format(new Date(rec.Data!.birthdate)) : "";
        row.gen = vHelpers.getGenderStr(rec.Data!.gender);
        row.mainPhone = recCont.Data!.mainPhone;
        row.mainEmail = recCont.Data!.mainEmail;
        // row.snils = recDoc.Data!.snils;
      }
    })();

    return true;
  }


  //получения данных из апи
  async getApiData(params: QueryParams) {
    return await this._employeesViews.getEmployeeListView(params);
  }

}
