import type { IFullRecordId, IRecordsData } from "../ApiInterfaces";
import type { MoApiClient } from "../MoApiClient";

export class RolesApiSection {

    constructor(protected _apiClient: MoApiClient) { }

    async getRoles() {
        return await this._apiClient.send<any, IRecordsData[]>('/Roles/GetRoles', undefined, true);
    }



    async getRecs(recids: IFullRecordId[]) {
        if (!recids || recids.length == 0)
            return [];
        
        return await this._apiClient.send<IFullRecordId[], any>('/Records/GetRecs', recids, false);
    }

}