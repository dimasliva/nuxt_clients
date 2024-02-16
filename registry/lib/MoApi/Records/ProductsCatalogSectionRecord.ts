import { injectable } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData, } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

@injectable()
export class ProductsCatalogSectionRecordData extends ApiRecordChData {
    title: string = "";
    code: string | null = null;
    productsCatalog: string = "";
    parent?: string | null = null;
    comments: string | null = null;
    temporaryNotActive: boolean | null = null;
    notActive: boolean | null = null;
    advData: string | null = null;
}

export class ProductsCatalogSectionRecord extends ApiRecord<ProductsCatalogSectionRecordData>{

    static RightToken = "dbProductsCatalogSection";
    static RecCode = 1023;
    static BatchGetRecDataPath="/Products/GetProductsCatalogSections";

    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, ProductsCatalogSectionRecord, Key);
    }

    get RecCode() { return ProductsCatalogSectionRecord.RecCode; }

    protected _createNewData() {
        return this._RecStore.dataEntityFactory(ProductsCatalogSectionRecordData, null, this.Key);
    }

    protected async _loadData() {
        const arr = await this._MoApiClient.send<any, any>(this._getApiRecordPathGet(), this._Key);
        this._Data = new Proxy(<ProductsCatalogSectionRecordData>arr, this._getProxyHanlders());
        this._ModifiedData = new Proxy(<ProductsCatalogSectionRecordData>arr, this._getModifingProxyHanlders())
        return this._Data;
    }

    protected _getApiRecordPathGet = () => "/Products/GetProductsCatalogSections";


    protected _getApiRecordPathAdd = () => "/Products/AddProductsCatalogSection";


    protected _getApiRecordPathUpdate = () => "/Products/UpdateProductsCatalogSection";


    protected _getApiRecordPathDelete = () => "/Products/DeleteProductsCatalogSection";
}