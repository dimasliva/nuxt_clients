
import { Container } from 'inversify';
import { QueryParams } from '~/lib/MoApi/RequestArgs';
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~/libVis/Helpers';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription } from '~/componentComposables/dataTables/useDataTable';
import { DealRecord } from '~/lib/MoApi/Records/DealRecord';
import { ListTemplate, type IListTemplateProps } from '~/componentTemplates/listTemplates/listTemplate';
import { DealViews, type IDealListView } from '~/lib/MoApi/Views/DealViews';
import { recognizeDataInString } from '~/lib/Utils';
import { EDictionaries } from '~/lib/Dicts/DictionaryStore';
import { Dictionary } from "~/lib/Dicts/Dictionary";
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDataType } from '~/lib/globalTypes';
import { DictsFinderDataProvider } from '~/libVis/FinderDataProviders/DictsFinderDataProvider';
import type { TDictViewVal } from '~/libVis/FinderDataProviders/FinderDataProvider';
import { PositionFinderDataProvider } from '~/libVis/FinderDataProviders/PositionFinderDataProvider';
import { ClientFinderDataProvider } from '~/libVis/FinderDataProviders/ClientFinderDataProvider';
import { ProductFinderDataProvider } from '~/libVis/FinderDataProviders/ProductFinderDataProvider';
import DealProfileDialog from '~/forms/DealProfileDialog.vue';


let t: any;

type TDealFilterVals = {
    title?: string | null;
    beginDate?: string | null;
    endDate?: string | null;
    positions?: TDictViewVal[] | null;
    clients?: TDictViewVal[] | null;
    products?: TDictViewVal[] | null;
}


export class DealListTemplate extends ListTemplate<TDealFilterVals> {

    protected _dealViews: DealViews = null!;
    protected _positionFinderDataProvider: PositionFinderDataProvider = null!;
    protected _clientFinderDataProvider: ClientFinderDataProvider = null!;
    protected _productFinderDataProvider: ProductFinderDataProvider = null!;
    protected _moApiClient: MoApiClient = null!;


    constructor(diC: Container, opts?: IListTemplateProps | null) {
        super(diC, opts);

        this._dealViews = diC.get(DealViews);
        this._positionFinderDataProvider = diC.get(PositionFinderDataProvider);
        this._clientFinderDataProvider = diC.get(ClientFinderDataProvider);
        this._productFinderDataProvider = diC.get(ProductFinderDataProvider);
        this._moApiClient = diC.get("MoApiClient");

        this._positionFinderDataProvider.init("serachPositions", true);
        this.filterFieldSetting.fields.positions.finderDataProvider = this._positionFinderDataProvider;

        this._clientFinderDataProvider.init("serachClients", true);
        this.filterFieldSetting.fields.clients.finderDataProvider = this._clientFinderDataProvider;

        this._productFinderDataProvider.init("serachProducts", true);
        this.filterFieldSetting.fields.products.finderDataProvider = this._productFinderDataProvider;
    }


    PAGE_TITLE = "Сделки";
    //колонка, значения из которой будут отображаться в списке выбранных
    titleColName = "id";

    //Настройки по умолчанию
    defPageSettings = { tcols: ["beginDate", "endDate", "productsText", "clientsText", "positionsText"] };


    //Указание компонента формы редакции модели
    modelEditDialog = DealProfileDialog;

    //Настрока таблицы
    dataTableDescr = ref<IDataTableDescription>({
        headers: [
            {
                key: 'id', title: 'Ид', align: 'center', alignData: "start", width: "300", sortable: true,
                requestNames: ["id"], traits: { "dbDeal": "r" }
            },
            {
                key: 'title', title: 'Название сделки', align: 'center', alignData: "start", width: "600", sortable: true,
                requestNames: ["title"], traits: { "dbDeal": "r" }
            },
            { key: 'beginDate', title: 'Дата начала', align: 'center', alignData: "center", width: "100", sortable: true, requestNames: ["beginDate"] },
            { key: 'endDate', title: 'Дата завершения', align: 'center', alignData: "center", width: "100", sortable: true, requestNames: ["endDate"] },
            { key: 'clientsText', title: 'Получатели', align: 'center', alignData: "center", width: "300", sortable: true, requestNames: ["clientsText"] },
            { key: 'positionsText', title: 'Ответственные', align: 'center', alignData: "center", width: "300", sortable: true, requestNames: ["positionsText"] },
            { key: 'productsText', title: 'Товары и услуги', align: 'center', alignData: "center", width: "600", sortable: true, requestNames: ["productsText"] },
            { key: 'dealStatus', title: 'Статус', align: 'center', alignData: "center", width: "150", sortable: true, requestNames: ["status"] }
        ],

        actionsMenu: this.props?.selectMode ? undefined : (item) => [
            { id: "1", title: "Редакировать", icon: "mdi-pencil", disabled: false, action: () => this.edit(item.key, item.index), traits: { dbDeal: "u" } },
            { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { this.del(item.key, item.index) }, traits: { dbDeal: "d" } },
        ]
    });


