import { injectable, inject } from "inversify";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData, type ApiRecordClass } from "./ApiRecord";
import { chkRights } from "~/lib/Utils"
import { DataEntity } from "./DataEntities/DataEntity";
import type { IFullRecordId, IFullRecordIdT } from "../ApiInterfaces";
import { Exception } from "~/lib/Exceptions";


@injectable()
export class RecordsStore {

    protected _store: { [typename: string]: { [key: string]: ApiRecord<any> } } = {};

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }

    get<T extends ApiRecord>(type: Class<T>, Key: string) {
        if (!this._store[type.name])
            this._store[type.name] = {};

        if (!this._store[type.name][Key]) {
            this._store[type.name][Key] = new type(this._MoApiClient, this._UserContext, this, Key);
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


    async getRecordsM(recIds: { id: IFullRecordIdT<ApiRecord>, optional?: boolean, fillFunc?: (data: ApiRecordChData) => void }[]) {
        let ids: IFullRecordId[] = recIds.map(item => <any>{ key: item.id.key, code: (<any>item.id.type).RecCode })
        const data = await this._MoApiClient.getRecordsApiSection().getRecs(ids);

        let recs: ApiRecord[] = [];

        for (let i = 0; i < recIds.length; i++) {
            let recid = recIds[i];
            let jsondata = data[i];
            let rec = this.get<ApiRecord>(recid.id.type, recid.id.key);

            if (!jsondata) {
                if (!recid.optional)
                    Exception.throw("RecNotFound", `Запись ${recid.id.key}  не загружена. Возможно запись с указанным ключем отсутсвует или нет прав на чтение`);
                else {
                    rec.createAllData();
                    if (recid.fillFunc)
                        recid.fillFunc(rec.Data!);
                }
            }
            else
                await rec.loadAllDataFromJson(jsondata);

            recs.push(rec);
        }

        return recs
    }


    async createNew<T extends ApiRecord, Tdata>(type: Class<T>, fillFunc: (data: Tdata) => void) {
        const rec = new type(this._MoApiClient, this._UserContext, this);
        rec.createAllData();
        fillFunc(<Tdata>rec.MData);
        return <T>rec;
    }


    async tryCreateNew<T extends ApiRecord, Tdata>(type: Class<T>, fillFunc: (data: Tdata) => void) {
        try {
            await this.createNew(type, fillFunc);
        }
        catch { };
        return null;
    }


    async getOrCreate<T extends ApiRecord, Tdata>(type: Class<T>, Key: string, fillFunc?: (data: Tdata) => void) {
        let rec = this.get<T>(type, Key);
        var loaded = await rec.tryLoadAllData();
        if (!loaded) {
            rec.createAllData();
            if (fillFunc)
                fillFunc(<Tdata>rec.Data);
        }
        return rec;
    }


    clearAll() {
        this._store = {};
    }


    canRecRead(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.rightToken] = "r";
        return chkRights(null, traits);
    }


    canRecWrite(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.rightToken] = "w";
        return chkRights(null, traits);
    }


    canRecCreate(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.rightToken] = "c";
        return chkRights(null, traits);
    }


    canRecDelete(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.rightToken] = "d";
        return chkRights(null, traits);
    }



    canRecSpecial(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.rightToken] = "s";
        return chkRights(null, traits);
    }



    dataEntityFactory<T extends DataEntity>(dEntity: Class<T>, id: string | null = null, jsonObj: any = null) {
        let inst = new dEntity(this._MoApiClient, this._UserContext, this, id);
        inst.init(id, jsonObj);
        return inst;
    }
}