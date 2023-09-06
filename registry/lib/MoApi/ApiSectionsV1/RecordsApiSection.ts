import { IRecordsData } from "../ApiInterfaces";
import type { MoApiClient } from "../MoApiClient";

export class RecordsApiSection {

    constructor(protected _apiClient: MoApiClient) { }

    async getAllRecords() {
        return await this._apiClient.send<any, IRecordsData[]>('/Records/GetRecordsList', undefined, true);
    }

}