    async del(key: string, index) {
        await this._onDelModel("Вы действительно хотите удалить запись сделки?", DealRecord, key, index);
    }



    //Настрока формы фильтра
    filterFieldSetting = {
        fields: {
            title: {
                type: EDataType.string,
                title: "Название",
                hint: null,
                rules: [],
                constraints: { min: 2, max: 384 },
            },

            beginDate: {
                type: EDataType.datetime,
                title: "Дата начала",
                hint: null,
                rules: [],
                constraints: { min: "2024-10-11T00:00", max: "2024-12-11T23:59" },
                traits: { dbDeal: "r" }
            },

            endDate: {
                type: EDataType.datetime,
                title: "Дата завершения",
                hint: null,
                rules: [],
                //constraints: { min: 2, max: 64 },
                traits: { dbDeal: "r" }
            },

            positions: {
                type: EDataType.referenceMultiple,
                title: "Ответственные",
                hint: null,
                rules: [],
                //constraints: { min: 2, max: 64 },
                traits: { dbDeal: "r" },
                finderDataProvider: this._positionFinderDataProvider
            },


            clients: {
                type: EDataType.referenceMultiple,
                title: "Получатели",
                hint: null,
                rules: [],
                //constraints: { min: 2, max: 64 },
                traits: { dbDeal: "r" },
                finderDataProvider: this._clientFinderDataProvider
            },

            products: {
                type: EDataType.referenceMultiple,
                title: "Товары и услуги",
                hint: null,
                rules: [],
                //constraints: { min: 2, max: 64 },
                traits: { dbDeal: "r" },
                finderDataProvider: this._productFinderDataProvider
            },

        },

        defaultFocus: "title"
    };


    //Получение строки поиска из данных, введеных в форме фильтра
    getWhereFromFilter = (filterVals: TDealFilterVals) => {
        let whereArr: string[] = [];

        let tmp = filterVals.title?.trim();
        if (tmp)
            whereArr.push(`title like '${tmp}%'`);

        if (filterVals.beginDate)
            whereArr.push(`beginDate >='${filterVals.beginDate}'`);

        if (filterVals.endDate)
            whereArr.push(`endDate >='${filterVals.beginDate}'`);

        if (filterVals.positions)
            whereArr.push(`positionId in (${Utils.getQuotesString(filterVals.positions.map(v => v.value))})`);

        if (filterVals.clients)
            whereArr.push(`clientId in (${Utils.getQuotesString(filterVals.clients.map(v => v.value))})`);

        if (filterVals.products)
            whereArr.push(`productId in (${Utils.getQuotesString(filterVals.products.map(v => v.value))})`);

        if (whereArr.length == 0) return "";
        return whereArr.join(" and ");
    }

    //Конвертация данных из формата апи в формат для таблицы
    convertRow = async (rawData: IDealListView) => {
        const statusDict = this._moApiClient.getDictionaryStore().getDictionary(EDictionaries.DealStatus);
        //debugger;
        return {
            id: rawData.id,
            title: rawData.title || "",
            beginDate: rawData.beginDate ? new Intl.DateTimeFormat().format(new Date(rawData.beginDate)) : "",
            endDate: rawData.endDate ? new Intl.DateTimeFormat().format(new Date(rawData.endDate)) : "",
            clientsText: rawData.clientsText || "",
            productsText: rawData.productsText || "",
            positionsText: rawData.positionsText || "",
            dealStatus: await statusDict.tryGetValByCode(rawData.status) || "неопределен"
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
                //   let dictstore = this._moApiClient.getDictionaryStore();
                //    let rec = await this._recStore.fetch(DealRecord, key);
            }
        })();

        return true;
    }


    //получения данных из апи
    async getApiData(params: QueryParams) {
        return await this._dealViews.getDealListView(params);
    }

}
