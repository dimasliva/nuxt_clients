import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";



export class ClientDocumentsRecordData extends ApiRecordChData {
    snils?: string | null = null;
    mainDocument?: number | null = null;
    mainDocumentSeries?: string | null = null;
    mainDocumentNumber?: string | null = null;
    mainDocumentWhen?: string | null = null;
    mainDocumentWho?: string | null = null;
    mainDocumentWhoCode?: string | null = null;
    omsType?: number | null = null;
    omsSeries?: string | null = null;
    omsNumber?: string | null = null;
    omsRegionCode?: number | null = null;
    omsInsuranceCompany?: string | null = null;
    dmsSeries?: string | null = null;
    dmsNumber?: string | null = null;
    dmsInsuranceCompany?: string | null = null;
    otherDocuments?: any | null = null;
    advData?: any | null = null;
}


export class ClientDocumentsRecord extends ApiRecord<ClientDocumentsRecordData>{

    static RightToken = "dbClientDocuments";
    static RecCode = 1012;

    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, ClientDocumentsRecord, Key);
    }


    get RecCode() { return ClientDocumentsRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(ClientDocumentsRecordData, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientDocuments";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientDocuments";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientDocuments";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}