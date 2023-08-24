import { Exception } from "../../Exceptions";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IEmployeeContactsRecordData extends IApiRecordChData {
    mainPhone?: string | null;
    mainEmail?: string | null;
    advData?: any | null;
}


export class EmployeeContactsRecord extends ApiRecord<IEmployeeContactsRecordData>{

    static  rightToken= "dbEmployeeContacts";

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, EmployeeContactsRecord, Key);
    }



    protected _createNewData() {
        return {
            id: this.Key,
            mainPhone: null,
            mainEmail: null,
            advData: null
        };
    }


    protected _getApiRecordPathGet = () => "/Employees/GetEmployeeContacts";


    protected _getApiRecordPathAdd = () => "/Employees/SetEmployeeContacts";


    protected _getApiRecordPathUpdate = () => "/Employees/SetEmployeeContacts";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}