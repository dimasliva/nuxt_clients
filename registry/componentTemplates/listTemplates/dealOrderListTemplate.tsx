import { Container } from 'inversify';
import { QueryParams } from '~/lib/MoApi/RequestArgs';
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~/libVis/Helpers';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription } from '~/componentComposables/dataTables/useDataTable';
import { DealOrderRecord } from '~/lib/MoApi/Records/DealOrderRecord';
import { ListTemplate, type IListTemplateProps } from '~/componentTemplates/listTemplates/listTemplate';
import { DealOrderViews, type IDealOrderListView } from '~/lib/MoApi/Views/DealOrderViews';
import { recognizeDataInString } from '~/lib/Utils';
import { MoApiClient } from '~/lib/MoApi/MoApiClient';
import { EDataType } from '~/lib/globalTypes';
import type { TDictViewVal } from '~/libVis/FinderDataProviders/FinderDataProvider';
import { ClientFinderDataProvider } from '~/libVis/FinderDataProviders/ClientFinderDataProvider';
import DealOrderProfileDialog from '~/forms/DealOrderProfileDialog.vue';
import { useCurrency } from '~/componentComposables/useCurrency';
import { DealOrderSdRecord } from '~/lib/MoApi/Records/DealOrderSdRecord';
import type { IFullRecordIdT } from '~/lib/MoApi/ApiInterfaces';
import type { ApiRecord } from '~/lib/MoApi/Records/ApiRecord';
import { CompanyOrganizationRecord } from '~/lib/MoApi/Records/CompanyOrganizationRecord';
import { ContractRecord } from '~/lib/MoApi/Records/ContractRecord';

let t: any;

type TDealOrderFilterVals = {
    id?: string | null;
    changedAt?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    organizations?: TDictViewVal[] | null;
    contracts?: TDictViewVal[] | null;
    clients?: TDictViewVal[] | null;
}

export class DealOrderListTemplate extends ListTemplate<TDealOrderFilterVals> {

    protected _dealOrderViews: DealOrderViews = null!;
    protected _clientFinderDataProvider: ClientFinderDataProvider = null!;
    protected _moApiClient: MoApiClient = null!;


    constructor(diC: Container, opts?: IListTemplateProps | null) {
        super(diC, opts);

        this._dealOrderViews = diC.get(DealOrderViews);
        this._clientFinderDataProvider = diC.get(ClientFinderDataProvider);
        this._moApiClient = diC.get("MoApiClient");

        this._clientFinderDataProvider.init("serachClients", true);
        this.filterFieldSetting.fields.clients.finderDataProvider = this._clientFinderDataProvider;
    }


    PAGE_TITLE = "Заказы";
    //колонка, значения из которой будут отображаться в списке выбранных
    titleColName = "id";

    //Настройки по умолчанию
    defPageSettings = { tcols: ["date", "organizationShortTitle", "fullPrice", "clientsText", "comments"] };

    //Указание компонента формы редакции модели
    modelEditDialog = DealOrderProfileDialog;

    //Настрока таблицы
    dataTableDescr = ref<IDataTableDescription>({
        headers: [
            {
                key: 'id', title: 'Идентификатор', align: 'center', alignData: "start", width: "300", sortable: true,
                requestNames: undefined, traits: { "dbDealOrder": "r" }
            },
            {
                key: 'date', title: 'Дата', align: 'center', alignData: "start", width: "100", sortable: true,
                requestNames: ["date"], traits: { "dbDealOrder": "r" }
            },

            {
                key: 'organizationShortTitle', title: 'Организация', align: 'center', alignData: "start", width: "300", sortable: true,
                requestNames: ["organizationShortTitle"], traits: { "DbCompanyOrganization": "r" }
            },
            { key: 'fullPrice', title: 'Общая стоимость', align: 'center', alignData: "center", width: "150", sortable: true, requestNames: ["fullPrice"] },
            { key: 'contract', title: 'Договор', align: 'center', alignData: "center", width: "150", sortable: true, requestNames: ["contract"] },
            { key: 'payment', title: 'Оплата', align: 'center', alignData: "center", width: "150", sortable: true, requestNames: ["payment"] },
            { key: 'clientsText', title: 'Клиенты', align: 'center', alignData: "center", width: "300", sortable: true, requestNames: ["clientsText"] },
            { key: 'comments', title: 'Комментарии', align: 'center', alignData: "center", width: "600", sortable: true, requestNames: ["comments"] }
        ],

        actionsMenu: this.props?.selectMode ? undefined : (item) => [
            { id: "1", title: "Редактировать", icon: "mdi-pencil", disabled: false, action: () => this.edit(item.key, item.index), traits: { dbDealOrder: "u" } },
            { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { this.del(item.key, item.index) }, traits: { dbDealOrder: "d" } },
        ]
    });

