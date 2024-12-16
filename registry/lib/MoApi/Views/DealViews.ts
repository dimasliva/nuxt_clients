
import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


export interface IDealListView {
    id: string | null | undefined;
    title: string | null | undefined;
    organization: string | null | undefined;
    division: string | null | undefined;
    placement: string | null | undefined;
    beginDate: string | null | undefined;
    endDate: string | null | undefined;
    status: number | null | undefined;
    paymentStatus: number | null | undefined;
    booking: string | null | undefined;
    changedAt: string | null | undefined;
    notActive: boolean | null | undefined;
    clientId: string | null | undefined;
    positionId: string | null | undefined;
    productId: string | null | undefined;
    clientsText: string | null | undefined;
    positionsText: string | null | undefined;
    productsText: string | null | undefined;
}


@injectable()
export class DealViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getDealListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Deals/DealListView", args);
        let res = DataList.createFromApiDl<IDealListView>(apires);
        return res;
    }

}