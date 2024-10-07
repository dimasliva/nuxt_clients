import { injectable } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { client } from "process";


@injectable()
export class DealRecordData extends ApiRecordChData {
    title: string | null = null;
    organization: string | null = null;
    division: string | null = null;
    placement: string | null = null;
    beginDate: string = '';
    endDate: string | null = null;
    status: number = 0;
    paymentStatus: number | null = null;
    failureCause: number | null = null;
    fullPrice: number | null = null;
    prices: any = null;
    booking: string | null = null;
    snapshot: string = '';
    notActive: boolean | null = null;
    advData: any = null;
    clients: string[] | null = null;
    positions: string[] | null = null;
    products: string[] | null = null;
}


@injectable()
export class DealRecord extends ApiRecord<DealRecordData> {

    static override RightToken = "dbDeal";
    static override RecCode = 1029;
    static override BatchGetRecDataPath = "/Deals/GetDeals";


    get RecCode() { return DealRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(DealRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Deals/GetDeals";


    protected _getApiRecordPathAdd = () => "/Deals/AddDeal";


    protected _getApiRecordPathUpdate = () => "/Deals/UpdateDeal";


    protected _getApiRecordPathDelete = () => "/Deals/DeleteDeal";



    async addSnapshots(snpts: { clients?: string[], positions?: string[], products?: string[] }) {

        const arg = {
            deal: this.Key,
            client: snpts.clients,
            positions: snpts.positions,
            products: snpts.products
        }

        const res = await this._MoApiClient.send<typeof arg, DealRecordData>("/Deals/AddSnapshots", arg);
        this._Data!.changedAt = res.changedAt;
        this._Data!.clients = res.clients;
        this._Data!.positions = res.positions;
        this._Data!.products = res.products;
    }



    async delSnapshots(snpts: { clients?: string[], positions?: string[], products?: string[] }) {

        const arg = {
            deal: this.Key,
            client: snpts.clients,
            positions: snpts.positions,
            products: snpts.products
        }

        const res = await this._MoApiClient.send<typeof arg, DealRecordData>("/Deals/DelSnapshots", arg);
        this._Data!.changedAt = res.changedAt;
        this._Data!.clients = res.clients;
        this._Data!.positions = res.positions;
        this._Data!.products = res.products;
    }

}