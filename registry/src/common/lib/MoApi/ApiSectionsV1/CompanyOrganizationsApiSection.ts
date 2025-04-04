import * as Utils from '~/src/common/lib/Utils';
import { MoApiClient } from "../MoApiClient";
import type { IApiDataListResult } from "../RequestResults";
import { injectable, inject } from 'inversify';
import type { RecordsStore } from '../Records/RecordsStore';
import type { QueryFsParams } from '../RequestArgs';
import type { CompanyOrganizationRecordData } from '../Records/CompanyOrganizationRecord';
import { DataList } from '~/src/common/lib/DataList';


@injectable()
export class CompanyOrganizationsApiSection {


    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) { }



    async findCompanyOrganizations(where: string | null) {
        return await this._MoApiClient.send<string | null, string[]>("/CompanyOrganizations/FindCompanyOrganizations", where, false);
    }



     async fuzzySearchCompanyOrganizations(params: QueryFsParams) {
        const raw = await this._MoApiClient.send<QueryFsParams, IApiDataListResult>("/CompanyOrganizations/FuzzySearchCompanyOrganizations", params);
        return DataList.createFromApiDl<CompanyOrganizationRecordData>(raw);
      }

}