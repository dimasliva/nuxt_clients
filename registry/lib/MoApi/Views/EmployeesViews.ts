import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


@injectable()
export class EmployeesViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getEmployeeListView<T = any>(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Employees/EmployeesListView", args);
        debugger
        let res = DataList.createFromApiDl<T>(apires);
        return res;
    }

}
