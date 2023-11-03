
import { EDictionaries } from "../../../Dicts/DictionaryStore";
import { DataEntity } from "./DataEntity";

export default class AddressEntity extends DataEntity {

     private _country: number = 185;          //dict Countries
    public get country(): number {
        return this._country;
    }
    public set country(value: number) {
        this._country = value;
    }
    /**Республика,область,край */
    region?: string | null;         //dict REGIONS
    regionCode?: number | null;     //dict REGIONS
    /*Муниципальный Район,Округ */
    district?: string | null;
    /**Населенный пункт*/
    settlement?: string | null;
    /**Тип населенный пункта*/
    settlementType?: number | null; //dict SettlementTypes
    /**Улица*/
    street?: string | null;
    /**Дом*/
    building?: string | null;
    /**Корпус*/
    corp?: string | null;
    /**Квартира*/
    flat?: string | null;
    /**Индекс*/
    zip?: string | null;



    async setCountry(code: number) {
        var regDict = await this._dictionaryStore.getDictionary(EDictionaries.Countries);
        await regDict.getValByCode(code);//проверка наличия значения
        this.country = code;
    }


     getCountry() {
        return this.country;
    }



    async setRegion(code: number) {
        var regDict = await this._dictionaryStore.getDictionary(EDictionaries.Regions);
        var val = await regDict.getValByCode(code);
        this.regionCode = code;
        this.region = val;
    }



    async setSettlement(code: number) {
        var regDict = await this._dictionaryStore.getDictionary(EDictionaries.SettlementTypes);
        var val = await regDict.getValByCode(code);
        this.settlement = val;
        this.settlementType = code;
    }


    clone() {
        let res = new AddressEntity(this._dictionaryStore);
        Object.assign(res, this);
        return res;
    }
}