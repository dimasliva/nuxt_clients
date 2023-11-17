import type { UserContext } from "../../../UserContext";
import type { MoApiClient } from "../../MoApiClient";
import type { RecordsStore } from "../RecordsStore";


export abstract class DataEntity {


    constructor(__MoApiClient: MoApiClient, __UserContext: UserContext, protected __RecordStore: RecordsStore) {
        Object.defineProperty(this, "__RecordStore", { enumerable: false });
    };

    init(id: string | null, jsonObj: any | null) {
        if (jsonObj)
            this.fromJsonObj(jsonObj);
    }


    getJsonObj() {
        let obj: any = {}
        for (let item in this)
            if (!item.startsWith("__") && typeof item != "function") {
                let val = this[item];
                if (val instanceof DataEntity)
                    obj[item] = val.getJsonObj();
                else
                    if (val instanceof Array) {
                        obj[item] = val.map(item => item.getJsonObj());
                    }
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
        return this.__RecordStore.dataEntityFactory((<any>this).constructor);
    }
}



export abstract class DataEntityA extends DataEntity {

    getJsonObj() {
        let obj: any = {}
        for (let item in this)
            if (item.charAt(0) == '_' && !item.startsWith("__") && typeof item != "function") {
                let val = this[item];
                let propName = item.substring(1);
                if (val instanceof DataEntity)
                    obj[propName] = val.getJsonObj();
                else
                    if (val instanceof Array) {
                        obj[propName] = val.map(item => item.getJsonObj());
                    }
                    else
                        obj[propName] = this[item];
            }
        return obj;
    }


    fromJsonObj(jsonObj: any) {
        for (let item in jsonObj) {
            let propName = "_" + item;
            if (typeof jsonObj[item] != "object")
                this[propName] = jsonObj[item];
            else
                this[propName] = null;
        }
    }

}

