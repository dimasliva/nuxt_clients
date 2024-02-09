import { Container, injectable, inject } from "inversify";
import { IndexVal, Page, PageMemoryCache } from "./PageMemoryCache";
import type { EventBus } from "../EventBus";
import type { MoApiClient } from "../MoApi/MoApiClient";
import type { UserContext } from "../UserContext";
import type { RecordsStore } from "../MoApi/Records/RecordsStore";
import { ProductRecord } from "../MoApi/Records/ProductRecord";
import { ProductsViews, type IProductListView } from "../MoApi/Views/ProductsListView";
import { QueryParams } from "../MoApi/RequestArgs";
import type PricesEntity from "../MoApi/Records/DataEntities/PricesEntity";
import { Exception } from "../Exceptions";


export class ProductCacheValue {

    title?: string | null;
    fullTitle?: string | null;
    code?: string | null;
    comments?: string | null;
    prices?: PricesEntity | null;

    constructor(val: IProductListView) {
        this.title = val.title;
        this.code = val.code;
        this.comments = val.comments;
        this.fullTitle = val.fullTitle;
        this.prices = val.prices;
    }
}



/**
 * Кеш продуктов. Страница кеша == секции каталога. Ид страницы == ключу секции каталога или дефолтному guid если продукт находится в корне каталога
 */
@injectable()
export class ProductCache extends PageMemoryCache {


    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("UserContext") protected _UserContext: UserContext,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
        @inject(ProductsViews) protected _ProductsViews: ProductsViews,

    ) {
        super();
    };



    protected async _loadPage(productkey: string) {
        const prodRec = await this._RecordsStore.tryFetch(ProductRecord, productkey);
        if (!prodRec)
            return null;

        const sectionKey = prodRec.Data!.productsCatalogSection || EmptyGuid;
        const select = "id,title,fullTitle,code,comments,prices";
        const where = `productsCatalog='${prodRec.Data!.productsCatalog}' and  productCatalogSection='${prodRec.Data!.productsCatalogSection}'`;

        const queryParams = new QueryParams(select, where);
        const dl = await this._ProductsViews.getProductsListView(queryParams);

        let row: IProductListView | undefined;
        while (row = dl.getNext())
            super.setValue(row.id!, row.productCatalogSection!, new ProductCacheValue(row));
    }




    setValue(key: string, pagekey: string, value: any) {
        Exception.throw("MethodNotImplemented", "Функция не реализована");
    }



    async getOrCreate(key: string): Promise<any> {
        const inxval = this._checkBeforeGetVal(key);
        if (!inxval) {
            await this._loadPage(key);
        }

        return this._index.get(key)?.value as ProductCacheValue;
    }
}

