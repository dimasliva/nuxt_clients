import { Exception } from "../../Exceptions";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IClientDocumentsRecordData extends IApiRecordChData {
    snils?: string | null;
    mainDocument?: number | null;
    mainDocumentSeries?: string | null;
    mainDocumentNumber?: string | null;
    mainDocumentWhen?: string | null;
    mainDocumentWho?: string | null;
    mainDocumentWhoCode?: string | null;
    omsType?: number | null;
    omsSeries?: string | null;
    omsNumber?: string | null;
    omsRegionCode?: number | null;
    omsInsuranceCompany?: string | null;
    dmsSeries?: string | null;
    dmsNumber?: string | null;
    dmsInsuranceCompany?: string | null;
    otherDocuments?: any | null;
    advData?: any | null;
}


export class ClientDocumentsRecord extends ApiRecord<IClientDocumentsRecordData>{

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, ClientDocumentsRecord, Key);
    }


    protected _createNewAllData(): void {
        this._ModifiedData = new Proxy({
            id: this.Key,
            snils: null,
            mainDocument: null,
            mainDocumentSeries: null,
            mainDocumentNumber: null,
            mainDocumentWhen: null,
            mainDocumentWho: null,
            mainDocumentWhoCode: null,
            omsType: null,
            omsSeries: null,
            omsNumber: null,
            omsRegionCode: null,
            omsInsuranceCompany: null,
            dmsSeries: null,
            dmsNumber: null,
            dmsInsuranceCompany: null,
            otherDocuments: null,
            advData: null
        }, this._getModifingProxyHanlders());
    }


    protected _getApiRecordPathGet = () => "/Clients/GetClientDocuments";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientDocuments";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientDocuments";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}