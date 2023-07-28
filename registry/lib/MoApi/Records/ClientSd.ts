import { Exception } from "../../Exceptions";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IClientSdRecordData extends IApiRecordChData {
    citizenship?: number | null;
    kinship?: any | null;
    individualId?: string | null;
    comments?: string | null;
    advData?: any | null;
}


export class ClientSdRecord extends ApiRecord<IClientSdRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, ClientSdRecord, Key);
    }


    protected _createNewAllData(): void {
        this._Data = new Proxy({
            id: this.Key,
            citizenship: null,
            kinship: null,
            individualId: null,
            comments: null,
            advData: null
        }, this._getProxyHanlders());
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientSd";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientSd";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientSd";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}