import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


export interface IContractListView {
    id?: string | null;
    changedAt?: string | null;
    date?: string | null;
    beginDate?: string | null;
    endDate?: string | null;
    number?: string | null;
    companyOrganization?: string | null;
    payerOrganization?: string | null;
    client?: string | null;
    payerClient?: string | null;
    priceType?: number | null;
    notActive?: boolean | null;
    advData?: any | null;
    payerTitle?: string | null;
    payerOrgType?: number | null;
}



@injectable()
export class ContractViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getContractListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Finance/ContractListView", args);
        let res = DataList.createFromApiDl<IContractListView>(apires);
        return res;
    }

}
