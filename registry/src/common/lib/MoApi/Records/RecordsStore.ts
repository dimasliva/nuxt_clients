import { injectable, inject, Container } from "inversify";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData, type ApiRecordClass } from "./ApiRecord";
import { chkRights } from "../../Utils"
import { DataEntity } from "./DataEntities/DataEntity";
import type { IFullRecordId, IFullRecordIdT } from "../ApiInterfaces";
import { Exception } from "../../Exceptions";


export const enum ERecLockArg {
    None,
    Try,
    Need
}


@injectable()
export class RecordsStore {

    protected _store: { [typename: string]: { [key: string]: ApiRecord<any> } } = {};

    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("UserContext") protected _UserContext: UserContext,
        @inject("diC") protected _diC: Container) {
    }



    /**Поиск записей одного типа. */
    async findRecords(type: ApiRecordClass, where: string | null) {

        const apiPath = (<any>type).RecordsFindPath;
        if (!apiPath)
            Exception.throw("PathNotFound", `Отсутствует путь api поиска записей. Тип: ${type.name}`);

        if (!this.canRecRead(type))
            Exception.throw("AccessDenied", `Отсутствуют права. Тип: ${type.name}`);

        return await this._MoApiClient.send<string | null, string[]>(apiPath, where, false);
    }


    /**Получение записи без загрузки данных */
    get<T extends ApiRecord>(type: Class<T>, Key: string) {
        if (!this._store[type.name])
            this._store[type.name] = {};

        const rec = this._store[type.name][Key];

        if (!rec) {
            var newrec = this._diC.get(type);
            newrec.init(this, type, Key);
            this._store[type.name][Key] = newrec;
        }

        return <T>this._store[type.name][Key];
    }



    /**Получение записи с загрузкой основных данных. Если данные не удалось загрузить - исключение */
    async fetch<T extends ApiRecord>(type: Class<T>, Key: string, lockRecord = ERecLockArg.None, forceUpdate = false) {
        const rec = this.get<ApiRecord>(type, Key);
        const isLockedOld = rec.isLocked;

        if (lockRecord != ERecLockArg.None) {
            if (! await rec.lock() && lockRecord == ERecLockArg.Need)
                Exception.throw("RecNotLocked", `Не удалось получить блокировку записи`);
        }
        if (!rec.Data || rec.IsInvalid || isLockedOld != rec.isLocked || forceUpdate) {
            await rec.loadAllData();
        }
        return <T>rec;
    }


    //не проверено
    /**Получение записи если она присутствует и загружена в кэше */
    tryFetchFromCache<T extends ApiRecord>(type: Class<T>, Key: string) {
        const rec = <T>this._store[type.name]?.[Key];
        if (rec?.Data && !rec.IsInvalid)
            return rec;

        return null;
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


    /**Пакетная загрузка записей разных типов. Используется для небольших массивов */
    async getRecordsM(recIds: { id: IFullRecordIdT<ApiRecord>, optional?: boolean | null, fillFunc?: ((data: ApiRecordChData) => void) | null }[], forceUpdate?: boolean) {
        let ids: IFullRecordId[] = recIds.map(item => <any>{ key: item.id.key, code: (<any>item.id.type).RecCode })

        let recs: ApiRecord[] = [];
        let idsForLoad: IFullRecordId[] = [];
        let inx = 0;

        if (!forceUpdate) {

            for (let i = 0; i < ids.length; i++) {
                const ido = recIds[i];
                const store = this._store[ido.id.type.name] || (this._store[ido.id.type.name] = {});
                const rec = store[ido.id.key];

                if (rec)
                    recs.push(rec);
                else {
                    recs.push(<any>inx++);
                    idsForLoad.push(ids[i]);
                }
            }
        }
        else {
            recs = <any>ids.map((v, i) => i);
            idsForLoad = ids;
        }


        const data = await this._MoApiClient.getRecordsApiSection().getRecs(idsForLoad);

        for (let i = 0; i < recIds.length; i++) {
            let recval = recs[i];
            if (typeof recval == "number") {
                let recid = recIds[i];
                let jsondata = data[recval];
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
                    rec.loadAllDataFromJson(jsondata);

                recs[i] = rec;
                const store = this._store[recid.id.type.name] || (this._store[recid.id.type.name] = {});
                store[rec.Key] = rec;
            }
        }

        return recs;
    }


    /**Пакетная загрузка записей одного типа. Используется для небольших массивов */
    async getRecords<T extends ApiRecord>(type: Class<T>, recIds: string[], optional?: boolean | null, fillFunc?: ((data: ApiRecordChData) => void) | null, forceUpdate?: boolean) {

        const apiPath = (<any>type).BatchGetRecDataPath;
        if (!apiPath)
            Exception.throw("PathNotFound", `Отсутствует путь api для загрузки записей. Тип: ${type.name}`);


        const recs: T[] = [];
        let idsForLoad: string[] = [];
        const store = this._store[type.name] || (this._store[type.name] = {});

        if (!forceUpdate) {
            for (let i = 0; i < recIds.length; i++) {
                const rec = <T>store[recIds[i]];
                if (rec)
                    recs.push(rec);
                else
                    idsForLoad.push(recIds[i]);
            }
        }
        else
            idsForLoad = recIds;

        const data: any[] = await this._MoApiClient.send(apiPath, idsForLoad, false);

        for (let i = 0; i < idsForLoad.length; i++) {
            const key = idsForLoad[i];
            let jsondata = data.find(item => item.id == key);
            let rec = <T>this.get(type, key);

            if (!jsondata) {
                if (!optional)
                    Exception.throw("RecNotFound", `Запись ${key}  не загружена. Возможно запись с указанным ключем отсутсвует или нет прав на чтение`);
                else {
                    rec.createAllData();
                    if (fillFunc)
                        fillFunc(rec.Data!);
                }
            }
            else
                rec.loadAllDataFromJson(jsondata);

            recs.push(rec);
            store[rec.Key] = rec;
        }

        return recs;
    }



    async createNew<T extends ApiRecord, Tdata>(type: Class<T>, fillFunc: (data: Tdata) => void) {
        const rec = this._diC.get(type);
        rec.init(this, type);
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
        traits[type.RightToken] = "r";
        return chkRights(null, traits);
    }


    canRecWrite(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.RightToken] = "w";
        return chkRights(null, traits);
    }


    canRecCreate(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.RightToken] = "c";
        return chkRights(null, traits);
    }


    canRecDelete(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.RightToken] = "d";
        return chkRights(null, traits);
    }



    canRecSpecial(type: ApiRecordClass) {
        let traits: any = {}
        traits[type.RightToken] = "s";
        return chkRights(null, traits);
    }



    dataEntityFactory<T extends DataEntity>(dEntity: Class<T>, jsonObj: any = null, ...params) {
        let inst = this._diC.get(dEntity);
        inst.init(jsonObj, ...params);
        return <T>inst;
    }


    //не проверено
    invalidateRecs(frids: IFullRecordIdT<Class>[]) {
        frids.forEach(v => {
            if (this._store[v.type.name]?.[v.key]) {
                const rec = this._store[v.type.name]?.[v.key];
                rec.IsInvalid = true;
                delete this._store[v.type.name][v.key];
            }
        });
    }

}