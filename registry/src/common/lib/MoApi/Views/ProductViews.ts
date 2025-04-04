import { injectable, inject } from "inversify";
import { QueryParams, QueryProductFtsList } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/src/common/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/src/common/lib/DataList";
import type { RecordsStore } from "../Records/RecordsStore";
import PricesEntity from "../Records/DataEntities/PricesEntity";


export interface IProductListView {
    id?: string | null;
    title?: string | null;
    fullTitle?: string | null;
    code?: string | null;
    productsCatalog?: string | null;
    productCatalogSection?: string | null;
    prices?: PricesEntity | null;
    duration?: number | null;
    comments?: string | null;
    temporaryNotActive?: boolean | null;
    notActive?: boolean | null;
    changedAt?: string | null;
    genderFilter?: string | null;
    catalogTitle?: string | null;
    catalogCode?: string | null;
    catalogTemporaryNotActive?: boolean | null;
    catalogNotActive?: boolean | null;
    sectionTitle?: string | null;
    sectionCode?: string | null;
    sectionParent?: string | null;
    sectionTemporaryNotActive?: boolean | null;
    sectionNotActive?: boolean | null;
}


export interface IProductFtsListView {
    "id": string | undefined,
    "title": string | undefined,
    "fullTitle": string | undefined,
    "catalogTitle": string | undefined,
    "sectionTitle": string | undefined
}



@injectable()
export class ProductViews {

    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("UserContext") protected _UserContext: UserContext,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) { }


    async getProductsListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Products/ProductsListView", args);
        let res = DataList.createFromApiDl<IProductListView>(apires, this._getConvMap());
        return res;
    }


    async getProductFtsListView(args: QueryProductFtsList) {
        const apires = await this._MoApiClient.send<QueryProductFtsList, IApiDataListResult>("/Products/ProductFtsListView", args);
        let res = DataList.createFromApiDl<IProductFtsListView>(apires, this._getConvMap());
        return res;
    }



    protected _getConvMap() {
        return {
            prices: this._pricesEntityConvertor
        }
    }


    protected _pricesEntityConvertor = (rawval) => rawval ? this._RecordsStore.dataEntityFactory(PricesEntity, rawval) : rawval;

}
