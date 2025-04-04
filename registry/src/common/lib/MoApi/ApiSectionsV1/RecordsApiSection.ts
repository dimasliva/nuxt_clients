import { injectable,inject } from "inversify";
import type { IFullRecordId, IRecordsData } from "../ApiInterfaces";
import type { MoApiClient } from "../MoApiClient";


@injectable()
export class RecordsApiSection {

    constructor(@inject("MoApiClient") protected _apiClient: MoApiClient) { }

    async getAllRecords() {
        return await this._apiClient.send<any, IRecordsData[]>('/Records/GetRecordsList', undefined, true);
    }



    async getRecs(recids: IFullRecordId[]) {
        if (!recids || recids.length == 0)
            return [];

        return await this._apiClient.send<IFullRecordId[], any>('/Records/GetRecs', recids, false);
    }



    async getLock(lockId: string) {
        return await this._apiClient.send<any, boolean>('/Records/GetLock', { lockId }, true);
    }



    async unlock(lockId: string) {
        return await this._apiClient.send<any, boolean>('/Records/Unlock', { lockId }, true);
    }

}
