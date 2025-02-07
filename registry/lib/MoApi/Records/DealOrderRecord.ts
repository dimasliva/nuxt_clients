import { injectable, inject } from "inversify";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { DealRecord, type AddDealArgs } from "./DealRecord";
import { Exception } from "~/lib/Exceptions";
import {type IPriceSetup } from "./Finance/IPriceSetup";
import type { IPaymentParams } from "./Finance/IPaymentParams";



@injectable()
export class DealOrderRecordData extends ApiRecordChData {
    date: string = '';
    organization: eid = null!;
    fullPrice?: number | null = null;
    contract?: eid | null = null;
    payment: number = 0;
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



    async AjustPrice(priceSetup: IPriceSetup) {
        debugger;
        const arg = {
            "recId": this.Key,
            "priceSetup": priceSetup
        }
        await this._MoApiClient.send("/DealOrders/AdjustProductPrices",arg);

        this._RecStore.invalidateRecs([{ type: DealOrderRecord, key: this.Key }]);
        this.Data!.deals?.forEach(v => this._RecStore.tryFetchFromCache(DealRecord, v)?.invalidateOnAjustPrice());
    }



    async AddPayment(params: IPaymentParams) {
        params.targetId = this.Key;
        params.companyOrganization = this.Data!.organization;

        await this._MoApiClient.send("/DealOrders/AddPaymentForDealOrder",params);
        this._RecStore.invalidateRecs([{ type: DealOrderRecord, key: this.Key }]);
    }



    async AddRefund(params: IPaymentParams) {
        debugger;
        params.targetId = this.Key;
        params.companyOrganization = this.Data!.organization;

        await this._MoApiClient.send("/DealOrders/AddRefundForDealOrder",params);
        this._RecStore.invalidateRecs([{ type: DealOrderRecord, key: this.Key }]);
    }
}



@injectable()
export class AddDealOrderArgs {
    Order: DealOrderRecordData;
    Clients: eid[] = [];
    Deals?: AddDealArgs[] | null = undefined;
    PriceSetup?: IPriceSetup | null = undefined;

    constructor(@inject("RecordsStore") RecordsStore: RecordsStore) {
        this.Order = RecordsStore.dataEntityFactory(DealOrderRecordData);
    }
}