import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordCompanyData } from "./ApiRecord";

export interface IRoleRecordData extends IApiRecordCompanyData {
    roles: {[roleName:string]:string}
}

export class RoleRecord extends ApiRecord<IRoleRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, RoleRecord, Key);
    }

    protected _createNewAllData(): void {
        this._ModifiedData = new Proxy({
            id: this.Key,
            roles: {}
        }, this._getModifingProxyHanlders());
    }

    protected async _loadAData() {
        const arr = await this._MoApiClient.send<string[], IRoleRecordData>(this._getApiRecordPathGet(), [this._Key]);
        this._Data = new Proxy(arr,this._getProxyHanlders());
        return this._Data;
    }

    protected _getApiRecordPathGet = () => "/Roles/GetRoles";


    protected _getApiRecordPathAdd = () => "/Roles/UpdateRoles";


    protected _getApiRecordPathUpdate = () => "/Roles/UpdateRoles";


    protected _getApiRecordPathDelete () { throw  "Функция не реализована"; return ""}
}