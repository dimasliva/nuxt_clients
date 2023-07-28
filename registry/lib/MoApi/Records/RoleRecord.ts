import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordCompanyData } from "./ApiRecord";

export interface IRoleRecordData extends IApiRecordCompanyData {
    roles: {
        dbRoles: string,
        dbCompany: string,
        dbEmployee: string, 
        dbFilelink: string,
        "#CompanyAdmin": string | null,
        dbEmployeeContacts: string
      }
}

export class RoleRecord extends ApiRecord<IRoleRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, RoleRecord, Key);
    }

    protected _createNewAllData(): void {
        this._Data = new Proxy({
            "id": this.Key,
            roles: {
                dbRoles: '',
                dbCompany: '',
                dbEmployee: '', 
                dbFilelink: '',
                "#CompanyAdmin": null,
                dbEmployeeContacts: ''
              }
        }, this._getProxyHanlders());
    }

    protected async _loadAData() {
        const arr = await this._MoApiClient.send<string[], IRoleRecordData>(this._getApiRecordPathGet(), [this._Key]);
        this._Data = new Proxy(arr,this._getProxyHanlders());
        return this._Data;
    }

    protected _getApiRecordPathGet = () => "/Roles/GetRoles";


    protected _getApiRecordPathAdd () { throw  "Функция не реализована"; return ""};


    protected _getApiRecordPathUpdate = () => "/Roles/UpdateRoles";


    protected _getApiRecordPathDelete () { throw  "Функция не реализована"; return ""}
}