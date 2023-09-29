import type { IDictItemValueView } from "~/lib/MoApi/ApiSectionsV1/DictionariesApiSection";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";


export class Dictionary {

    _title?: string | null = null;
    _description?: string | null;
    _sysOnly?: boolean | null;
    _obsolete?: boolean | null;

    _items: { [code: string]: IDictItemValueView } | null = null;
    _lastUpdate?: Date;
    _ttl: number= 60*60*1000; //1 час

    constructor(protected _apiClient: MoApiClient, public id: string) { }



    async _loadItems() {
        debugger;
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        this._items = await DictionariesApiSection.GetDictionaryItems(this.id);
    }




    async _chkData() {
        if (!this._items || !this._lastUpdate || (<any>(new Date())) - <any>this._lastUpdate >= this._ttl) {
            await this._loadItems();
            this._lastUpdate=new Date();
        }
    }


    
    async GetItems(){
        await this._chkData();
        return this._items;
    }
}