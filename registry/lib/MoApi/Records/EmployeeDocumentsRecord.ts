import { RUSSIAN_PASSPORT } from "~/lib/Dicts/DictPersonalDocumentsConst";
import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient  } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";



export class EmployeeDocumentsRecordData extends ApiRecordChData {
    snils?: string | null = null;
    mainDocument?: number | null = RUSSIAN_PASSPORT;
    mainDocumentSeries?: string | null = null;
    mainDocumentNumber?: string | null = null;
    mainDocumentWhen?: string | null = null;
    mainDocumentWho?: string | null = null;
    mainDocumentWhoCode?: string | null = null;
    advData?: any | null = null;
}


export class EmployeeDocumentsRecord extends ApiRecord<EmployeeDocumentsRecordData>{

    static RightToken = "dbEmployeeDocuments";
    static RecCode = 1005;

    constructor(protected _MoApiEmployee: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiEmployee, _UserContext, _RecStore, EmployeeDocumentsRecord, Key);
    }


    get RecCode() { return EmployeeDocumentsRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(EmployeeDocumentsRecordData, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Employees/GetEmployeeDocuments";


    protected _getApiRecordPathAdd = () => "/Employees/SetEmployeeDocuments";


    protected _getApiRecordPathUpdate = () => "/Employees/SetEmployeeDocuments";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}