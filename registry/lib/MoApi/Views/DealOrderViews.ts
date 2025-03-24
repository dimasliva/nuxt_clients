
import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


export interface IDealOrderListView {
    id: string | null | undefined;
    changedAt: string | null | undefined;
    date: string | null | undefined;
    organization: string | null | undefined;
    fullPrice: number | null | undefined;
    contract: string | null | undefined;
    payment: number | null | undefined;
    clientsText: string | null | undefined;
    comments: string | null | undefined;
    organizationShortTitle: string | null | undefined;
    contractNumber: string | null | undefined;
    contractDate: string | null | undefined;
    contractPayer: string | null | undefined;
}



@injectable()
export class DealOrderViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getDealOrderListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/DealOrders/DealOrderListView", args);
        let res = DataList.createFromApiDl<IDealOrderListView>(apires);
        return res;
    }

}