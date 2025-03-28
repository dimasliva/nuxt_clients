// schedulerItemGroupListTemplate.tsx
import { Container } from 'inversify';
import { QueryParams } from '~/lib/MoApi/RequestArgs';
import ScheduleItemGroupProfileDialog from '~/forms/ScheduleItemGroupProfileDialog.vue';
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~/libVis/Helpers';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription } from '~/componentComposables/dataTables/useDataTable';
import { ScheduleItemGroupRecord } from '~/lib/MoApi/Records/ScheduleItemGroupRecord';
import { ListTemplate, type IListTemplateProps } from '~/componentTemplates/listTemplates/listTemplate';
import { ScheduleViews } from '~/lib/MoApi/Views/ScheduleViews';
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDataType } from '~/lib/globalTypes';



let t: any;

type TScheduleItemGroupFilterVals = {
    title?: string | null;
    code?: string | null;
    temporaryNotActive?: boolean | null;
    description?: string | null;
}

export class ScheduleItemGroupListTemplate extends ListTemplate<TScheduleItemGroupFilterVals> {

    protected _scheduleViews: ScheduleViews = null!;
    protected _moApiClient: MoApiClient = null!;


    constructor(diC: Container, opts?: IListTemplateProps | null) {
        super(diC, opts);

        this._scheduleViews = diC.get(ScheduleViews);
        this._moApiClient = diC.get("MoApiClient");
    }


    PAGE_TITLE = "Разделы расписания";

    //Настройки по умолчанию
    defPageSettings = { tcols: ["title", "code", "description"] };

    //Указание компонента формы редакции модели
    modelEditDialog = ScheduleItemGroupProfileDialog;

    //колонка, значения из которой будут отображаться в списке выбранных
    titleColName = "title";

    //Настрока таблицы
    dataTableDescr = ref<IDataTableDescription>({
        headers: [
            {
                key: 'title', title: 'Название', align: 'center', alignData: "start", width: "400", sortable: true,
                requestNames: ["title"], traits: { "dbScheduleItemGroup": "r" }
            },
            { key: 'code', title: 'Код', align: 'center', alignData: "center", width: "200", sortable: true, requestNames: ["code"] },
            { key: 'description', title: 'Описание', align: 'center', alignData: "start", width: "300", sortable: true, requestNames: ["description"] },
            { key: 'temporaryNotActive', title: 'Отключен', align: 'center', alignData: "center", width: "50", sortable: true, requestNames: ["temporaryNotActive"] }
        ],

        actionsMenu: this.props?.selectMode ? undefined : (item) => [
            { id: "1", title: "Редактировать", icon: "mdi-pencil", disabled: false, action: () => this.edit(item.key, item.index), traits: { dbScheduleItemGroup: "u" } },
            { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { this.del(item.key, item.index) }, traits: { dbScheduleItemGroup: "d" } },
        ]
    });

    async del(key: string, index) {
        await this._onDelModel("Вы действительно хотите удалить запись раздела расписания?", ScheduleItemGroupRecord, key, index);
    }

    //Настрока формы фильтра
    filterFieldSetting = {
        fields: {
            title: {
                type: EDataType.string,
                title: "Название",
                hint: null,
                rules: [(v: string) => (!v || v.length >= 2) || "Минимум 2 символа"],
                constraints: { min: 2, max: 256 },
            },

            code: {
                type: EDataType.string,
                title: "Код",
                hint: "Введите минимум 2 символа",
                rules: [(v: string) => (!v || v.length >= 2) || "Минимум 2 символа"],
                constraints: { min: 2, max: 48 },
                traits: { dbScheduleItemGroup: "r" }
            }

        },

        defaultFocus: "title"
    };

    //Получение строки поиска из данных, введеных в форме фильтра
    getWhereFromFilter = (filterVals: TScheduleItemGroupFilterVals) => {
        let whereArr: string[] = [];

        if (filterVals.title) {
            whereArr.push(`title like '${filterVals.title}%'`);
        }

        if (filterVals.code) {
            whereArr.push(`code like '${filterVals.code}%'`);
        }

        if (filterVals.temporaryNotActive !== undefined) {
            if (filterVals.temporaryNotActive)
                whereArr.push(`temporaryNotActive is true`);
            else
                whereArr.push(`temporaryNotActive is not true`);
        }


        if (whereArr.length == 0) return "";
        return "notActive is not true and (" + whereArr.join(" and ") + ")";
    }

    //Конвертация данных из формата апи в формат для таблицы
    convertRow = async (rawData) => {
        return {
            id: rawData.id,
            title: rawData.title,
            code: rawData.code,
            temporaryNotActive: rawData.temporaryNotActive ? "Да" : "",
            description: rawData.description,
            changedAt: rawData.changedAt,
            notActive: rawData.notActive
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
                let rec = await this._recStore.fetch(ScheduleItemGroupRecord, key);
                row.title = rec.Data!.title;
                row.code = rec.Data!.code;
                row.temporaryNotActive = rec.Data!.temporaryNotActive;
                row.description = rec.Data!.description;
                row.notActive = rec.Data!.notActive;
            }
        })();

        return true;
    }

    //получения данных из апи
    async getApiData(params: QueryParams) {
        return await this._scheduleViews.getScheduleItemGroupListView(params);
    }

}
