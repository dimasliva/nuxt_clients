import { injectable } from "inversify";
import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";


@injectable()
export class ClientContactsRecordData extends ApiRecordChData {
    mainPhone: string | null = null;
    reservPhone: string | null = null;
    mainEmail: string | null = null;
    otherContacts: any | null = null;
    advData: any | null = null;
}


@injectable()
export class ClientContactsRecord extends ApiRecord<ClientContactsRecordData>{

    static override RightToken = "dbClientContacts";
    static override RecCode = 1013;
    static override BatchGetRecDataPath="/Clients/GetClientContacts";


    get RecCode() { return ClientContactsRecord.RecCode; }


    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(ClientContactsRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientContacts";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientContacts";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientContacts";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}