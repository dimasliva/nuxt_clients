import { injectable } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import RolesEntity from "./DataEntities/RolesEntity";
import type { RecordsStore } from "./RecordsStore";

@injectable()
export class RoleRecordData extends ApiRecordChData {
    roles: RolesEntity = null!;

    override fromJsonObj(obj: any) {
        super.fromJsonObj(obj)
        this.roles = this.__RecordStore.dataEntityFactory(RolesEntity, obj.roles);
    }
}

@injectable()
export class RolesRecord extends ApiRecord<RoleRecordData>{

    static RightToken = "DbRoles";
    static RecCode = 1008;


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(RoleRecordData, null,this.Key);
    }


    get RecCode() { return RolesRecord.RecCode; }


    protected async _loadData() {
        const arr = await this._MoApiClient.send<string[], any>(this._getApiRecordPathGet());
        this._Data = new Proxy(<RoleRecordData>this._createDataFromLoaded(arr), this._getProxyHanlders());
        this.Key = this._Data.id!;
        return this._Data;
    }

    protected _getApiRecordPathGet = () => "/Roles/GetRoles";


    protected _getApiRecordPathAdd = () => "/Roles/UpdateRoles";


    protected _getApiRecordPathUpdate = () => "/Roles/UpdateRoles";


    protected _getApiRecordPathDelete() { throw "Функция не реализована"; return "" }
}