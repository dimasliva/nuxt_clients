import { injectable } from "inversify";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import { Exception } from "~/lib/Exceptions";


@injectable()
export class ProductSnapshotRecordData extends ApiRecordChData {
    extListId: string = '';
    source: string = '';
    title: string = '';
    fullTitle?: string | null = null;
    code?: string | null = null;
    prices?: { [key: number]: number } | null = null;
    duration: number = 0;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}



@injectable()
export class ProductSnapshotRecord extends ApiRecord<ProductSnapshotRecordData> {

    static RightToken = "dbProductSnapshot";
    static RecCode = 1043;
    static BatchGetRecDataPath = "/Products/GetProductSnapshots";


    get RecCode() { return ProductSnapshotRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(ProductSnapshotRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Products/GetProductSnapshots";


    protected _getApiRecordPathAdd = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathUpdate = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathDelete = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}