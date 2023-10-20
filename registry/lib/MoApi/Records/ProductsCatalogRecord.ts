import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

export interface IProductsCatalogRecordData extends IApiRecordChData {
    title: string,
    code: string | null,
    comments: string | null,
    temporaryNotActive: boolean,
    notActive: boolean,
    advData: string | null
}

export class ProductsCatalogRecord extends ApiRecord<IProductsCatalogRecordData>{

    static RecCode = 1012;
    
    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, ProductsCatalogRecord, Key);
    }

    get RecCode() { return ProductsCatalogRecord.RecCode; }

    protected _createNewData() {
        return {
            id: this.Key,
            title: '',
            code: null,
            comments: null,
            temporaryNotActive: false,
            notActive: false,
            advData: null
        };
    }
    

    protected _getApiRecordPathGet = () => "/Products/GetProductsCatalogs";


    protected _getApiRecordPathAdd = () => "/Products/AddProductsCatalog";


    protected _getApiRecordPathUpdate = () => "/Products/UpdateProductsCatalog";


    protected _getApiRecordPathDelete = () => "/Products/DeleteProductsCatalog";
}