import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";

export interface ICompanyRecordData extends IApiRecordChData {
    "defaultOrg": string | null,
    "linkedRecs": string | null,
    "profile": string | null,
    "advData": string | null
}


export class CompanyRecord extends ApiRecord<ICompanyRecordData>{


    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, CompanyRecord, Key);
    }



    protected _createNewAllData(): void {
        this._Data = new Proxy({
            "id": this.Key,
            "createdAt": '',
            "changedAt": '',
            "defaultOrg": "",
            "linkedRecs": "",
            "profile": null,
            "advData": ""
        }, this._getProxyHanlders());
    }


    protected _getApiRecordPathGet = () => "/Employees/GetCompany";


    protected _getApiRecordPathAdd() { throw new Error("Method not implemented."); return ""; };


    protected _getApiRecordPathUpdate = () => "/Employees/UpdateCompany";


    protected _getApiRecordPathDelete() { throw new Error("Method not implemented."); return ""; };

}