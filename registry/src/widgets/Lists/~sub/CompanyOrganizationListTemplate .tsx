import { Container } from 'inversify';
import { QueryParams } from '~/src/common/lib/MoApi/RequestArgs';
import * as Utils from '~/src/common/lib/Utils';
import * as vHelpers from '~uilib/Helpers';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription } from '~widgets/DataTables';
import { CompanyOrganizationRecord } from '~/src/common/lib/MoApi/Records/CompanyOrganizationRecord';
import { ListTemplate, type IListTemplateProps } from '../ListTemplate';
import { CompanyOrganizationViews, type ICompanyOrganizationListView } from '~/src/common/lib/MoApi/Views/CompanyOrganizationViews';
import { recognizeDataInString } from '~/src/common/lib/Utils';
import { EDictionaries } from '~/src/common/lib/Dicts/DictionaryStore';
import { Dictionary } from "~/src/common/lib/Dicts/Dictionary";
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';
import { EDataType } from '~/src/common/lib/globalTypes';
import { DictsFinderDataProvider } from '~uilib/FinderDataProviders/DictsFinderDataProvider';
import type { TDictViewVal } from '~uilib/FinderDataProviders/FinderDataProvider';
import CompanyOrganizationProfileDialog from "~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/ProfileDialogs/CompanyOrganizationProfileDialog.vue";

let t: any;

type TCompanyOrganizationFilterVals = {
    id?: string | null;
    shortTitle?: string | null;
}



export class CompanyOrganizationListTemplate extends ListTemplate<TCompanyOrganizationFilterVals> {

    protected _companyOrganizationViews: CompanyOrganizationViews = null!;


    constructor(diC: Container, opts?: IListTemplateProps | null) {
        super(diC, opts);
        this._companyOrganizationViews = diC.get(CompanyOrganizationViews);
    }

    PAGE_TITLE = "Организации компании";
    titleColName = "shortTitle";

    defPageSettings = { tcols: ["shortTitle", "fullTitle", "oid"] };

    modelEditDialog = CompanyOrganizationProfileDialog;

    dataTableDescr = ref<IDataTableDescription>({
        headers: [
            {
                key: 'id', title: 'Ид', align: 'center', alignData: "start", width: "300", sortable: true,
                requestNames: undefined, traits: { "dbCompanyOrganization": "r" }
            },
            {
                key: 'shortTitle', title: 'Краткое название', align: 'center', alignData: "start", width: "600", sortable: true,
                requestNames: ["shortTitle"], traits: { "dbCompanyOrganization": "r" }
            },
            {
                key: 'fullTitle', title: 'Полное название', align: 'center', alignData: "start", width: "600", sortable: true,
                requestNames: ["fullTitle"], traits: { "dbCompanyOrganization": "r" }
            },
            { key: 'oid', title: 'OID', align: 'center', alignData: "center", width: "100", sortable: true, requestNames: ["oid"] }
        ],

        actionsMenu: this.props?.selectMode ? undefined : (item) => [
            { id: "1", title: "Редактировать", icon: "mdi-pencil", disabled: false, action: () => this.edit(item.key, item.index), traits: { dbCompanyOrganization: "u" } },
            { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { this.del(item.key, item.index) }, traits: { dbCompanyOrganization: "d" } },
        ]
    });

    async del(key: string, index) {
        await this._onDelModel("Вы действительно хотите удалить запись организации?", CompanyOrganizationRecord, key, index);
    }

    filterFieldSetting = {
        fields: {
            id: {
                type: EDataType.string,
                title: "Ид",
                hint: null,
                rules: [],
                constraints: { min: 2, max: 384 },
            },

            shortTitle: {
                type: EDataType.string,
                title: "Краткое название",
                hint: null,
                rules: [],
                constraints: { min: 2, max: 128 },
            },
        },

        defaultFocus: "id"
    };


    getWhereFromFilter = (filterVals: TCompanyOrganizationFilterVals) => {
        let whereArr: string[] = [];

        let tmp = filterVals.id?.trim();
        if (tmp)
            whereArr.push(`id = '${tmp}'`);

        tmp = filterVals.shortTitle?.trim();
        if (tmp) {
            if (tmp.length < 3)
                whereArr.push(`shortTitle like '${tmp}%'`);
            else
                whereArr.push(`shortTitle like '%${tmp}%'`);
        }

        if (whereArr.length == 0) return "";
        return whereArr.join(" and ");
    }


    convertRow = async (rawData: ICompanyOrganizationListView) => {
        return {
            id: rawData.id,
            shortTitle: rawData.shortTitle || "",
            fullTitle: rawData.fullTitle || "",
            oid: rawData.oid || ""
        }
    };


    onUpdateModel(key, index?) {
        (async () => {
            var row;
            if (index != null)
                row = this.dataTableVars.value.rows[index]
            else
                row = this.dataTableVars.value.rows.find((i) => i.id == key);

            if (row) {
                let rec = await this._recStore.fetch(CompanyOrganizationRecord, key);
                row.shortTitle = (rec.Data!.shortTitle || "");
                row.fullTitle = (rec.Data!.fullTitle || "");
                row.oid = (rec.Data!.oid || "");
            }
        })();

        return true;
    }


    async getApiData(params: QueryParams) {
        return await this._companyOrganizationViews.getCompanyOrganizationView(params);
    }
}