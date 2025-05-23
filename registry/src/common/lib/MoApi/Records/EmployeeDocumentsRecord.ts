import { RUSSIAN_PASSPORT } from "~/src/common/lib/Dicts/DictPersonalDocumentsConst";
import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient  } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { injectable } from "inversify";


@injectable()
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


@injectable()

export class EmployeeDocumentsRecord extends ApiRecord<EmployeeDocumentsRecordData>{

    static override RightToken = "dbEmployeeDocuments";
    static override RecCode = 1005;
    static override BatchGetRecDataPath="/Employees/GetEmployeeDocuments";


    get RecCode() { return EmployeeDocumentsRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(EmployeeDocumentsRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Employees/GetEmployeeDocuments";


    protected _getApiRecordPathAdd = () => "/Employees/SetEmployeeDocuments";


    protected _getApiRecordPathUpdate = () => "/Employees/SetEmployeeDocuments";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}