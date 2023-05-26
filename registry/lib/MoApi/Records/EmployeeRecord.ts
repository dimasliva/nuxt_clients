import { DataList } from "~/lib/DataList";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordCompanyData } from "./ApiRecord";
import { QueryParams } from "~/lib/MoApi/RequestArgs";
import { IApiDataListResult } from "../RequestResults";


export interface IEmployeeRecordData extends IApiRecordCompanyData {
    "name": string,
    "surname": string,
    "patronymic": string | null,
    "gender": string,
    "birthdate": string | null,
    "roles": string,
    "notActive": boolean,
    "linkedRecs": any,
    "profile": any,
    "advData": any
}


export class EmployeeRecord extends ApiRecord<IEmployeeRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, EmployeeRecord, Key);
    }


    protected _createNewAllData(): void {
        this._Data = new Proxy({
            "id": this.Key,
            "name": '',
            "surname": '',
            "patronymic": null,
            "gender": '',
            "birthdate": null,
            "roles": '',
            "notActive": false,
            "linkedRecs": null,
            "profile": null,
            "advData": null
        }, this._getProxyHanlders());
    }


    protected _getApiRecordPathGet = () => "/Employees/GetEmployees";


    protected _getApiRecordPathAdd = () => "/Employees/AddEmployee";


    protected _getApiRecordPathUpdate = () => "/Employees/UpdateEmployee";


    protected _getApiRecordPathDelete = () => "/Employees/DeleteEmployee";

}