import { injectable, inject } from "inversify";
import { MoApiClient } from "./MoApi/MoApiClient";
import * as vHelpers from '~~/libVis/Helpers';
import { AppProfile } from "./AppProfile";


export enum EEmployeeAppProfileSections {
    PageSettings = "pageSettings",
    ComponentSettings = "compSettings"
}



@injectable()
export class EmployeeAppProfile extends AppProfile {


    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, _profile: any) {
        super(_profile || {
            pageSettings: {},
            compSettings: {}
        });
    }



    getSection<T = any>(sectionName: string): T {
        return this._profile[sectionName];
    }



    setSection<T = any>(sectionName: string, val: T) {
        this._profile[sectionName] = val;
    }



    getPropOfSection(sectionName: EEmployeeAppProfileSections, propName: string) {
        const sect = this.getSection(sectionName);
        return sect[propName];
    }



    setPropOfSection(sectionName: EEmployeeAppProfileSections, propName: string, val: any) {
        const sect = this.getSection(sectionName);
        sect[propName] = val;
    }



    getPageSettings<T = any>(pagePath: string): T {
        return this._profile["pageSettings"][pagePath];
    }


    setPageSettings<T = any>(pagePath: string, val: T) {

        this._profile["pageSettings"][pagePath] = val;
    }



    async load() {
        this._profile = this._MoApiClient.send("/Employees/GetAppProfile");
    }



    async save() {
        vHelpers.action(async () => {
            await this._MoApiClient.send("/Employees/UpdateAppProfile", this._profile);
        })
    }

}