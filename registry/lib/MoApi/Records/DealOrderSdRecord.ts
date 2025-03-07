import { injectable, inject } from "inversify";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { Exception } from "~/lib/Exceptions";



@injectable()
export class DbDealOrderSdData extends ApiRecordChData {
    clientsText?: string | null;
    comments?: string | null;
    advData?: any | null; 
  }


@injectable()
export class DealOrderSdRecord extends ApiRecord<DbDealOrderSdData> {

    static override RightToken = "dbDealOrderSd";
    static override RecCode = 1048;
    //static override BatchGetRecDataPath = "/DealOrders/GetOrders";


    get RecCode() { return DealOrderSdRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(DbDealOrderSdData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/DealOrders/GetDealOrdersSd";


    protected _getApiRecordPathAdd = () => "/DealOrders/SetDealOrderSd";


    protected _getApiRecordPathUpdate = () => "/DealOrders/SetDealOrderSd";


    protected _getApiRecordPathDelete = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" };
}
