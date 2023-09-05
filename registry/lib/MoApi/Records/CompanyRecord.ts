import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

export interface ICompanyRecordData extends IApiRecordChData {
    "defaultOrg": string | null,
    "linkedRecs": string | null,
    "profile": string | null,
    "advData": string | null
}


export class CompanyRecord extends ApiRecord<ICompanyRecordData>{

    static RightToken = "dbCompany";
    static RecCode = 1001;

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, CompanyRecord, Key);
    }


    get RecCode() { return CompanyRecord.RecCode; }

    protected _createNewData() {
        return {
            "id": this.Key,
            "createdAt": '',
            "changedAt": '',
            "defaultOrg": "",
            "linkedRecs": "",
            "profile": null,
            "advData": ""
        };
    }


    protected _getApiRecordPathGet = () => "/Employees/GetCompany";


    protected _getApiRecordPathAdd() { throw new Error("Method not implemented."); return ""; };


    protected _getApiRecordPathUpdate = () => "/Employees/UpdateCompany";


    protected _getApiRecordPathDelete() { throw new Error("Method not implemented."); return ""; };

}