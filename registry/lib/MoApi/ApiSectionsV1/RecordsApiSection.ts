import type { IFullRecordId, IRecordsData } from "../ApiInterfaces";
import type { MoApiClient } from "../MoApiClient";

export class RecordsApiSection {

    constructor(protected _apiClient: MoApiClient) { }

    async getAllRecords() {
        return await this._apiClient.send<any, IRecordsData[]>('/Records/GetRecordsList', undefined, true);
    }



    async getRecs(recids: IFullRecordId[]) {
        if (!recids || recids.length == 0)
            return [];
        
        return await this._apiClient.send<IFullRecordId[], any>('/Records/GetRecs', recids, false);
    }



}
