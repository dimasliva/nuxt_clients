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
    temporaryNotActive?: boolean | null;

    constructor(val: IProductListView) {
        this.title = val.title;
        this.code = val.code;
        this.comments = val.comments;
        this.fullTitle = val.fullTitle;
        this.prices = val.prices;
        this.temporaryNotActive = val.temporaryNotActive;
    }
}



/**
 * Кеш продуктов. Страница кеша == секции каталога. Ид страницы == ключу секции каталога или ключу каталога, если продукт находится в корне каталога
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


    /**Загрузка секции каталога по одному из продуктов из этой секции*/
    protected async _loadPage(productkey: string) {
        const prodRec = await this._RecordsStore.tryFetch(ProductRecord, productkey);
        if (!prodRec)
            return null;

        const cachePageKey = prodRec.Data!.productsCatalogSection || prodRec.Data!.productsCatalog;
        const select = "id,title,fullTitle,code,comments,prices,temporaryNotActive";
        let where = prodRec.Data!.productsCatalogSection ? `productCatalogSection='${prodRec.Data!.productsCatalogSection}'` : "productCatalogSection is null";
        where += ` and productsCatalog='${prodRec.Data!.productsCatalog}'`;

        const queryParams = new QueryParams(select, where);
        const dl = await this._ProductsViews.getProductsListView(queryParams);
        console.debug(`load product cache page: ${cachePageKey} `)
        let row: IProductListView | undefined;
        while (row = dl.getNext())
            super.setValue(row.id!, cachePageKey, new ProductCacheValue(row));
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

