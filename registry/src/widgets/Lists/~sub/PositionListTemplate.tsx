
import { Container } from 'inversify';
import { QueryParams } from '~/src/common/lib/MoApi/RequestArgs';
import PositionProfileDialog from '~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/ProfileDialogs/PositionProfileDialog.vue';
import * as Utils from '~/src/common/lib/Utils';
import * as vHelpers from '~uilib/Helpers';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription } from '~widgets/DataTables';
import { PositionRecord } from '~/src/common/lib/MoApi/Records/PositionRecord';
import { ListTemplate, type IListTemplateProps } from '~/src/widgets/Lists/ListTemplate';
import { PositionsViews } from '~/src/common/lib/MoApi/Views/PositionsViews';
import { recognizeDataInString } from '~/src/common/lib/Utils';
import { EDictionaries } from '~/src/common/lib/Dicts/DictionaryStore';
import { Dictionary } from "~/src/common/lib/Dicts/Dictionary";
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';
import { EDataType } from '~/src/common/lib/globalTypes';
import { DictsFinderDataProvider } from '~/src/ui_tools/FinderDataProviders/~sub/DictsFinderDataProvider';
import type { TDictViewVal } from '~/src/ui_tools/FinderDataProviders/FinderDataProvider';
import type { IRenderedTemplateComponentProps } from '~components/types';
import { EmployeeRecord } from '~/src/common/lib/MoApi/Records/EmployeeRecord';



let t: any;

type TPositionFilterVals = {
    fio?: string | null;
    position?: TDictViewVal[] | null;
}


export class PositionListTemplate extends ListTemplate<TPositionFilterVals> {

    protected _positionsViews: PositionsViews = null!;
    protected _finderDataProvider: DictsFinderDataProvider = null!;
    protected _moApiClient: MoApiClient = null!;


    constructor(diC: Container, opts?: IListTemplateProps | null) {
        super(diC, opts);

        this._positionsViews = diC.get(PositionsViews);
        this._finderDataProvider = diC.get(DictsFinderDataProvider);
        this._moApiClient = diC.get("MoApiClient");

        this._finderDataProvider.init("serachPositions", true, EDictionaries.CompanyPositions);
        this.filterFieldSetting.fields.position.finderDataProvider = this._finderDataProvider;
    }


    PAGE_TITLE = "Должности";

    //Настройки по умолчанию
    defPageSettings = { tcols: ["fio", "position"] };


    //Указание компонента формы редакции модели
    modelEditDialog = PositionProfileDialog;

    //колонка, значения из которой будут отображаться в списке выбранных
    titleColName = "title_text";

    //Настрока таблицы
    dataTableDescr = ref<IDataTableDescription>({
        headers: [
            {
                key: 'fio', title: 'ФИО сотрудника', align: 'center', alignData: "start", width: "400", sortable: true,
                requestNames: ["employeeName", "employeeSurname", "employeePatronymic"], traits: { "dbEmployee": "r" }
            },

            { key: 'position', title: 'Должность', align: 'center', alignData: "start", width: "900", sortable: true, requestNames: ["position"] }
        ],

        actionsMenu: this.props?.selectMode ? undefined : (item) => [
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
                finderDataProvider: this._finderDataProvider
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
        let dictstore = this._moApiClient.getDictionaryStore();
        const positionDictVal = await dictstore.getDictionary(EDictionaries.CompanyPositions).tryGetValByCode(rawData.position) || "";

        return {
            id: rawData.id,
            fio: (rawData.employeeSurname || "") + " " + (rawData.employeeName || "") + " " + (rawData.employeePatronymic || ""),
            position: positionDictVal,
            title_text: `${Utils.makeInitialsStr(rawData.employeeSurname, rawData.employeeName, rawData.employeePatronymic)} ${positionDictVal}`
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
                let dictstore = this._moApiClient.getDictionaryStore();
                let rec = await this._recStore.fetch(PositionRecord, key);
                row.position = await dictstore.getDictionary(EDictionaries.CompanyPositions).tryGetValByCode(rec.Data!.position) || ""
                row.title_text = await rec.getTitleText();
            }
        })();

        return true;
    }


    //получения данных из апи
    async getApiData(params: QueryParams) {
        return await this._positionsViews.getPositionListView(params);
    }

}
