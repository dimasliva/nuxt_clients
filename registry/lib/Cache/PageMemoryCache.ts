


export class PageMemoryCache {

    protected _ttl: number = null!;
    protected _pages: Map<string, Page> = new Map();
    protected _index: Map<string, IndexVal | undefined> = new Map();


    constructor() { }


    init(ttl = 60 * 60 * 1000) {
        this._ttl = ttl;
        return this;
    }



    protected _checkBeforeGetVal(key: string) {
        const inxval = this._index.get(key);
        if (!inxval)
            return null;

        if (!this.checkPageExpiration(inxval.page))
            return null;
        return inxval;
    }



    getValue(key: string) {
        const inxval = this._checkBeforeGetVal(key);
        if (!inxval)
            return undefined;
        return inxval.value;
    }



    protected _checkBeforeSetVal(key: string, pagekey: string, value: any) {
        if (value == null) {
            this.removeValue(key);
            return null;
        };

        if (!this._pages.has(pagekey))
            this._pages.set(pagekey, new Page(pagekey, this._ttl));

        const page = this._pages.get(pagekey)!;
        this.checkPageExpiration(page);
        return page;
    }



    setValue(key: string, pagekey: string, value: any) {
        const page = this._checkBeforeSetVal(key, pagekey, value);
        if (!page)
            return;
        page.set(key);
        this._index.set(key, new IndexVal(page, value));
    }



    removeValue(key: string) {
        const inxval = this._index.get(key);
        if (!inxval)
            return;

        inxval.page.removeValue(key);
        this._index.delete(key);
    }



    async getOrCreate(key: string, pagekey: string, func: (key: string) => Promise<{ pagekey: string, value: any }>) {
        let val = this.getValue(key);
        if (val !== undefined)
            return val;

        const iv = await func(key);
        this.setValue(key, iv.pagekey, iv.value);
    }



    clearPage(pagekey: string) {
        const page = this._pages.get(pagekey);
        if (page) {
            this.removeFromIndex(page);
            page.clear();
        }
    }



    checkPageExpiration(page: Page) {
        if (page.isExpired()) {
            this.removeFromIndex(page);
            page.clear();
            return false;
        }
        return true;
    }



    removeFromIndex(page: Page) {
        if (!page)
            return;

        for (let key in page.getKeysIterator()) {
            this._index.set(key, undefined);
        }
    }



    getPage(pagekey:string){
        return this._pages.get(pagekey);
    }

}



export class Page {
    protected _ttl: number = null!;
    protected _lastUpdate: Date | null = null;
    protected _set: Set<string> = new Set();
    protected _key: string;


    constructor(key: string, ttl = 60 * 60 * 1000) {
        this._ttl = ttl;
        this._key = key;
    }



    set(key: string) {
        if (!this._set.has(key))
            this._set.add(key);

        if (!this._lastUpdate)
            this._lastUpdate = new Date();
    }



    removeValue(key: string) {
        this._set.delete(key);
    }



    clear() {
        this._set.clear();
        this._lastUpdate = null;
    }



    isExpired() {
        if (!this._lastUpdate)
            return false;
        return (<any>(new Date())) - <any>this._lastUpdate >= this._ttl;
    }



    getKeysIterator() {
        return this._set.keys();
    }



    isEmpty() {
        return this._lastUpdate == null;
    }
}



export class IndexVal {
    constructor(public page: Page, public value: any) { }
}