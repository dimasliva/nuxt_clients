import { Container, injectable, inject } from "inversify";
import { IndexVal, Page, PageMemoryCache } from "./PageMemoryCache";
import type { EventBus } from "../EventBus";
import type { MoApiClient } from "../MoApi/MoApiClient";
import type { UserContext } from "../UserContext";
import type { RecordsStore } from "../MoApi/Records/RecordsStore";
import { ProductRecord } from "../MoApi/Records/ProductRecord";
import { ProductsViews } from "../MoApi/Views/ProductsListView";


/**
 * Кеш продуктов. Страница кеша == секции каталога. Ид страницы == ключу секции каталога или дефолтному guid если продукт находится в корне каталога
 */
@injectable()
export class ProductCache extends PageMemoryCache {


    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("UserContext") protected _UserContext: UserContext,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
        @inject(ProductsViews) protected _ProductsViews: RecordsStore,

    ) {
        super();
    };



    protected async _loadPage(productkey: string) {
        const prodRec = await this._RecordsStore.tryFetch(ProductRecord, productkey);
        if (!prodRec)
            return null;

        const sectionKey = prodRec.Data!.productsCatalogSection || EmptyGuid;

    }



    getValue(key: string) {
        const inxval = this._checkBeforeGetVal(key);
        if (!inxval) {
            return undefined;
        }

        return inxval.value;
    }



    setValue(key: string, pagekey: string, value: any) {
        const page = this._checkBeforeSetVal(key, pagekey, value);
        if (!page)
            return;


        page.set(key);
        this._index.set(key, new IndexVal(page, value));
    }
}

