import { Exception } from "../../Exceptions";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IEmployeeContactsRecordData extends IApiRecordChData {
    MainPhone?: string | null;
    MainEmail?: string | null;
    AdvData?: any | null;
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


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented","Функция не реализована"); return "" }

}