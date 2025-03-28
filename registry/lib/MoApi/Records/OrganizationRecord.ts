import { injectable } from "inversify";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import { Exception } from "~/lib/Exceptions";
import AddressEntity from "./DataEntities/AddressEntity";


@injectable()
export class OrganizationRecordData extends ApiRecordChData {
    type: number = 0;
    title: string = '';
    fullTitle: string = '';
    regionCode?: string | null = null;
    phone?: string | null = null;
    email?: string | null = null;
    address?: AddressEntity | null = null;
    ogrn?: string | null = null;
    inn?: string | null = null;
    kpp?: string | null = null;
    comments?: string | null = null;
    notActive?: boolean | null = null;
    advData?: any | null = null;

    override fromJsonObj(obj: any) {
        super.fromJsonObj(obj)
        this.address = obj.address ? this.__RecordStore.dataEntityFactory(AddressEntity, obj.address) : null;
    }
}




@injectable()

export class OrganizationRecord extends ApiRecord<OrganizationRecordData> {

    static override RightToken = "dbOrganization";
    static override RecCode = 1018;
    static override BatchGetRecDataPath = "/Organizations/GetOrganizations";
    static override RecordsFindPath = "/Organizations/FindOrganizations";


    get RecCode() { return OrganizationRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(OrganizationRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Organizations/GetOrganizations";


    protected _getApiRecordPathAdd = () => "/Organizations/AddOrganization";


    protected _getApiRecordPathUpdate = () => "/Organizations/UpdateOrganization";


    protected _getApiRecordPathDelete = () => "/Organizations/DeleteOrganization";

}