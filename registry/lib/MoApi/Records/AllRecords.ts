import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordCompanyData } from "./ApiRecord";

export interface IAllRecordData extends IApiRecordCompanyData {
       name:string;
        code: number;
        description: string
}

export class AllRecord extends ApiRecord<IAllRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, AllRecord, Key);
    }

    protected _createNewAllData(): void {
        this._ModifiedData = new Proxy({
            id: this.Key,
            name: '',
            code: 0,
            description: ''
        }, this._getModifingProxyHanlders());
    }

    protected async _loadAData() {
        const arr = await this._MoApiClient.send<string[], IAllRecordData>(this._getApiRecordPathGet(), [this._Key], true);
        this._Data = new Proxy(arr,this._getProxyHanlders());
        return this._Data;
    }


    protected _getApiRecordPathGet = () => "/Records/GetRecordsList";


    protected _getApiRecordPathAdd  () { throw  "Функция не реализована"; return ""};


    protected _getApiRecordPathUpdate  () { throw  "Функция не реализована"; return ""};


    protected _getApiRecordPathDelete () { throw  "Функция не реализована"; return ""}
}