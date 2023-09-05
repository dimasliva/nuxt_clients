import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";



export interface IClientContactsRecordData extends IApiRecordChData {
    mainPhone: string | null;
    mainEmail: string | null;
    otherContacts: any | null;
    advData: any | null;
}


export class ClientContactsRecord extends ApiRecord<IClientContactsRecordData>{

    static RightToken = "dbClientContacts";
    static RecCode = 1013;

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, ClientContactsRecord, Key);
    }


    get RecCode() { return ClientContactsRecord.RecCode; }


    protected _createNewData() {
        return {
            id: this.Key,
            mainPhone: null,
            mainEmail: null,
            otherContacts: null,
            advData: null
        };
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientContacts";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientContacts";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientContacts";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}