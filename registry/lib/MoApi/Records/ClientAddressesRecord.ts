import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData, IApiRecordData } from "./ApiRecord";
import AddressEntity from "./DataEntities/AddressEntity";
import type { RecordsStore } from "./RecordsStore";



export interface IClientAddressesRecordData extends IApiRecordChData {
    mainAddress?: AddressEntity | null;
    permanentRegistration?: AddressEntity | null;
    addressesEqual?: boolean | null;
    advData?: any | null;
}


export class ClientAddressesRecord extends ApiRecord<IClientAddressesRecordData>{

    static RightToken = "dbClientAddresses";
    static RecCode = 1014;

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, ClientAddressesRecord, Key);
    }


    get RecCode() { return ClientAddressesRecord.RecCode; }

    protected _createNewData() {
        return {
            id: this.Key,
            mainAddress: null,
            permanentRegistration: null,
            addressesEqual:null,
            advData: null
        }
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientAddresses";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientAddresses";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientAddresses";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}