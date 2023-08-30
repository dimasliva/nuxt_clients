import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordCompanyData } from "./ApiRecord";

export interface IAllRecordData extends IApiRecordCompanyData {
       name:string;
        code: number;
        description: string
}

export class AllRecords extends ApiRecord<IAllRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, AllRecords, Key);
    }

    protected _createNewData() {
        return{
            id: this.Key,
            name: '',
            code: 0,
            description: ''
        }
    }

    protected async _loadData() {
        const arr = await this._MoApiClient.send<string[], IAllRecordData>(this._getApiRecordPathGet(), [this._Key], true);
        this._Data = new Proxy(arr,this._getProxyHanlders());
        return this._Data;
    }


    protected _getApiRecordPathGet = () => "/Records/GetRecordsList";


    protected _getApiRecordPathAdd  () { throw  "Функция не реализована"; return ""};


    protected _getApiRecordPathUpdate  () { throw  "Функция не реализована"; return ""};


    protected _getApiRecordPathDelete () { throw  "Функция не реализована"; return ""}
}