import { Container, injectable, inject } from "inversify";
import { IndexVal, PageMemoryCache } from "./PageMemoryCache";
import type { MoApiClient } from "../MoApi/MoApiClient";
import type { UserContext } from "../UserContext";
import type { RecordsStore } from "../MoApi/Records/RecordsStore";
import { ProductsViews, type IProductListView } from "../MoApi/Views/ProductsListView";
import { ProductsCatalogSectionRecord } from "../MoApi/Records/ProductsCatalogSectionRecord";
import { QueryParams } from "../MoApi/RequestArgs";
import { Exception } from "../Exceptions";


export class ProductSectionCacheValue {

    title?: string | null;
    code?: string | null;
    temporaryNotActive?: boolean | null

    constructor(val: IProductListView) {
        this.title = val.sectionTitle;
        this.code = val.sectionCode;
        this.temporaryNotActive = val.sectionTemporaryNotActive;
    }
}


/**
 * Кеш секций каталога продуктов. Страница кеша == секции родительской секции каталога. Ид страницы == ключу родительской секции каталога или ключу каталога, если секция находится в корне каталога
 */

@injectable()
export class ProductCatalogSectionCache extends PageMemoryCache {

    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("UserContext") protected _UserContext: UserContext,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
        @inject(ProductsViews) protected _ProductsViews: ProductsViews
    ) {
        super();
    };



    /**Загрузка секции каталога по одной из дочерней секции*/
    protected async _loadPage(productSectionkey: string) {
        const rec = await this._RecordsStore.tryFetch(ProductsCatalogSectionRecord, productSectionkey);
        if (!rec)
            return null;

        const cachePageKey = rec.Data!.parent || rec.Data!.productsCatalog;
        const select = "id,title,code,temporaryNotActive";
        let where = rec.Data!.parent ? `productCatalogSection='${rec.Data!.parent}'` : "parent is null";
        where += ` and productsCatalog='${rec.Data!.productsCatalog}'`;

        const queryParams = new QueryParams(select, where);
        const dl = await this._ProductsViews.getProductsListView(queryParams);
        console.debug(`load product section cache page: ${cachePageKey} `)
        let row: IProductListView | undefined;
        while (row = dl.getNext())
            super.setValue(row.id!, cachePageKey, new ProductSectionCacheValue(row));
    }



      setValue(key: string, pagekey: string, value: any) {
        Exception.throw("MethodNotImplemented", "Функция не реализована");
    }



    async getOrCreate(key: string): Promise<any> {
        const inxval = this._checkBeforeGetVal(key);
        if (!inxval) {
            await this._loadPage(key);
        }

        return this._index.get(key)?.value as ProductSectionCacheValue;
    }
}

