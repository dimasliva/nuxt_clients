import { injectable, inject } from "inversify";
import { QueryProductFtsList } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


export interface IProductFtsListView {
    "id": string | undefined,
    "title":  string | undefined,
    "fullTitle":  string | undefined,
    "catalogTitle":  string | undefined,
    "sectionTitle":  string | undefined   
}

@injectable()
export class ProductFtsViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getProductFtsListView(args: QueryProductFtsList) {
        const apires = await this._MoApiClient.send<QueryProductFtsList, IApiDataListResult>("/Products/ProductFtsListView", args);
        let res = DataList.createFromApiDl<IProductFtsListView>(apires);
        return res;
    }

}
