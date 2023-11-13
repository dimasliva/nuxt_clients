import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

export class ProductRecordData extends ApiRecordChData {
    title: string = "";
    fullTitle: string | null = null;
    code: string | null = null;
    productsCatalog: string = "";
    productsCatalogSection: string | null = null;
    prices: any | null = null;
    duration: number = 0;
    comments: string | null = null;
    temporaryNotActive: boolean | null = null;
    notActive: boolean | null = null;
    advData: any | null = null;
}

export class ProductRecord extends ApiRecord<ProductRecordData>{

    static RightToken = "dbProduct";
    static RecCode = 1024;

    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, ProductRecord, Key);
    }

    get RecCode() { return ProductRecord.RecCode; }

    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(ProductRecordData, this.Key);
    }

    protected _getApiRecordPathGet = () => "/Products/GetProducts";


    protected _getApiRecordPathAdd = () => "/Products/AddProduct";


    protected _getApiRecordPathUpdate = () => "/Products/UpdateProduct";


    protected _getApiRecordPathDelete = () => "/Products/DeleteProduct";
}