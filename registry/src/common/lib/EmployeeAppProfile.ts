import { injectable, inject, unmanaged } from "inversify";
import { MoApiClient } from "./MoApi/MoApiClient";
import * as vHelpers from '~uilib/Helpers';
import { AppProfile } from "./AppProfile";
import { UserContext } from "./UserContext";


export enum EEmployeeAppProfileSections {
    PageSettings = "pageSettings",
    ComponentSettings = "compSettings"
}



@injectable()
export class EmployeeAppProfile extends AppProfile {


    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @unmanaged() _profile?: any) {
        super(_profile || {
            pageSettings: {},
            compSettings: {}
        });

        if (!this._profile.pageSettings)
            this._profile.pageSettings = {};

        if (!this._profile.compSettings)
            this._profile.compSettings = {};
    }



    override getSection<T = any>(sectionName: string): T {
        return this._profile[sectionName];
    }



    override setSection<T = any>(sectionName: string, val: T) {
        this._profile[sectionName] = val;
    }



    getPropOfSection<T = any>(sectionName: EEmployeeAppProfileSections, propName: string) {
        const sect = this.getSection(sectionName) || {};
        return sect[propName] as T;
    }



    setPropOfSection<T = any>(sectionName: EEmployeeAppProfileSections, propName: string, val: T) {
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



@injectable()
export class EmployeeAppProfilePageDataStorageCell implements IDataStorageCell {

    protected _section: EEmployeeAppProfileSections = null!;
    protected _propName: string = "";
    protected _EmployeeAppProfile: EmployeeAppProfile;

    constructor(@inject("UserContext") userCtx: UserContext) {
        this._EmployeeAppProfile = userCtx.EmployeeAppProfile!;
    }



    initPageSec(pagePath: string) {
        this._section = EEmployeeAppProfileSections.PageSettings;
        this._propName = pagePath;
    }



    init(propName: string) {
        this._section = EEmployeeAppProfileSections.ComponentSettings;
        this._propName = propName;
    }



    getData<T = any>() {
        return this._EmployeeAppProfile.getPropOfSection<T>(this._section, this._propName);
    }



    setData<T = any>(data: T) {
        this._EmployeeAppProfile.setPropOfSection(this._section, this._propName, data);
    }



    async flush() {
        await this._EmployeeAppProfile.save();
    }

}