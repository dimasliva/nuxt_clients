import { injectable } from "inversify";
import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import AddressEntity from "./DataEntities/AddressEntity";
import type { RecordsStore } from "./RecordsStore";


@injectable()
export class ClientAddressesRecordData extends ApiRecordChData {
    mainAddress: AddressEntity | null = null;
    permanentRegistration: AddressEntity | null = null;
    addressesEqual: boolean | null = null;
    advData: any | null = null;


    override fromJsonObj(obj: any) {
        super.fromJsonObj(obj)
        this.mainAddress = obj.mainAddress ? this.__RecordStore.dataEntityFactory(AddressEntity, obj.mainAddress) : null;
        this.permanentRegistration = obj.permanentRegistration ? this.__RecordStore.dataEntityFactory(AddressEntity, obj.permanentRegistration) : null;
    }
}


export class ClientAddressesRecord extends ApiRecord<ClientAddressesRecordData>{

    static RightToken = "dbClientAddresses";
    static RecCode = 1014;
    static BatchGetRecDataPath="/Clients/GetClientAddresses";

    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, ClientAddressesRecord, Key);
    }


    get RecCode() { return ClientAddressesRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(ClientAddressesRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientAddresses";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientAddresses";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientAddresses";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}