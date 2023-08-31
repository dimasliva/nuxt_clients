import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData, IApiRecordData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";



export interface IClientAddressesRecordData extends IApiRecordChData {
    mainAddress: any | null;
    permanentRegistration: any | null;
    advData: any | null;
}


export class ClientAddressesRecord extends ApiRecord<IClientAddressesRecordData>{

    static rightToken = "dbClientAddresses";

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, ClientAddressesRecord, Key);
    }



    protected _createNewData() {
        return {
            id: this.Key,
            mainAddress: null,
            permanentRegistration: null,
            advData: null
        }
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientAddresses";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientAddresses";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientAddresses";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}