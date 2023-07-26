import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IClientRecordData extends IApiRecordChData {
    name: string;
    surname: string;
    patronymic?: string | null;
    gender: string;
    birthdate?: string | null;
    notActive?: boolean | null;
    advData?: any | null;
}


export class ClientRecord extends ApiRecord<IClientRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, ClientRecord, Key);
    }


    protected _createNewAllData(): void {
        this._Data = new Proxy({
            id: this.Key,
            name: '',
            surname: '',
            patronymic: null,
            gender: '',
            birthdate: null,
            notActive: null,
            advData: null
        }, this._getProxyHanlders());
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClients";


    protected _getApiRecordPathAdd = () => "/Clients/AddClient";


    protected _getApiRecordPathUpdate = () => "/Clients/UpdateClient";


    protected _getApiRecordPathDelete = () => "/Clients/DeleteClient";

}