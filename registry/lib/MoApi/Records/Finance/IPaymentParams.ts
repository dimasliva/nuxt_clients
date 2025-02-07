import { Interface } from "readline";
import type { ECashFlowOperationTypes, ECashFlowSubjectTypes, ECashFlowTypes, ECashFlowInstrumentCodes } from "./FinanceEnums";



export interface IPaymentParams {
    targetId: eid;
    operationType: ECashFlowOperationTypes;
    value: number;
    exchangeRate?: number | null;
    extCode?: string | null;
    extPaymentSystem?: number | null;
    balance?: eid | null;
    balanceType?: ECashFlowSubjectTypes | null;
    flowType: ECashFlowTypes;
    instrumentCode: ECashFlowInstrumentCodes;
    companyOrganization?: eid | null;
}