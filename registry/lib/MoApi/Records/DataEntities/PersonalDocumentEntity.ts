import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "../../MoApiClient";
import { EDictionaries } from "../../../Dicts/DictionaryStore";
import { DataEntity } from "./DataEntity";
import { Dictionary } from "~/lib/Dicts/Dictionary";
import { injectable, inject } from "inversify";
import type { RecordsStore } from "../RecordsStore";

@injectable()
export default class PersonalDocumentEntity extends DataEntity {

    typeCode?: number | null = 1;          //dict PersonalDocumentTypes
    type?: string | null = null;

    serial?: string | null = null;
    number?: string | null = null;
    when?: string | null | undefined = null;
    who?: string | null | undefined = null;
    whoCode?: string | null | undefined = null;
    regionCode?: number | null;     //dict REGIONS
    comment?: string | null | undefined = null;




    constructor(
        @inject("MoApiClient") protected __MoApiClient: MoApiClient,
        @inject("RecordsStore") RecordStore: RecordsStore,) {
        super(RecordStore);
        Object.defineProperty(this, "__MoApiClient", { enumerable: false });
    }



    async setType(code: string | number | null) {
        if (typeof code == "number") {
            var dict = await this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.PersonalDocumentTypes);
            await dict.getValByCode(code);
            this.typeCode = code;
            this.type = null;
        }
        else {
            this.typeCode = null;
            this.type = code;
        }
    }


    async getTypeTitle() {
        if (this.type)
            return this.type;

        var dict = await this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.PersonalDocumentTypes);
        return await dict.getValByCode(this.typeCode!);
    }


    getTypeCode() {
        return this.typeCode;
    }


    getType() {
        return this.typeCode ? this.typeCode : this.type;
    }



    setSerial(val: string | null | undefined) {
        this.serial = val;
    }


    getSerial() {
        return this.serial;
    }



    setNumber(val: string | null | undefined) {
        this.number = val;
    }


    getNumber() {
        return this.number;
    }


    getWho(): string | null | undefined {
        return this.who;
    }

    setWho(value: string | null | undefined) {
        this.who = value;
    }



    getWhoCode(): string | null | undefined {
        return this.whoCode;
    }

    setWhoCode(value: string | null | undefined) {
        this.whoCode = value;
    }



    setWhen(value: string | null | undefined) {
        this.when = value;
    }

    getWhen(): string | null | undefined {
        return this.when;
    }



    async setRegionCode(val: number | null | undefined) {
        this.regionCode = val;
    }


    getRegionCode() {
        return this.regionCode;
    }



    getComment() {
        return this.comment;
    }
    setComment(value: string | null | undefined) {
        this.comment = value;
    }




    async getAvailableIdentityDocumentTypes() {
        var dicts = this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.PersonalDocumentTypes);
        let list = await dicts.getItems(0);
        return list;
    }

    async getAvailablePersonalDocumentTypes() {
        var dicts = this.__MoApiClient.getDictionaryStore().getDictionary(EDictionaries.PersonalDocumentTypes);
        let list = Object.assign((await dicts.getItems(1 * Dictionary.DICT_SECTION_K))!, await dicts.getItems(Dictionary.DICT_USER_SECTION));
        return list;
    }



}