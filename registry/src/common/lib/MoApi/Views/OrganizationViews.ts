import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/src/common/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/src/common/lib/DataList";


export interface IOrganizationListView {
    id?: string | null;
    shortTitle?:  string | null;
    fullTitle?:  string | null;
    oid?:  string | null;
    changedAt?:  string | null;
}



@injectable()
export class OrganizationViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getOrganizationListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Organizations/OrganizationListView", args);
        let res = DataList.createFromApiDl<IOrganizationListView>(apires);
        return res;
    }

}
