import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


export interface IPositionListView {
    id?: string | null;
    position?: number | null;
    profession?: number | null;
    specialty?: number | null;
    employee?: string | null;
    employeeName?: string | null;
    employeeSurname?: string | null;
    employeePatronymic?: string | null;
    changedAt?: string | null;
    notActive?: boolean | null;
}


@injectable()
export class PositionsViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getPositionListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Positions/PositionsListView", args);
        let res = DataList.createFromApiDl<IPositionListView>(apires);
        return res;
    }

}
