import { injectable } from "inversify";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";



@injectable()
export class ClientGroupRecordData extends ApiRecordChData{
    title: string = '';
    code?: string | null= null;
    uid?: string | null= null;
    type?: number | null= null;
    description?: string | null= null;
    temporaryNotActive?: boolean | null= null;
    notActive?: boolean | null= null;
    advData?: any | null = null;
}



@injectable()
export class ClientGroupRecord extends ApiRecord<ClientGroupRecordData>{

     static override RightToken = "dbClientGroup";
     static override RecCode = 1039;
     static override BatchGetRecDataPath="/Clients/GetClientGroups";


    get RecCode() { return ClientGroupRecord.RecCode; }

 
    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(ClientGroupRecordData, null,this.Key);
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientGroups";


    protected _getApiRecordPathAdd = () => "/Clients/AddClientGroup";


    protected _getApiRecordPathUpdate = () => "/Clients/UpdateClientGroup";


    protected _getApiRecordPathDelete = () => "/Clients/DeleteClientGroup";

}