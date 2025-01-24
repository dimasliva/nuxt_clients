import { injectable,inject } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { Exception } from "~/lib/Exceptions";



@injectable()
export class DealRecordData extends ApiRecordChData {
    title: string | null = null;
    organization: eid | null = null;
    division: eid | null = null;
    placement: eid | null = null;
    beginDate: string = '';
    endDate: string | null = null;
    status: number = 0;
    paymentStatus: number | null = null;
    failureCause: number | null = null;
    fullPrice: number = 0;
    prices: any | null = null;
    booking: eid | null = null;
    extListId: string = null!;
    clientsExtListId: string = null!;
    dealOrder: eid | null = null;
    notActive: boolean | null = null;
    advData: any | null = null;
    clients: eid[] | null = null;
    positions: eid[] | null = null;
    products: eid[] | null = null;
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


   protected _getApiRecordPathAdd() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" };


    protected _getApiRecordPathUpdate = () => "/Deals/UpdateDeal";


    protected _getApiRecordPathDelete = () => "/Deals/DeleteDeal";


    static async AddDealOrderRecord(_MoApiClient: MoApiClient, args: AddDealArgs) {
        return await _MoApiClient.send<AddDealArgs, { id: string; changedAt: string }>("/Deals/AddDeal", args);
    }



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


@injectable()
export class AddDealArgs {
    Deal: DealRecordData;
    Positions: eid[] = [];
    Products: eid[] = [];

    constructor(@inject("RecordsStore") RecordsStore: RecordsStore) {
        this.Deal = RecordsStore.dataEntityFactory(DealRecordData);
    }
}