import { injectable, inject } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { Exception } from "~/lib/Exceptions";
import { ECashFlowInstrumentCodes, ECashFlowSubjectTypes, ECashFlowTypes, type ECashFlowOperationTypes } from "./Finance/FinanceEnums";



@injectable()
export class CashFlowRecordData extends ApiRecordChData {
    time: string = "";
    operationType: ECashFlowOperationTypes = null!;
    purpose?: string | null | undefined;
    purposeCode: number = 0;
    organizationId: eid = null!;
    contractId?: eid | null | undefined;
    value: number = 0;
    exchangeRate?: number | null | undefined;
    extCode?: string | null | undefined;
    extPaymentSystem?: number | null | undefined;
    source?: number | null | undefined;
    sourceType?: ECashFlowSubjectTypes | null | undefined;
    flowType: ECashFlowTypes = ECashFlowTypes.Other;
    target?: eid | null | undefined;
    targetType?: ECashFlowSubjectTypes | null | undefined;
    instrumentCode: ECashFlowInstrumentCodes = ECashFlowInstrumentCodes.None;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}


@injectable()

export class CashFlowRecord extends ApiRecord<CashFlowRecordData> {

    static override RightToken = "dbCashFlow";
    static override RecCode = 1052;
    static override BatchGetRecDataPath = "";


    constructor(
        @inject("MoApiClient") _MoApiClient: MoApiClient,
        @inject("UserContext") _UserContext: UserContext,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) {
        super(_MoApiClient, _UserContext);
    }


    get RecCode() { return CashFlowRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(CashFlowRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Finance/GetCashFlows";


    protected _getApiRecordPathAdd() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathUpdate() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}