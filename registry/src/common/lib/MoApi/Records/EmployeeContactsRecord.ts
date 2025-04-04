import { injectable } from "inversify";
import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";


@injectable()
export class EmployeeContactsRecordData extends ApiRecordChData {
    mainPhone?: string | null=null;
    mainEmail?: string | null=null;
    advData?: any | null=null;
}


@injectable()

export class EmployeeContactsRecord extends ApiRecord<EmployeeContactsRecordData>{

    static override RightToken = "dbEmployeeContacts";
    static override RecCode = 1006;
    static override BatchGetRecDataPath="/Employees/GetEmployeeContacts";


    get RecCode() { return EmployeeContactsRecord.RecCode; }


    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(EmployeeContactsRecordData, null, this.Key);
    }
    

    protected _getApiRecordPathGet = () => "/Employees/GetEmployeeContacts";


    protected _getApiRecordPathAdd = () => "/Employees/SetEmployeeContacts";


    protected _getApiRecordPathUpdate = () => "/Employees/SetEmployeeContacts";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}