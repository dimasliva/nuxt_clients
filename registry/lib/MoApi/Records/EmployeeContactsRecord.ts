import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordCompanyData } from "./ApiRecord";



export interface IEmployeeContactsRecordData extends IApiRecordCompanyData {
    MainPhone?: string |null;
    MainEmail?: string |null;
    AdvData?: any |null;
}


export class EmployeeContactsRecord extends ApiRecord<IEmployeeContactsRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, EmployeeContactsRecord, Key);
    }


    protected _createNewAllData(): void {
        this._Data = new Proxy({
            id: this.Key,
            MainPhone: null,
            MainEmail: null,
            AdvData: null
        }, this._getProxyHanlders());
    }


    protected _getApiRecordPathGet = () => "/Employees/GetEmployeeContacts";


    protected _getApiRecordPathAdd = () => "/Employees/SetEmployeeContacts";


    protected _getApiRecordPathUpdate = () => "/Employees/SetEmployeeContacts";


    protected _getApiRecordPathDelete () { throw  "Функция не реализована"; return ""}

}