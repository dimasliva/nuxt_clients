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
    static override RecCode = 1043;
    static override BatchGetRecDataPath = "";


    get RecCode() { return OrganizationRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(OrganizationRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" };


    protected _getApiRecordPathAdd = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathUpdate = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathDelete = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}