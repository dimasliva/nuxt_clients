import { injectable } from "inversify";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import { Exception } from "~/lib/Exceptions";


@injectable()
export class DealProductRecordData extends ApiRecordChData {
    extListId: string = '';
    source: string = '';
    quantity: number = 1;
    title: string = '';
    fullTitle?: string | null = null;
    code?: string | null = null;
    fullPrice?: number | null | undefined=null;
    duration: number = 0;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}



@injectable()
export class DealProductRecord extends ApiRecord<DealProductRecordData> {

    static override RightToken = "dbDealProduct";
    static override RecCode = 1043;
    static override BatchGetRecDataPath = "";


    get RecCode() { return DealProductRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(DealProductRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" };


    protected _getApiRecordPathAdd = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathUpdate = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathDelete = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}