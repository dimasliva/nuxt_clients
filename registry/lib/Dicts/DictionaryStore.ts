import { injectable, inject } from "inversify";
import { Dictionary } from "./Dictionary";
import { EventBus } from "../EventBus";
import { MoApiClient } from "../MoApi/MoApiClient";


@injectable()
export class DictionaryStore {

    protected _store: { [dictId: string]: Dictionary } = {};


    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("SysEventBus") protected _EventBus: EventBus) { }

    

    getDictionary(dictId: string) {
        return this._store[dictId] || (this._store[dictId] = new Dictionary(dictId, this._MoApiClient, this._EventBus));
    }
}
