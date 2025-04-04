import { injectable, inject } from "inversify";
import { BookingQuery, QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/src/common/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/src/common/lib/DataList";


export interface IScheduleItemGroupListView {
    id: string | null | undefined;
    title: string | null | undefined;
    code: string | null | undefined;
    temporaryNotActive: boolean | null | undefined;
    changedAt: string | null | undefined;
    notActive: boolean | null | undefined;
}



@injectable()
export class ScheduleViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getScheduleItemGroupListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Schedule/ScheduleItemGroupListView", args);
        let res = DataList.createFromApiDl<IScheduleItemGroupListView>(apires);
        return res;
    }

}