import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordCompanyData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

export interface IRoleRecordData extends IApiRecordCompanyData {
    roles: { [roleName: string]: string }
}

export class RolesRecord extends ApiRecord<IRoleRecordData>{

    static rightToken = "DbRoles";

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, RolesRecord, Key);
    }


    protected _createNewData() {
        return {
            id: this.Key,
            roles: {}
        };
    }


    protected async _loadData() {
        const arr = await this._MoApiClient.send<string[], IRoleRecordData>(this._getApiRecordPathGet(), [this._Key]);
        this._Data = new Proxy(arr, this._getProxyHanlders());
        return this._Data;
    }

    protected _getApiRecordPathGet = () => "/Roles/GetRoles";


    protected _getApiRecordPathAdd = () => "/Roles/UpdateRoles";


    protected _getApiRecordPathUpdate = () => "/Roles/UpdateRoles";


    protected _getApiRecordPathDelete() { throw "Функция не реализована"; return "" }
}