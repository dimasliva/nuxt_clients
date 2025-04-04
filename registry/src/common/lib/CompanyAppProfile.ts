import { injectable, inject } from "inversify";
import { MoApiClient } from "./MoApi/MoApiClient";
import * as vHelpers from '~uilib/Helpers';
import { AppProfile } from "./AppProfile";


@injectable()
export class CompanyAppProfile extends AppProfile {


    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, _profile: any) {
        super(_profile);
    }



    override getSection<T = any>(sectionName: string): T {
        return this._profile[sectionName];
    }



    override setSection<T = any>(sectionName: string, val: T) {
        this._profile[sectionName] = val;
    }



    async load() {
        this._profile = this._MoApiClient.send("/Company/GetAppProfile");
    }



    async save() {
        vHelpers.action(async () => {
            await this._MoApiClient.send("/Company/UpdateAppProfile", this._profile);
        })
    }

}