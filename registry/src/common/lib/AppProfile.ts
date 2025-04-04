import { injectable, inject } from "inversify";


@injectable()
export abstract class AppProfile implements IAppSettingsStorage {


    constructor(protected _profile?: any) {
        this._profile=_profile || {};
    }


    getSection<T = any>(sectionName: string): T {
        return this._profile[sectionName];
    }



    setSection<T = any>(sectionName: string, val: T) {
         this._profile[sectionName]=val;
    }


    abstract load();
    abstract save();
}