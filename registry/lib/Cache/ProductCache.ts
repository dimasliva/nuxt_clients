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
import { ProductsCatalogSectionRecord } from "../MoApi/Records/ProductsCatalogSectionRecord";
import { ProductsCatalogRecord } from "../MoApi/Records/ProductsCatalogRecord";


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
    protected async _loadPageByChild(productkey: string) {
        const rec = await this._RecordsStore.tryFetch(ProductRecord, productkey);
        if (!rec)
            return null;

        const cachePageKey = rec.Data!.productsCatalogSection || rec.Data!.productsCatalog;
        await this._loadPage(cachePageKey)
    }


    /**Загрузка секции каталога по ключу родителя(каталог или секция каталога)*/
    protected async _loadPage(key: string) {

        let productsCatalog = "";

        const rec = await this._RecordsStore.tryFetch(ProductsCatalogSectionRecord, key) || await this._RecordsStore.tryFetch(ProductsCatalogRecord, key);
        if (!rec)
            return null;
        else
            if (rec instanceof ProductsCatalogSectionRecord)
                productsCatalog = rec.Data!.productsCatalog;
            else
                productsCatalog = key;

        const select = "id,title,fullTitle,code,comments,prices,temporaryNotActive";
        let where = rec instanceof ProductsCatalogRecord ? "productCatalogSection is null" : `productCatalogSection='${key}'`;
        where += ` and productsCatalog='${productsCatalog}'`;

        const queryParams = new QueryParams(select, where);
        const dl = await this._ProductsViews.getProductsListView(queryParams);
        console.debug(`load product section cache page: ${key} `)
        let row: IProductListView | undefined;
        const page = this._getPage(key);
        while (row = dl.getNext()) {
            page.set(row.id!);
            this._index.set(row.id!, new IndexVal(page, new ProductCacheValue(row)));
        }
        page.setLoaded();// на случай, если страница пустая, то нужно указать что она была загружена. Иначе при каждом последующем обращении к ней будет попытка загрузки
    }



    setValue(key: string, pagekey: string, value: any) {
        Exception.throw("MethodNotImplemented", "Функция не реализована");
    }



    async getOrCreate(key: string) {
        const inxval = this._checkBeforeGetVal(key);
        if (!inxval) {
            await this._loadPageByChild(key);
            return this._index.get(key)?.value as ProductCacheValue;
        }
        else
            return inxval.value as ProductCacheValue;
    }



    async getKeysIteratorInPage(pagekey: string) {
        let page = this._getPage(pagekey);
        if (!page || page.isLoaded()) {
            await this._loadPage(pagekey);
            return this._pages.get(pagekey)?.getKeysIterator();
        }
        else
            return page.getKeysIterator();
    }
}

