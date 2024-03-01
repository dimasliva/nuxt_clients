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

@injectable()
export class ProductsCatalogSectionRecord extends ApiRecord<ProductsCatalogSectionRecordData>{

    static RightToken = "dbProductsCatalogSection";
    static RecCode = 1023;
    static BatchGetRecDataPath="/Products/GetProductsCatalogSections";


    get RecCode() { return ProductsCatalogSectionRecord.RecCode; }

    protected _createNewData() {
        return this._RecStore.dataEntityFactory(ProductsCatalogSectionRecordData, null, this.Key);
    }

 
    protected _getApiRecordPathGet = () => "/Products/GetProductsCatalogSections";


    protected _getApiRecordPathAdd = () => "/Products/AddProductsCatalogSection";


    protected _getApiRecordPathUpdate = () => "/Products/UpdateProductsCatalogSection";


    protected _getApiRecordPathDelete = () => "/Products/DeleteProductsCatalogSection";
}