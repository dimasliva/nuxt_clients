import { injectable, inject } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import type { AddDealArgs } from "./DealRecord";
import { Exception } from "~/lib/Exceptions";
import type { PriceSetup } from "./Finance/PriceSetup";



@injectable()
export class DealOrderRecordData extends ApiRecordChData {
    date: string = '';
    organization: eid = null!;
    fullPrice: number | null = null;
    contract?: eid | null = null;
    clientsExtListId: string = null!;
    failureCause: number | null = null;
    advData: any | null = null;
    deals: eid[] | null = null;
    clients: eid[] = [];
}



@injectable()
export class DealOrderRecord extends ApiRecord<DealOrderRecordData> {

    static override RightToken = "dbDealOrder";
    static override RecCode = 1045;
    static override BatchGetRecDataPath = "/DealOrders/GetOrders";


    get RecCode() { return DealOrderRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(DealOrderRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/DealOrders/GetDealOrders";


    protected _getApiRecordPathAdd() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" };


    protected _getApiRecordPathUpdate = () => "/DealOrders/UpdateDealOrder";


    protected _getApiRecordPathDelete = () => "/DealOrders/DeleteDealOrder";


    static async AddDealOrderRecord(_MoApiClient: MoApiClient, args: AddDealOrderArgs) {
        return await _MoApiClient.send<AddDealOrderArgs, { id: string; changedAt: string }>("/DealOrders/AddDealOrder", args);
    }

}


@injectable()
export class AddDealOrderArgs {
    Order: DealOrderRecordData;
    Clients: eid[] = [];
    Deals?: AddDealArgs[] | null = undefined;
    PriceSetup?: PriceSetup | null = undefined;

    constructor(@inject("RecordsStore") RecordsStore: RecordsStore) {
        this.Order = RecordsStore.dataEntityFactory(DealOrderRecordData);
    }
}