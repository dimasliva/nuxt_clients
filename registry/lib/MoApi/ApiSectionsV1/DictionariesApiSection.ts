import { ICouplingData, IRelData } from "../ApiInterfaces";
import type { MoApiClient } from "../MoApiClient";

const _apiPath = "/Dictionaries";

export interface ISysDicts {
    id: string;
    title: string;
    description?: string | null;
    sysOnly?: boolean | null;
    obsolete?: boolean | null;
}


export interface IDictItemValueView {
    value: string;
    valueType?: string | null;
    obsolete?: boolean | null;
    user?: boolean | null;
}


export interface IDictId {
    dictId: string;
    foreignSystem: string;
}




export class DictionariesApiSection {


    constructor(protected _apiClient: MoApiClient) { }


    async GetDictsList() {
        return await this._apiClient.send<any, ISysDicts[]>(`${_apiPath}/GetDictsList`, null, false);
    }


    async GetDictionaryItems(dictId: string) {
        return await this._apiClient.send<any, {[code:string]:IDictItemValueView}>(`${_apiPath}/GetDictionaryItems`, dictId, false);
    }


    async GetForeignDictionaryItems(dictId: string, foreignSystem: string) {
        return await this._apiClient.send<any, ISysDicts[]>(`${_apiPath}/GetForeignDictionaryItems`, { dictId, foreignSystem }, false);
    }


    async AddOrUpdateDictionaryItem(dictId: string, code: number, item: IDictItemValueView) {
        return await this._apiClient.send<any, ISysDicts[]>(`${_apiPath}/AddOrUpdateDictionaryItem`, { dictId, code, item }, false);
    }


    async DeleteDictionaryItem(dictId: string, code: number) {
        return await this._apiClient.send<any, ISysDicts[]>(`${_apiPath}/DeleteDictionaryItem`, { dictId, code }, false);
    }


    async AddOrUpdateForeignDictionaryItem(dictId: IDictId, code: number, item: IDictItemValueView) {
        return await this._apiClient.send<any, ISysDicts[]>(`${_apiPath}/AddOrUpdateForeignDictionaryItem`, { dictId, code, item }, false);
    }


    async DeleteForeignDictionaryItem(dictId: IDictId, code: number) {
        return await this._apiClient.send<any, ISysDicts[]>(`${_apiPath}/DeleteForeignDictionaryItem`, { dictId, code }, false);
    }
}