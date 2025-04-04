import type { UserContext } from "~/src/common/lib/UserContext";
import type { RecordsStore } from "../RecordsStore";
import type { MoApiClient } from "../../MoApiClient";
import { EDictionaries } from "../../../Dicts/DictionaryStore";
import { DataEntity } from "./DataEntity";
import { Dictionary } from "~/src/common/lib/Dicts/Dictionary";
import { injectable, inject } from "inversify";

@injectable()
export default class PricesEntity extends DataEntity {

    protected _prices: { [priceId: string]: number; } = null!;


    constructor(
        @inject("MoApiClient") protected __MoApiClient: MoApiClient,
        @inject("RecordsStore") RecordsStore: RecordsStore) {
        super(RecordsStore);
        Object.defineProperty(this, "__MoApiClient", { enumerable: false });
    }



    override fromJsonObj(obj: any) {
        this._prices = obj;
    }



    override  getJsonObj() {
        return this._prices;
    }



    setPrice(priceId: string | number, val: number) {
        this._prices[priceId] = val;
    }



    getPrice(priceId: string | number,) {
        return this._prices[priceId];
    }

}