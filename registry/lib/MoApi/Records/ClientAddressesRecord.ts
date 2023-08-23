import { Exception } from "../../Exceptions";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IClientAddressesRecordData extends IApiRecordChData {
    mainAddress: any | null;
    permanentRegistration: any | null;
    advData: any | null;
}


export class ClientAddressesRecord extends ApiRecord<IClientAddressesRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, ClientAddressesRecord, Key);
    }


    protected _createNewAllData(): void {
        this._ModifiedData = new Proxy({
            id: this.Key,
            mainAddress: null,
            permanentRegistration: null,
            advData: null
        }, this._getModifingProxyHanlders());
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientAddresses";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientAddresses";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientAddresses";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}