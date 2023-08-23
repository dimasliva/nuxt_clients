import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IEmployeeAccountData extends IApiRecordChData {
    login: string,
    email: string,
    phone: string
}


export class EmployeeAccount extends ApiRecord<IEmployeeAccountData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, EmployeeAccount, Key);
    }

    get RecCode(){return 1004;}

    protected _createNewAllData(): void {
        this._Data = new Proxy({
            id: this.Key,
            login: "",
            email: "",
            phone: ""
        }, this._getProxyHanlders());
    }


    protected _getApiRecordPathGet  () { throw  "Функция не реализована"; return ""};


    protected _getApiRecordPathAdd = () => "/Employees/CreateEmployeeAccount";


    protected _getApiRecordPathUpdate  () { throw  "Функция не реализована"; return ""};


    protected _getApiRecordPathDelete = () => "/Employees/DeleteEmployeeAccount";

}