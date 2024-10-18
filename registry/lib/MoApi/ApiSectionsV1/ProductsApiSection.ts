import * as Utils from '~/lib/Utils';
import { MoApiClient } from "../MoApiClient";
import type { IApiDataListResult } from "../RequestResults";
import { injectable, inject } from 'inversify';
import type { RecordsStore } from '../Records/RecordsStore';


@injectable()
export class ProductsApiSection {


    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) { }



    async findProducts(where: string | null) {
        return await this._MoApiClient.send<string | null, string[]>("/Products/FindProducts", where, false);
    }



    async findProductsCatalogs(where: string | null) {
        return await this._MoApiClient.send<string | null, string[]>("/Products/FindProductsCatalogs", where, false);
    }



    async findProductsCatalogSections(where: string | null) {
        return await this._MoApiClient.send<string | null, string[]>("/Products/FindProductsCatalogSections", where, false);
    }


    async getProductPathRecs(productId: string) {
        return await this._MoApiClient.send<{ productId: string }, { code: number, entity: any }[]>("/Products/GetProductPathRecs", { productId }, true);
    }

}