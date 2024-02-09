import { EDictionaries } from "~/lib/Dicts/DictionaryStore";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import PricesEntity from "./DataEntities/PricesEntity";
import type { RecordsStore } from "./RecordsStore";
import { injectable } from "inversify";

@injectable()
export class ProductRecordData extends ApiRecordChData {
    title: string = "";
    fullTitle: string | null = null;
    code: string | null = null;
    productsCatalog: string = "";
    productsCatalogSection: string | null = null;
    prices: PricesEntity | null = null;
    duration: number = 0;
    comments: string | null = null;
    temporaryNotActive: boolean | null = null;
    notActive: boolean | null = null;
    advData: any | null = null;

    override fromJsonObj(obj: any) {
        super.fromJsonObj(obj)
        this.prices = obj.prices ? this.__RecordStore.dataEntityFactory(PricesEntity, obj.prices) : null;
    }
}

export class ProductRecord extends ApiRecord<ProductRecordData>{

    static RightToken = "dbProduct";
    static RecCode = 1024;

    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, ProductRecord, Key);
    }

    get RecCode() { return ProductRecord.RecCode; }

    protected _createNewData() {
        return this._RecStore.dataEntityFactory(ProductRecordData, null,this.Key);
    }

    protected async _loadData() {
        const arr = await this._MoApiClient.send<any, any>(this._getApiRecordPathGet(), this._Key);
        this._Data = new Proxy(<ProductRecordData>arr, this._getProxyHanlders());
        this._ModifiedData = new Proxy(<ProductRecordData>arr, this._getModifingProxyHanlders())
        return this._Data;
    }

    protected _getApiRecordPathGet = () => "/Products/GetProducts";


    protected _getApiRecordPathAdd = () => "/Products/AddProduct";


    protected _getApiRecordPathUpdate = () => "/Products/UpdateProduct";


    protected _getApiRecordPathDelete = () => "/Products/DeleteProduct";



    getPrice(priceId: string | number) {
        return this.Data!.prices?.getPrice(priceId);
    }



    async setPrice(priceId: string | number, val: number) {
        const ptsdict = await this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.PriceTypes);

        ptsdict.getValByCode(priceId);//проверка существовния в словаре priceId

        if (!this.MData!.prices)
            this.MData!.prices = this._RecStore.dataEntityFactory(PricesEntity, { priceId: val });
        else
            this.MData!.prices.setPrice(priceId, val);
    }


    async setPriceTitle(priceId: string) {
        const ptsdict = await this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.PriceTypes);
        return ptsdict.getValByCode(priceId);
    }
}