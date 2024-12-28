import { injectable, inject } from "inversify";
import { Dictionary } from "./Dictionary";
import { EventBus } from "../EventBus";
import { MoApiClient } from "../MoApi/MoApiClient";


export const enum EDictionaries {
    FileTypes = "11",
    Countries = "2",
    Regions = "7",
    SettlementTypes = "18",
    PersonalDocumentTypes = "4",
    CompanyPositions = "21",
    PriceTypes="20",
    DealStatus="17"
}


@injectable()
export class DictionaryStore {

    protected _store: { [dictId: string]: Dictionary } = {};
    _unsubscribe: any;


    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("SysEventBus") protected _EventBus: EventBus) {

        this._unsubscribe = this._EventBus.subscribe("onGroupСontentChanged", (type, dictArg) => {
            if ((type == 'dictionary') && this._store[dictArg.dictKey])
                this._store[dictArg.dictKey].onDictСontentChanged(dictArg);
        });

    }



    getDictionary(dictId: string) {
        dictId = dictId.toLowerCase();
        return this._store[dictId] || (this._store[dictId] = new Dictionary(dictId, this._MoApiClient, this._EventBus));
    }



    dispose() {
        if (this._EventBus) {
            this._unsubscribe();
            this._EventBus = null!;
        }
    }
}
