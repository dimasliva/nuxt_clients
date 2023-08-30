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

    static  rightToken= "dbClient";

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, ClientRecord, Key);
    }


    protected _createNewData() {
        return {
            id: this.Key,
            name: '',
            surname: '',
            patronymic: null,
            gender: 'u',
            birthdate: null,
            notActive: null,
            advData: null
        }
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClients";


    protected _getApiRecordPathAdd = () => "/Clients/AddClient";


    protected _getApiRecordPathUpdate = () => "/Clients/UpdateClient";


    protected _getApiRecordPathDelete = () => "/Clients/DeleteClient";

}