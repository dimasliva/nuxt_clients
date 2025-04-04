
import type { IDictItemValueView } from "~/src/common/lib/MoApi/ApiSectionsV1/DictionariesApiSection";
import type { MoApiClient } from "~/src/common/lib/MoApi/MoApiClient";
import type { EventBus } from "../EventBus";
import { Exception } from "../Exceptions";
import { QueryDictsFFParams } from "../MoApi/RequestArgs";


interface IDictIdArg {
    dictKey: string;
    section: number;
    foreignSysKey: string;
}



export class Dictionary {

    static readonly DICT_SECTION_MASK = 0x7FF00000;
    static readonly DICT_SECTION_K= 0x00100000;
    static readonly DICT_USER_SECTION= 0x70000000;

    _title?: string | null = null;
    _description?: string | null;
    _sysOnly?: boolean | null;
    _obsolete?: boolean | null;

    _items: { [sections: string]: { [code: string]: IDictItemValueView } } | null = null;
    _foreignItems: { [sections: string]: { [foreignCode: string]: { [code: string]: IDictItemValueView | undefined } } } | null = null;
    _lastUpdate?: Date;
    _ttl: number = 60 * 60 * 1000; //1 час

    constructor(public id: string, protected _apiClient: MoApiClient, protected _sysEventBus: EventBus) { }



    static itemsToValueTitle(items: { [code: string]: IDictItemValueView }, valnum = 0) {
        let res: { value: number, title: string }[] = [];
        for (let code in items) {
            res.push({ value: parseInt(code, 10), title: valnum ? items[code].value2 : items[code].value })
        }
        return res;
    }



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



    async getItems(section: number | string) {
        await this._chkData(section);
        return this._items?.[section] || null;
    }



    async getFItems(section: number | string, fSys: string) {
        await this._chkFData(section, fSys);
        return this._foreignItems!.section.fSys;
    }



    async getItemByCode(code: string | number) {
        const items = await this.getItems(parseInt(<any>code, 10) & Dictionary.DICT_SECTION_MASK);
        return items?.[code];
    }



    async getValByCode(code: string | number, valnum: number = 0): Promise<string | undefined> {
        var item = (await this.getItemByCode(code));
        if (!item)
            Exception.throw("ValueNotFoundInDict", `Значение с кодом  ${code}  не найдено в словаре ${this.id}`);

        return valnum ? item?.value2 : item?.value;
    }



    async tryGetValByCode(code: string | number | null | undefined) {
        if(!code) 
            return undefined;
        return (await this.getItemByCode(code))?.value;
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

    async getFValByCode(foreignSys: string, code: string | number) {
        const items = await this.getFItems(parseInt(<any>code, 10) & Dictionary.DICT_SECTION_MASK, foreignSys);
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


    async setItem(code: string | number, val: IDictItemValueView) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        await DictionariesApiSection.AddOrUpdateDictionaryItem({ dictKey: this.id, code: parseInt(<any>code, 10), item: val });
    }



    async setFItem(foreignSystem: string, code: string | number, val: IDictItemValueView) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        await DictionariesApiSection.AddOrUpdateForeignDictionaryItem({ dictKey: this.id, code: parseInt(<any>code, 10), foreignSystem, item: val });
    }



    async delItem(code: string | number) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        await DictionariesApiSection.DeleteDictionaryItem({ dictKey: this.id, code: parseInt(<any>code, 10) });
    }



    async delFItem(foreignSystem: string, code: string | number) {
        const DictionariesApiSection = this._apiClient.getDictionariesApiSection();
        await DictionariesApiSection.DeleteForeignDictionaryItem({ dictKey: this.id, code: parseInt(<any>code, 10), foreignSystem });
    }



    async fsDictItemsListView(text:string, limit=20, select="code,value", includeObsolete: boolean=false, section?: number){
        return await this._apiClient.getDictionariesApiSection().FsDictItemsListView(new QueryDictsFFParams(this.id, text, select, limit, includeObsolete,section));
    }
    
    

}