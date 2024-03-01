import { Container, injectable, inject } from "inversify";
import { IndexVal, PageMemoryCache } from "./PageMemoryCache";
import type { MoApiClient } from "../MoApi/MoApiClient";
import type { UserContext } from "../UserContext";
import type { RecordsStore } from "../MoApi/Records/RecordsStore";
import { ProductsCatalogSectionRecord } from "../MoApi/Records/ProductsCatalogSectionRecord";
import { QueryParams } from "../MoApi/RequestArgs";
import { Exception } from "../Exceptions";
import { ProductsCatalogRecord } from "../MoApi/Records/ProductsCatalogRecord";
import { ProductsApiSection } from "../MoApi/ApiSectionsV1/ProductsApiSection";


export class ProductSectionCacheValue {

    title?: string | null;
    code?: string | null;
    temporaryNotActive?: boolean | null


    initFromRec(val: ProductsCatalogSectionRecord) {
        this.title = val.Data!.title;
        this.code = val.Data!.code;
        this.temporaryNotActive = val.Data!.temporaryNotActive;
        return this;
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
        @inject(ProductsApiSection) protected _ProductsApiSection: ProductsApiSection
    ) {
        super();
    };



    /**Загрузка секции каталога по одной из дочерней секции*/
    protected async _loadPageByChild(productSectionkey: string) {
        const rec = await this._RecordsStore.tryFetch(ProductsCatalogSectionRecord, productSectionkey);
        if (!rec)
            return null;

        const cachePageKey = rec.Data!.parent || rec.Data!.productsCatalog;
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


        let where = rec instanceof ProductsCatalogRecord ? "parent is null" : `parent='${key}'`
        where += ` and productsCatalog='${productsCatalog}'`;

        const ids = await this._ProductsApiSection.findProductsCatalogSections(where);
        const recs = await this._RecordsStore.getRecords(ProductsCatalogSectionRecord, ids, null,null,true);

        console.debug(`load product section for section cache page: ${key} `)
        const page = this._getPage(key);
        recs.forEach(item => {
            page.set(item.Key);
            this._index.set(item.Key, new IndexVal(page, new ProductSectionCacheValue().initFromRec(item)));
        });
        page.setLoaded();// на случай, если страница пустая, то нужно указать что она была загружена. Иначе при каждом последующем обращении к ней будет попытка загрузки
    }



    setValue(key: string, pagekey: string, value: any) {
        Exception.throw("MethodNotImplemented", "Функция не реализована");
    }



    async getOrCreate(key: string) {
        const inxval = this._checkBeforeGetVal(key);
        if (!inxval) {
            await this._loadPageByChild(key);
            return this._index.get(key)?.value as ProductSectionCacheValue;
        }
        else
            return inxval.value as ProductSectionCacheValue;
    }



    async getKeysIteratorInPage(pagekey: string) {
        let page = this._getPage(pagekey);
        if (!page || !page.isLoaded()) {
            await this._loadPage(pagekey);
            return this._pages.get(pagekey)?.getKeysIterator();
        }
        else
            return page.getKeysIterator();
    }

}

