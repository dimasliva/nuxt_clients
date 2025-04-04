import { injectable, inject, Container } from "inversify";
import { EventBus } from "../EventBus";
import { PageMemoryCache } from "./PageMemoryCache";
import { ProductCatalogSectionCache } from "./ProductCatalogSectionCache";
import { ProductCache } from "./ProductCache";



export const enum EWellKnownPageCaches {
    Products,
    ProductCatalogSections
}


@injectable()
export class PageMemoryCacheStore {

    protected _wellKnownCacheStore: { [cacheid: string]: PageMemoryCache } = {};
    _unsubscribe: any;


    constructor(
        @inject("SysEventBus") protected _EventBus: EventBus,
        @inject("diC") protected _diC: Container) {

        this._unsubscribe = this._EventBus.subscribe("onGroupСontentChanged", (type, dictArg) => {
            switch (type) {
                case 'productCatalogSection':
                    if (this._wellKnownCacheStore[EWellKnownPageCaches.ProductCatalogSections])
                        this._wellKnownCacheStore[EWellKnownPageCaches.ProductCatalogSections].clearPage(dictArg.sectionKey);
                    break;

                case 'product':
                    if (this._wellKnownCacheStore[EWellKnownPageCaches.Products])
                        this._wellKnownCacheStore[EWellKnownPageCaches.Products].clearPage(dictArg.sectionKey);
                    break;
            }

        });

    }



    getWellKnownCache(cacheId: EWellKnownPageCaches) {
        switch (cacheId) {
            case EWellKnownPageCaches.ProductCatalogSections:
                return this._wellKnownCacheStore[cacheId] ||
                    (this._wellKnownCacheStore[EWellKnownPageCaches.ProductCatalogSections] = this._diC.get(ProductCatalogSectionCache).init());

            case EWellKnownPageCaches.Products:
                return this._wellKnownCacheStore[cacheId] ||
                    (this._wellKnownCacheStore[EWellKnownPageCaches.Products] = this._diC.get(ProductCache).init());

        }
    }



    dispose() {
        if (this._EventBus) {
            this._unsubscribe();
            this._EventBus = null!;
        }
    }
}
