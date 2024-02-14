import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


export interface IProductListView {
    id?: string | null;
    title?: string | null;
    fullTitle?: string | null;
    code?: string | null;
    productsCatalog?: string | null;
    productCatalogSection?: string | null;
    prices?: any | null;
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
    sectionTemporaryNotActive?: boolean | null;
    sectionNotActive?: boolean | null;
}


@injectable()
export class ProductsViews {

    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getProductsListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Products/ProductsListView", args);
        let res = DataList.createFromApiDl<IProductListView>(apires);
        return res;
    }

}