    async del(key: string, index) {
        await this._onDelModel("Вы действительно хотите удалить запись заказа?", DealOrderRecord, key, index);
    }

    //Настрока формы фильтра
    filterFieldSetting = {
        fields: {
            id: {
                type: EDataType.string,
                title: "Идентификатор",
                hint: null,
                rules: [],
                constraints: { min: 2, max: 19 },
            },

            dateFrom: {
                type: EDataType.date,
                title: "Дата создания заказа с",
                hint: null,
                rules: [],
                constraints: {},
                traits: { dbDealOrder: "r" }
            },

            dateTo: {
                type: EDataType.date,
                title: "Дата создания заказа до",
                hint: null,
                rules: [],
                constraints: {},
                traits: { dbDealOrder: "r" }
            },

            organizations: {
                type: EDataType.referenceMultiple,
                title: "Организация",
                hint: null,
                traits: { dbDealOrder: "r" },
                //finderDataProvider:
            },

            contracts: {
                type: EDataType.referenceMultiple,
                title: "Договор",
                hint: null,
                rules: [],
                traits: { dbDealOrder: "r" },
                //finderDataProvider:
            },

            clients: {
                type: EDataType.referenceMultiple,
                title: "Клиенты",
                hint: null,
                rules: [],
                traits: { dbDealOrder: "r" },
                finderDataProvider: this._clientFinderDataProvider
            }

        },

        defaultFocus: "id"
    };



    override getAdvRequestFields(selColumns?: string[]) {
        if (selColumns?.includes("contract"))
            return ["contractDate", "contractPayer", "contractNumber"];
        else
            return [];
    }


    //Получение строки поиска из данных, введенных в форме фильтра
    getWhereFromFilter = (filterVals: TDealOrderFilterVals) => {
        let whereArr: string[] = [];

        let tmp = filterVals.id?.trim();
        if (tmp)
            whereArr.push(`id=${tmp}`);

        if (filterVals.dateFrom)
            whereArr.push(`date >='${filterVals.dateFrom}'`);

        if (filterVals.dateTo)
            whereArr.push(`date <='${filterVals.dateTo}'`);

        if (filterVals.organizations)
            whereArr.push(`organization in (${Utils.getQuotesString(filterVals.organizations.map(v => v.value))})`);

        if (filterVals.contracts)
            whereArr.push(`contract in (${Utils.getQuotesString(filterVals.contracts.map(v => v.value))})`);

        if (filterVals.clients)
            whereArr.push(`clientId in (${Utils.getQuotesString(filterVals.clients.map(v => v.value))})`);

        if (whereArr.length == 0) return "";
        return whereArr.join(" and ");
    }

    //Конвертация данных из формата апи в формат для таблицы
    convertRow = async (rawData: IDealOrderListView) => {
        debugger
        const { currencyM2V } = useCurrency();
        return {
            id: rawData.id,
            date: rawData.date ? new Intl.DateTimeFormat().format(new Date(rawData.date)) : "",
            organizationShortTitle: rawData.organizationShortTitle || "",
            fullPrice: currencyM2V(rawData.fullPrice || 0).toFixed(2),
            contract: rawData.contract || "",
            payment: currencyM2V(rawData.payment || 0).toFixed(2),
            clientsText: rawData.clientsText || "",
            comments: rawData.comments || ""
        }
    };

    //Вызывается при изменении модели и необходимости обновления 1 строчки в таблице
    onUpdateModel(key, index?) {

        (async () => {
            debugger
            var row;
            if (index != null)
                row = this.dataTableVars.value.rows[index]
            else
                row = this.dataTableVars.value.rows.find((i) => i.id == key);

            if (row) {
                let rec = await this._recStore.fetch(DealOrderRecord, key);
                let recSd = await this._recStore.getOrCreate(DealOrderSdRecord, key);

                const advRecs: IFullRecordIdT<ApiRecord>[] = [
                    { key: rec.Data!.organization, type: CompanyOrganizationRecord }
                ];

                if (rec.Data!.contract) {
                    advRecs.push({ key: rec.Data!.contract, type: ContractRecord });
                }

                let recs = await this._recStore.getRecordsM(advRecs.map(v => { return { id: v } }));

                const recOrg = recs[0] as CompanyOrganizationRecord;
                const recContr = recs[1] as ContractRecord;

                row.clientsText = recSd.Data!.clientsText;
                row.comments = recSd.Data!.comments;
                row.contract = rec.Data!.contract;
                row.date = new Intl.DateTimeFormat().format(new Date(rec.Data!.date))
            }
        })();

        return true;
    }

    //получения данных из апи
    async getApiData(params: QueryParams) {
        return await this._dealOrderViews.getDealOrderListView(params);
    }

}