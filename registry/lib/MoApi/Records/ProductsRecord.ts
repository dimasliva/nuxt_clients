import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

export interface IProductsRecordData extends IApiRecordChData {
    title: string,
    fullTitle: string,
    code: string,
    productsCatalog: string,
    productsCatalogSection: string,
    prices: string,
    duration: 0,
    comments: string,
    temporaryNotActive: boolean,
    notActive: boolean,
    advData: string
}

export class ProductsRecord extends ApiRecord<IProductsRecordData>{
    
    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, ProductsRecord, Key);
    }

    get RecCode() { return ProductsRecord.RecCode; }

    protected _createNewData() {
        return {
            id: this.Key,
            title: '',
            fullTitle: '',
            code: '',
            productsCatalog: '',
            productsCatalogSection: '',
            prices: '',
            duration: 0,
            comments: '',
            temporaryNotActive: false,
            notActive: false,
            advData: null
        };
    }

    protected _getApiRecordPathGet = () => "/Products/GetProducts";


    protected _getApiRecordPathAdd = () => "/Products/AddProduct";


    protected _getApiRecordPathUpdate = () => "/Products/UpdateProduct";


    protected _getApiRecordPathDelete = () => "/Products/DeleteProduct";
}