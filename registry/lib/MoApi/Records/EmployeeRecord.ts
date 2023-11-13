import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData, } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

export class EmployeeRecordData extends ApiRecordChData {
    name: string = "";
    surname: string = "";
    patronymic?: string | null = null;
    gender: string = "u";
    birthdate?: string | null = null;
    rank?: number | null = null;
    photo?: string | null = null;
    roles?: string | null = null;
    notActive?: boolean | null = null;
    linkedRecs?: any | null = null;
    profile?: any | null = null;
    advData?: any | null = null;
}


export class EmployeeRecord extends ApiRecord<EmployeeRecordData>{

    static RightToken = "dbEmployee";
    static RecCode = 1004;

    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, EmployeeRecord, Key);
    }

    get RecCode() { return EmployeeRecord.RecCode; }

    protected _createNewData() {
        return this._RecStore.dataEntityFactory(EmployeeRecordData, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Employees/GetEmployees";


    protected _getApiRecordPathAdd = () => "/Employees/AddEmployee";


    protected _getApiRecordPathUpdate = () => "/Employees/UpdateEmployee";


    protected _getApiRecordPathDelete = () => "/Employees/DeleteEmployee";

}