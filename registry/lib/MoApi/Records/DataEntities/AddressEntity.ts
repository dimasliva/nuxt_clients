
import  { UserContext } from "~/lib/UserContext";
import { EDictionaries } from "../../../Dicts/DictionaryStore";
import  { MoApiClient } from "../../MoApiClient";
import { DataEntity } from "./DataEntity";
import  { RecordsStore } from "../RecordsStore";

export default class AddressEntity extends DataEntity {

    country: number = 185;          //dict Countries
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


    constructor(protected _MoApiClient: MoApiClient, _UserContext: UserContext, _RecordStore: RecordsStore) {
        super(_MoApiClient, _UserContext, _RecordStore);
    }


    async setCountry(code: number) {
        var regDict = await this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.Countries);
        await regDict.getValByCode(code);//проверка наличия значения
        this.country = code;
    }


    getCountry() {
        return this.country;
    }



    async setRegion(code: number) {
        var regDict = await this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.Regions);
        var val = await regDict.getValByCode(code);
        this.regionCode = code;
        this.region = val;
    }



    async setSettlement(code: number) {
        var regDict = await this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.SettlementTypes);
        var val = await regDict.getValByCode(code);
        this.settlement = val;
        this.settlementType = code;
    }


    async getAvailableCountries() {
        var countriesDicts = this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.Countries);
        return await countriesDicts.getItems(0);
    }

}