import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

export interface IProductsCatalogSectionRecordData extends IApiRecordChData {
    title: string,
    code: string | null,
    productsCatalog: string,
    comments: string | null,
    temporaryNotActive: boolean,
    notActive: boolean,
    advData: string | null
}

export class ProductsCatalogSectionRecord extends ApiRecord<IProductsCatalogSectionRecordData>{
    
    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, ProductsCatalogSectionRecord, Key);
    }

    get RecCode() { return ProductsCatalogSectionRecord.RecCode; }

    protected _createNewData() {
        return {
            id: this.Key,
            title: '',
            code: null,
            productsCatalog: null,
            comments: null,
            temporaryNotActive: false,
            notActive: false,
            advData: null
        };
    }

    protected _getApiRecordPathGet = () => "/Products/GetProductsCatalogSections";


    protected _getApiRecordPathAdd = () => "/Products/AddProductsCatalogSection";


    protected _getApiRecordPathUpdate = () => "/Products/UpdateProductsCatalogSection";


    protected _getApiRecordPathDelete = () => "/Products/DeleteProductsCatalogSection";
}