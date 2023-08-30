import { Exception } from "../../Exceptions";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IClientContactsRecordData extends IApiRecordChData {
    mainPhone: string | null;
    mainEmail: string | null;
    otherContacts: any | null;
    advData: any | null;
}


export class ClientContactsRecord extends ApiRecord<IClientContactsRecordData>{

    static  rightToken= "dbClientContacts";

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, ClientContactsRecord, Key);
    }


    protected _createNewData() {
        return {
            id: this.Key,
            mainPhone: null,
            mainEmail: null,
            otherContacts: null,
            advData: null
        };
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientContacts";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientContacts";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientContacts";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented","Функция не реализована"); return "" }

}