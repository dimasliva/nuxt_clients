import type { ICouplingData, IRelData } from "../ApiInterfaces";
import type { MoApiClient } from "../MoApiClient";

const _apiPath = "/Dictionaries";

export interface ISysDicts {
    id: string;
    title: string;
    description?: string | null;
    sysOnly?: boolean | null;
    obsolete?: boolean | null;
}


export interface IDictItemValueViewBase {
    value: string;
    valueType?: string | null;
    obsolete?: boolean | null;
    user?: boolean | null;
}


export interface IDictItemValueView extends IDictItemValueViewBase {
    value2: string;
}

export interface IForeignDictItemValueView extends IDictItemValueViewBase {
}


export interface IDictId {
    dictKey: string;
    section: number;
}

export interface IDictionaryItem {
    dictKey: string;
    code: number;
    item?: IDictItemValueView;
}


export interface IForeignDictionaryItem {
    dictKey: string;
    code: number;
    foreignSystem: string;
    item?: IForeignDictItemValueView;
}


export interface IForeignDictId extends IDictId {
    foreignSystem: string;
}



export class DictionariesApiSection {


    constructor(protected _apiClient: MoApiClient) { }


    async GetDictsList() {
        return await this._apiClient.send<any, ISysDicts[]>(`${_apiPath}/GetDictsList`, null, false);
    }


    async GetDictionaryItems(dictId: IDictId) {
        return await this._apiClient.send<IDictId, { [code: string]: IDictItemValueView }>(`${_apiPath}/GetDictionaryItems`, dictId, false);
    }


    async GetForeignDictionaryItems(dictId: IForeignDictId) {
        return await this._apiClient.send<IForeignDictId, { [code: string]: IDictItemValueView }>(`${_apiPath}/GetForeignDictionaryItems`, dictId, false);
    }


    async AddOrUpdateDictionaryItem(dictItem: IDictionaryItem) {
        return await this._apiClient.send<IDictionaryItem, boolean>(`${_apiPath}/AddOrUpdateDictionaryItem`, dictItem, false);
    }


    async DeleteDictionaryItem(dictItem: IDictionaryItem) {
        return await this._apiClient.send<IDictionaryItem, boolean>(`${_apiPath}/DeleteDictionaryItem`, dictItem, false);
    }


    async AddOrUpdateForeignDictionaryItem(dictFItem: IForeignDictionaryItem) {
        return await this._apiClient.send<IForeignDictionaryItem, boolean>(`${_apiPath}/AddOrUpdateForeignDictionaryItem`, dictFItem, false);
    }


    async DeleteForeignDictionaryItem(dictFItem: IForeignDictionaryItem) {
        return await this._apiClient.send<IForeignDictionaryItem, boolean>(`${_apiPath}/DeleteForeignDictionaryItem`, dictFItem, false);
    }
}