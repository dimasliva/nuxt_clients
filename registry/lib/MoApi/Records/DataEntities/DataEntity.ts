import { DictionaryStore } from "../../../Dicts/DictionaryStore";


export abstract class DataEntity {
    constructor(protected _dictionaryStore: DictionaryStore) {
    }
}