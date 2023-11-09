import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";



export class ClientRecordData extends ApiRecordChData {
    name: string = "";
    surname: string = "";
    patronymic?: string | null = null;
    gender: string = "u";
    birthdate?: string | null = null;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}


export class ClientRecord extends ApiRecord<ClientRecordData>{

    static RightToken = "dbClient";
    static RecCode = 1010;


    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, ClientRecord, Key);
    }

    get RecCode() { return ClientRecord.RecCode; }

 
    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(ClientRecordData, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClients";


    protected _getApiRecordPathAdd = () => "/Clients/AddClient";


    protected _getApiRecordPathUpdate = () => "/Clients/UpdateClient";


    protected _getApiRecordPathDelete = () => "/Clients/DeleteClient";

}