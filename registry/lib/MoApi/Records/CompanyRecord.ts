import { injectable } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

@injectable()
export class CompanyRecordData extends ApiRecordChData {
    "defaultOrg": string | null = null;
    "linkedRecs": string | null = null;
    "profile": string | null = null;
    "advData": string | null = null;
}


@injectable()
export class CompanyRecord extends ApiRecord<CompanyRecordData>{

    static RightToken = "dbCompany";
    static RecCode = 1001;


    get RecCode() { return CompanyRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(CompanyRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Employees/GetCompany";


    protected _getApiRecordPathAdd() { throw new Error("Method not implemented."); return ""; };


    protected _getApiRecordPathUpdate = () => "/Employees/UpdateCompany";


    protected _getApiRecordPathDelete() { throw new Error("Method not implemented."); return ""; };

}