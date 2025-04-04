import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/src/common/lib/UserContext";
import type { IApiDataListResult } from "../RequestResults";
import { DataList } from "~/src/common/lib/DataList";


export interface IEmployeeListView {
    "id": string | undefined,
    "changedAt": string | undefined | null,
    "name": string | undefined | null,
    "surname": string | undefined,
    "patronymic": string | undefined | null,
    "mainPhone": string | undefined | null,
    "mainEmail": string | undefined | null,
    "snils": string | undefined | null
}


@injectable()
export class EmployeesViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getEmployeeListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Employees/EmployeesListView", args);
        let res = DataList.createFromApiDl<IEmployeeListView>(apires);
        return res;
    }

}
