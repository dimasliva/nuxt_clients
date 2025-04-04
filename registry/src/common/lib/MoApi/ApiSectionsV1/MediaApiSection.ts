import * as Utils from '~/src/common/lib/Utils';
import { MoApiClient } from "../MoApiClient";
import type { IApiDataListResult } from "../RequestResults";
import { injectable, inject } from 'inversify';
import type { RecordsStore } from '../Records/RecordsStore';


export interface SipGatewayCredential {
    username: string;
    password: string;
    ttl: number;
    uris: string[]
}


@injectable()
export class MediaApiSection {


    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) { }



    async getSipGatewayCredential() {
        return await this._MoApiClient.send<null, SipGatewayCredential>("/Media/GetSipGatewayCredential", null, true);
    }

}