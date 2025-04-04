

import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/src/common/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/src/common/lib/DataList";


export interface ICompanyOrganizationListView {
    id?: string;
    shortTitle?: string;
    fullTitle?: string;
    oid?: string;
    changedAt?: string;
}



@injectable()
export class CompanyOrganizationViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getCompanyOrganizationView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/CompanyOrganizations/CompanyOrganizationListView", args);
        let res = DataList.createFromApiDl<ICompanyOrganizationListView>(apires);
        return res;
    }

}
