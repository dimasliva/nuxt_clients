<script  lang="ts">

import { QueryParams } from '~/lib/MoApi/RequestArgs';
import PositionProfileDialog from '~/components/forms/PositionProfileDialog.vue';
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~/libVis/Helpers';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription, IDataTableHeadersDescription } from '~/componentComposables/dataTables/useDataTable';
import { PositionRecord } from '~/lib/MoApi/Records/PositionRecord';
import { ListTemplate } from '~/componentTemplates/listTemplates/listTemplate';
import { PositionsViews } from '~/lib/MoApi/Views/PositionsViews';
import { recognizeDataInString } from '~/lib/Utils';
import { EDictionaries } from '~/lib/Dicts/DictionaryStore';
import { Dictionary } from "~/lib/Dicts/Dictionary";
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDataType } from '~/lib/globalTypes';
import { DictsFinderDataProvider } from '~/libVis/FinderDataProviders/DictsFinderDataProvider';
import type { TDictViewVal } from '~/libVis/FinderDataProviders/FinderDataProvider';


let t: any;

type TPositionFilterVals = {
  fio?: string | null;
  position?: TDictViewVal[] | null;
}


class PositionList extends ListTemplate<TPositionFilterVals>
{
  positionsViews = this.diC.get(PositionsViews);
  finderDataProvider = this.diC.get(DictsFinderDataProvider);


  async setup() {
    await super.setup();
    this.finderDataProvider.init("serachPositions", true, EDictionaries.CompanyPositions);
  }


  //Указание пути текущей страницы
  PAGE_PATH = "/list/positions";
  PAGE_TITLE = "Должности";

  //Настройки по умолчанию
  defPageSettings = { tcols: ["fio", "position"] };


  //Указание компонента формы редакции модели
  modelEditDialog = PositionProfileDialog;

  //Настрока таблицы
  dataTableDescr = ref<IDataTableDescription>({
    headers: [
      {
        key: 'fio', title: 'ФИО сотрудника', align: 'center', alignData: "start", width: "400", sortable: true,
        requestNames: ["employeeName", "employeeSurname", "employeePatronymic"], traits: { "dbEmployee": "r" }
      },

      { key: 'position', title: 'Должность', align: 'center', alignData: "start", width: "900", sortable: true, requestNames: ["position"] }
    ],

    actionsMenu: (item) => [
      { id: "1", title: "Редакировать", icon: "mdi-pencil", disabled: false, action: () => this.edit(item.key, item.index), traits: { dbPosition: "u" } },
      { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { this.del(item.key, item.index) }, traits: { dbPosition: "d" } },
    ]
  });

  async del(key: string, index) {
    await this._onDelModel("Вы действительно хотите удалить запись должности?", PositionRecord, key, index);
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

      position: {
        type: EDataType.referenceMultiple,
        title: "Должность",
        hint: "Введите минимум 2 символа",
        rules: [(v: string) => !v || v.length >= 2 || "Минимум 2 символа"],
        constraints: { min: 2, max: 64 },
        traits: { dbPosition: "r" },
        finderDataProvider: this.finderDataProvider
      }
    },

    defaultFocus: "fio"
  };


  //Получение строки поиска из данных, введеных в форме фильтра
  getWhereFromFilter = (filterVals: TPositionFilterVals) => {
    let whereArr: string[] = [];
    let fioStr = Utils.normalizeFio(filterVals.fio);

    if (fioStr) {
      let recdata = recognizeDataInString(fioStr);

      let fioArr = recdata.words;
      fioArr[fioArr.length - 1] += '%';
      whereArr.push(`employeeSurname like '${fioArr[0]}'`);
      if (fioArr[1]) whereArr.push(`employeeName like '${fioArr[1]}'`);
      if (fioArr[2]) whereArr.push(`employeePatronymic like '${fioArr[2]}'`);
    }

    let tmp = filterVals.position;
    if (tmp) {
      let keys = tmp.map(item => item.value);
      whereArr.push(`position in (${keys.join(",")})`)
    }


    if (whereArr.length == 0) return "";
    return whereArr.join(" and ");
  }

  //Конвертация данных из формата апи в формат для таблицы
  convertRow = async (rawData) => {
    let dictstore = this.diC.get<MoApiClient>("MoApiClient").getDictionaryStore();
    return {
      id: rawData.id,
      fio: (rawData.employeeSurname || "") + " " + (rawData.employeeName || "") + " " + (rawData.employeePatronymic || ""),
      position: await dictstore.getDictionary(EDictionaries.CompanyPositions).tryGetValByCode(rawData.position) || ""
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
        let dictstore = this.diC.get<MoApiClient>("MoApiClient").getDictionaryStore();
        let rec = await this._recStore.fetch(PositionRecord, key);
        row.position = await dictstore.getDictionary(EDictionaries.CompanyPositions).tryGetValByCode(rec.Data!.position) || ""
      }
    })();

    return true;
  }


  //получения данных из апи
  async getApiData(params: QueryParams) {
    return await this.positionsViews.getPositionListView(params);
  }

}



export default {
  async setup(props, { expose }) {
    t = useI18n().t;

    const o = new PositionList();
    await o.setup();

    const del = () => { }

    expose({
      eventsHandler: (e, d) => o.eventsHandler(e, d)
    });

    return o.render();
  }
}


</script>