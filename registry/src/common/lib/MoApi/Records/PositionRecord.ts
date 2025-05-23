import { injectable, inject } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { EDictionaries } from "~/src/common/lib/Dicts/DictionaryStore";
import { EmployeeRecord } from "./EmployeeRecord";
import { makeFioStr, makeInitialsStr } from "~/src/common/lib/Utils";


@injectable()
export class PositionRecordData extends ApiRecordChData {
    employee?: string | null = null;
    position: number = 0;
    profession: number = 0;
    specialty: number = 0;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}


@injectable()

export class PositionRecord extends ApiRecord<PositionRecordData> {

    static override RightToken = "dbPosition";
    static override RecCode = 1017;
    static override BatchGetRecDataPath = "/Positions/GetPositions";


    constructor(
        @inject("MoApiClient") _MoApiClient: MoApiClient,
        @inject("UserContext") _UserContext: UserContext,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) {
        super(_MoApiClient, _UserContext);
    }


    get RecCode() { return PositionRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(PositionRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Positions/GetPositions";


    protected _getApiRecordPathAdd = () => "/Positions/AddPosition";


    protected _getApiRecordPathUpdate = () => "/Positions/UpdatePosition";


    protected _getApiRecordPathDelete = () => "/Positions/DeletePosition";



    async getPositionTitle() {
        let dictposs = this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.CompanyPositions);
        return await dictposs.getValByCode(this.Data!.position);
    }



    async getEmployeeFIO() {
        if (!this.Data!.employee)
            return null;
        const emplrec = await this._RecordsStore.fetch(EmployeeRecord, this.Data!.employee);
        return emplrec.getEmployeeFIO();
    }


    async getEmployeeInitials() {
        if (!this.Data!.employee)
            return null;
        const emplrec = await this._RecordsStore.fetch(EmployeeRecord, this.Data!.employee);
        return emplrec.getEmployeeInitials();
    }


    async getTitleText() {
        const recEmpl = this.Data!.employee ? await this._RecordsStore.fetch(EmployeeRecord, this.Data!.employee) : null;
        const dictposs = await this.getPositionTitle();
        if (recEmpl)
            return  `${makeInitialsStr(recEmpl.Data!.surname, recEmpl.Data!.name, recEmpl.Data!.patronymic)} ${dictposs}`
        else
           return dictposs;
    }

}