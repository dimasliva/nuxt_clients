import * as Utils from '~/lib/Utils';
import { MoApiClient } from "../MoApiClient";
import type { IApiDataListResult } from "../RequestResults";
import { injectable, inject } from 'inversify';
import type { RecordsStore } from '../Records/RecordsStore';
import type { QueryFsParams } from '../RequestArgs';
import type { OrganizationRecordData } from '../Records/OrganizationRecord';
import { DataList } from '~/lib/DataList';


@injectable()
export class OrganizationsApiSection {


    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) { }



    async findOrganizations(where: string | null) {
        return await this._MoApiClient.send<string | null, string[]>("/Organizations/FindOrganizations", where, false);
    }



     async fuzzySearchOrganizations(params: QueryFsParams) {
        const raw = await this._MoApiClient.send<QueryFsParams, IApiDataListResult>("/Organizations/FuzzySearchOrganizations", params);
        return DataList.createFromApiDl<OrganizationRecordData>(raw);
      }

}