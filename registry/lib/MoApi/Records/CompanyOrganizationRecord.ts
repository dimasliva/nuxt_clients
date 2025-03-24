import { injectable } from "inversify";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import { Exception } from "~/lib/Exceptions";



@injectable()
export class CompanyOrganizationRecordData extends ApiRecordChData {
    shortTitle: string | null = null;
    fullTitle: string | null = null;
    oid: string | null = null;
    linkedRecs: any | null = null;
    profile: any | null = null;
    advData: any | null = null
}




@injectable()
export class CompanyOrganizationRecord extends ApiRecord<CompanyOrganizationRecordData> {

    static override RightToken = "dbCompanyOrganization";
    static override RecCode = 1003;
    static override BatchGetRecDataPath = "/CompanyOrganizations/GetCompanyOrganizations";


    get RecCode() { return CompanyOrganizationRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(CompanyOrganizationRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/CompanyOrganizations/GetCompanyOrganizations";


    protected _getApiRecordPathAdd = () => "/CompanyOrganizations/AddCompanyOrganization";


    protected _getApiRecordPathUpdate = () => "/CompanyOrganizations/UpdateCompanyOrganization";


    protected _getApiRecordPathDelete = () => "/CompanyOrganizations/DeleteCompanyOrganization";

}