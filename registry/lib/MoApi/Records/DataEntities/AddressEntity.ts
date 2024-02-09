
import { UserContext } from "~/lib/UserContext";
import { EDictionaries } from "../../../Dicts/DictionaryStore";
import { MoApiClient } from "../../MoApiClient";
import { DataEntity } from "./DataEntity";
import { RUSSIA } from "~/lib/Dicts/DictCountriesConst";
import { injectable, inject } from "inversify";
import type { RecordsStore } from "../RecordsStore";


@injectable()
export default class AddressEntity extends DataEntity {

    country: number = RUSSIA;          //dict Countries
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


    constructor(
        @inject("MoApiClient") protected __MoApiClient: MoApiClient,
        @inject("RecordsStore") RecordStore: RecordsStore,
    ) {
        super(RecordStore);
        Object.defineProperty(this, "__MoApiClient", { enumerable: false });
    }


    async setCountry(code: number) {
        var regDict = await this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.Countries);
        await regDict.getValByCode(code);//проверка наличия значения
        this.country = code;
    }


    getCountry() {
        return this.country;
    }



    async setRegion(code: string | number | null) {
        if (typeof code == "number") {
            var regDict = await this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.Regions);
            var val = await regDict.getValByCode(code);
            this.regionCode = code;
            this.region = null;
        }
        else {
            this.regionCode = null;
            this.region = code;
        }
    }



    async getRegionTitle() {
        if (this.region)
            return this.region;

        var regDict = await this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.Regions);
        return await regDict.getValByCode(this.regionCode!);
    }


    getRegionCode() {
        return this.regionCode;
    }


    getRegion() {
        return this.regionCode ? this.regionCode : this.region;
    }



    async setSettlementType(code: number | null) {
        if (code) {
            var regDict = await this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.SettlementTypes);
            var val = await regDict.getValByCode(code);
        }
        this.settlementType = code;
    }


    getSettlementType() {
        return this.settlementType;
    }


    async setSettlement(name: string | null) {
        this.settlement = name;
    }


    getSettlement() {
        return this.settlement;
    }


    async getAvailableSettlementTypes() {
        var countriesDicts = this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.SettlementTypes);
        return await countriesDicts.getItems(0);
    }


    async getAvailableCountries() {
        var countriesDicts = this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.Countries);
        return await countriesDicts.getItems(0);
    }



    async getAvailableRegions() {
        var countriesDicts = this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.Regions);
        return await countriesDicts.getItems(0);
    }


    getDistrict() {
        return this.district;
    }


    async setDistrict(val: string) {
        this.district = val;
    }


    async setStreet(val: string | null) {
        this.street = val;
    }

    getStreet() {
        return this.street;
    }


    async setBuilding(val: string | null) {
        this.building = val;
    }

    getBuilding() {
        return this.building;
    }


    async setCorp(val: string | null) {
        this.corp = val;
    }

    getCorp() {
        return this.corp;
    }


    async setFlat(val: string | null) {
        this.flat = val;
    }

    getFlat() {
        return this.flat;
    }


    async setZip(val: string | null) {
        this.zip = val;
    }

    getZip() {
        return this.zip;
    }


    reset() {
        this.country = RUSSIA;
        this.region = null;
        this.regionCode = null;
        this.district = null;
        this.settlement = null;
        this.settlementType = null;
        this.street = null;
        this.building = null;
        this.corp = null;
        this.flat = null;
        this.zip = null;
    }
}