import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";

export interface IEmployeeRecordData extends IApiRecordChData {
    name: string;
    surname: string;
    patronymic?: string | null;
    gender: string;
    birthdate?: string | null;
    rank?: number | null;
    photo?: string | null;
    roles?: string | null;
    notActive?: boolean | null;
    linkedRecs?: any | null;
    profile?: any | null;
    advData?: any | null;
}


export class EmployeeRecord extends ApiRecord<IEmployeeRecordData>{

    static  rightToken= "dbEmployee";

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, EmployeeRecord, Key);
    }

    get RecCode() { return 1004; }

    protected _createNewData() {
        return {
            "id": this.Key,
            "name": '',
            "surname": '',
            "patronymic": null,
            "gender": 'u',
            "birthdate": null,
            "rank": null,
            "photo": null,
            "roles": '',
            "notActive": false,
            "linkedRecs": null,
            "profile": null,
            "advData": null
        };
    }


    protected _getApiRecordPathGet = () => "/Employees/GetEmployees";


    protected _getApiRecordPathAdd = () => "/Employees/AddEmployee";


    protected _getApiRecordPathUpdate = () => "/Employees/UpdateEmployee";


    protected _getApiRecordPathDelete = () => "/Employees/DeleteEmployee";

}