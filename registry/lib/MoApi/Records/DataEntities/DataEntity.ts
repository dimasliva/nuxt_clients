import type { UserContext } from "../../../UserContext";
import type { MoApiClient } from "../../MoApiClient";
import type { RecordsStore } from "../RecordsStore";


export abstract class DataEntity {


    constructor(_MoApiClient: MoApiClient, _UserContext: UserContext, protected _RecordStore: RecordsStore) { };

    init(id: string | null, jsonObj: any | null) {
        if (jsonObj)
            this.fromJsonObj(jsonObj);
    }


    getJsonObj() {
        let obj: any = {}
        for (let item in this)
            if (!item.startsWith("_") && typeof item != "function") {
                let val = this[item];
                if (val instanceof DataEntity)
                    obj[item] = val.getJsonObj();
                else
                    obj[item] = this[item];

            }
        return obj;
    }



    toJson() {
        return JSON.stringify(this.getJsonObj()); //JSON.stringify(this, (key, value) => key.startsWith("_") ? undefined : value);
    }



    fromJson(json: string) {
        this.fromJsonObj(JSON.parse(json));
    }



    fromJsonObj(jsonObj: any) {
        for (let item in jsonObj) {
            //если значение в источнике объект, то его не копируем т.к. его тип не известен. Создание и копирование объектов должно производится в производных классах
            if (typeof jsonObj[item] != "object")
                this[item] = jsonObj[item];
            else
                this[item] = null;
        }
    }



    equal(other?: DataEntity) {
        return this.toJson() == other?.toJson();
    }



    clone() {
        let newInst = this._getSelfNewInst();
        newInst.fromJson(this.toJson());
        return newInst;
    }



    protected _getSelfNewInst() {
        return this._RecordStore.dataEntityFactory((<any>this).constructor);
    }
}

