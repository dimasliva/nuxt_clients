import { injectable, inject } from "inversify";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord } from "./ApiRecord";


@injectable()
export class RecordsStore {

    protected _store: { [typename: string]: { [key: string]: ApiRecord<any> } } = {};

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }

    get<T extends ApiRecord>(type: Class<T>, Key: string) {
        if (!this._store[type.name])
            this._store[type.name] = {};

        if (!this._store[type.name][Key]) {
            this._store[type.name][Key] = new type(this._MoApiClient, this._UserContext, Key);
        }

        return <T>this._store[type.name][Key];
    }


    async fetch<T extends ApiRecord>(type: Class<T>, Key: string) {
        const rec = this.get<ApiRecord>(type, Key);
        await rec.loadAllData();
        return <T>rec;
    }


    async tryFetch<T extends ApiRecord>(type: Class<T>, Key: string) {
        try {
            const rec = this.get<ApiRecord>(type, Key);
            await rec.loadAllData();
            return <T>rec;
        }
        catch { };
        return null;
    }


    async createNew<T extends ApiRecord, Tdata>(type: Class<T>, fillFunc: (data: Tdata) => void) {
        const rec = new type(this._MoApiClient, this._UserContext);
        rec.createAllData();
        fillFunc(<Tdata>rec.Data);
        rec.save();

        if (!this._store[type.name])
            this._store[type.name] = {};
        this._store[type.name][rec.Key] = rec;
        return <T>rec;
    }


    async tryCreateNew<T extends ApiRecord, Tdata>(type: Class<T>, fillFunc: (data: Tdata) => void) {
        try {
            this.createNew(type, fillFunc);
        }
        catch { };
        return null;
    }

}