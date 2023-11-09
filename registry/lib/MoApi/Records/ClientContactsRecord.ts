import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";



export class ClientContactsRecordData extends ApiRecordChData {
    mainPhone: string | null = null;
    reservPhone: string | null = null;
    mainEmail: string | null = null;
    otherContacts: any | null = null;
    advData: any | null = null;
}


export class ClientContactsRecord extends ApiRecord<ClientContactsRecordData>{

    static RightToken = "dbClientContacts";
    static RecCode = 1013;

    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, ClientContactsRecord, Key);
    }


    get RecCode() { return ClientContactsRecord.RecCode; }


    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(ClientContactsRecordData, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientContacts";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientContacts";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientContacts";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}