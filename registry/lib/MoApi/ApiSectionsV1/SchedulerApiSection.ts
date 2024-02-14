import { MoApiClient } from "../MoApiClient";
import type { QueryParamsScheduler } from "../RequestArgs";
import type { IApiDataListResult } from "../RequestResults";

export class ScheduleApiSection {


    constructor(protected _apiClient: MoApiClient) { }

    async getScheduleByItemGroup(args: QueryParamsScheduler){
        const apires = await this._apiClient.send<QueryParamsScheduler, IApiDataListResult>("/Employees/EmployeesListView", args);
    }
}