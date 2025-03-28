import { injectable } from "inversify";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import { Exception } from "~/lib/Exceptions";


@injectable()
export class ClientSnapshotRecordData extends ApiRecordChData {
    extListId: string = '';
    source: string = '';
    name: string = '';
    surname?: string | null = null;
    patronymic?: string | null = null;
    birthdate?: string | null = null;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}



@injectable()

export class ClientSnapshotRecord extends ApiRecord<ClientSnapshotRecordData> {

    static override RightToken = "dbClientSnapshot";
    static override RecCode = 1042;
    static overrideBatchGetRecDataPath = "/Clients/GetClientSnapshots";


    get RecCode() { return ClientSnapshotRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(ClientSnapshotRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientSnapshots";


    protected _getApiRecordPathAdd = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathUpdate = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathDelete = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}