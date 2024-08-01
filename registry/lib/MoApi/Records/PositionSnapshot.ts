import { injectable } from "inversify";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import { Exception } from "~/lib/Exceptions";


@injectable()
export class PositionSnapshotRecordData extends ApiRecordChData {
    extListId: string = '';
    source: string = '';
    position: number = 0;
    profession: number = 0;
    specialty: number = 0;
    name: string | null = null;
    surname: string | null = null;
    patronymic?: string | null = null;
    rank?: number | null = null;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}



@injectable()
export class PositionSnapshotRecord extends ApiRecord<PositionSnapshotRecordData> {

    static RightToken = "dbPositionSnapshot";
    static RecCode = 1044;
    static BatchGetRecDataPath = "/Positions/GetPositionSnapshots";


    get RecCode() { return PositionSnapshotRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(PositionSnapshotRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Positions/GetPositionSnapshots";


    protected _getApiRecordPathAdd = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathUpdate = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathDelete = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}