
import type { IDictItemValueView } from "~/lib/MoApi/ApiSectionsV1/DictionariesApiSection";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import type { EventBus } from "../EventBus";


interface IDictIdArg {
    dictKey: string;
    section: number;
    foreignSysKey: string;
}



export class Dictionary {

    static readonly DICT_SECTION_MASK = 0x7FF00000;

    _title?: string | null = null;
    _description?: string | null;
    _sysOnly?: boolean | null;
    _obsolete?: boolean | null;

    _items: { [sections: string]: { [code: string]: IDictItemValueView | undefined } } | null = null;
    _foreignItems: { [sections: string]: { [foreignCode: string]: { [code: string]: IDictItemValueView | undefined } } } | null = null;
    _lastUpdate?: Date;
    _ttl: number = 60 * 60 * 1000; //1 час

    constructor(public id: string, protected _apiClient: MoApiClient, protected _sysEventBus: EventBus) {}


    async onDictСontentChanged(dictArg: IDictIdArg) {
        if (this.id == dictArg.dictKey) {
            if (dictArg.foreignSysKey) {
                if (this._foreignItems && this._foreignItems[dictArg.section])
                    this._foreignItems[dictArg.section][dictArg.foreignSysKey] = {};
            }
            else
                if (this._items)
                    delete this._items[dictArg.section];
            console.debug(`Dictionary: Reset Dict ${this.id} foreign: ${dictArg.foreignSysKey} section ${dictArg.section}`);
        }
    }



    async _loadItems(section: number | string) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        if (!this._items)
            this._items = {};
        this._items[section] = await DictionariesApiSection.GetDictionaryItems({ dictKey: this.id, section: parseInt(<any>section, 10) });
    }



    async _loadForeignItems(section: number | string, fSys: string) {
        debugger;
        if (!this._foreignItems)
            this._foreignItems = {};

        if (!this._foreignItems[section])
            this._foreignItems[section] = {};

        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        this._foreignItems[section][fSys] = await DictionariesApiSection.GetForeignDictionaryItems({ dictKey: this.id, section: parseInt(<any>section, 10), foreignSystem: fSys });
    }



    async _chkData(section: number | string) {
        if (!this._items || !this._items[section] || !this._lastUpdate || (<any>(new Date())) - <any>this._lastUpdate >= this._ttl) {
            await this._loadItems(section);
            this._lastUpdate = new Date();
        }
    }



    async _chkFData(section: number | string, fSys: string) {
        if (!this._foreignItems || !this._foreignItems[section] || !this._foreignItems[section][fSys] || !this._lastUpdate || (<any>(new Date())) - <any>this._lastUpdate >= this._ttl) {
            await this._loadForeignItems(section, fSys);
        }
    }



    async GetItems(section: number | string,) {
        await this._chkData(section);
        return this._items?.[section];
    }



    async GetFItems(section: number | string, fSys: string) {
        await this._chkFData(section, fSys);
        return this._foreignItems!.section.fSys;
    }



    async GetItemByCode(code: string | number) {
        const items = await this.GetItems(parseInt(<any>code, 10) & Dictionary.DICT_SECTION_MASK);
        return items?.[code];
    }



    async GetValByCode(code: string | number) {
        return (await this.GetItemByCode(code))?.value;
    }


    /*
        async GetCodesByVal(section: number | string,val: any) {
            const items = await this.GetItems();
            const res: number[] = [];
            for (let item in items)
                if (items[item]!.value == val)
                    res.push(parseInt(item, 10));
            return res;
        }
    */

    async GetFValByCode(foreignSys: string, code: string | number) {
        const items = await this.GetFItems(parseInt(<any>code, 10) & Dictionary.DICT_SECTION_MASK, foreignSys);
        return items?.code;
    }


    /*
        async GetFCodesByVal(foreignSys: string, val: any) {
            const items = await this.GetFItems(foreignSys);
            const res: number[] = [];
            for (let item in items)
                if (items[item]!.value == val)
                    res.push(parseInt(item, 10));
            return res;
        }
    */


    async SetItem(code: string | number, val: IDictItemValueView) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        await DictionariesApiSection.AddOrUpdateDictionaryItem({ dictKey: this.id, code: parseInt(<any>code, 10), item: val });
    }



    async SetFItem(foreignSystem: string, code: string | number, val: IDictItemValueView) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        await DictionariesApiSection.AddOrUpdateForeignDictionaryItem({ dictKey: this.id, code: parseInt(<any>code, 10), foreignSystem, item: val });
    }



    async DelItem(code: string | number) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        await DictionariesApiSection.DeleteDictionaryItem({ dictKey: this.id, code: parseInt(<any>code, 10) });
    }



    async DelFItem(foreignSystem: string, code: string | number) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        await DictionariesApiSection.DeleteForeignDictionaryItem({ dictKey: this.id, code: parseInt(<any>code, 10), foreignSystem });
    }


}