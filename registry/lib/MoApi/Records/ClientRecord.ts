import { injectable } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";


@injectable()
export class ClientRecordData extends ApiRecordChData {
    name: string = "";
    surname: string = "";
    patronymic?: string | null = null;
    gender: string = "u";
    birthdate?: string | null = null;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}


@injectable()
export class ClientRecord extends ApiRecord<ClientRecordData>{

    static override RightToken = "dbClient";
    static override RecCode = 1010;
    static override BatchGetRecDataPath="/Clients/GetClients";
    static override RecordsFindPath = "/Clients/FindClients";


    get RecCode() { return ClientRecord.RecCode; }

 
    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(ClientRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClients";


    protected _getApiRecordPathAdd = () => "/Clients/AddClient";


    protected _getApiRecordPathUpdate = () => "/Clients/UpdateClient";


    protected _getApiRecordPathDelete = () => "/Clients/DeleteClient";

}