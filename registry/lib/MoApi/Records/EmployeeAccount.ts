import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";



export interface IEmployeeAccountData extends IApiRecordChData {
    login: string,
    email: string,
    phone: string
}


export class EmployeeAccount extends ApiRecord<IEmployeeAccountData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, EmployeeAccount, Key);
    }


    protected _createNewData() {
        return {
            id: this.Key,
            login: "",
            email: "",
            phone: ""
        };
    }


    protected _getApiRecordPathGet() { throw "Функция не реализована"; return "" };


    protected _getApiRecordPathAdd = () => "/Employees/CreateEmployeeAccount";


    protected _getApiRecordPathUpdate() { throw "Функция не реализована"; return "" };


    protected _getApiRecordPathDelete = () => "/Employees/DeleteEmployeeAccount";

}