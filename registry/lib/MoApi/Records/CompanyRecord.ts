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

    static  rightToken= "dbCompany";

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, CompanyRecord, Key);
    }



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