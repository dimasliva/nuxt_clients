import type { ECashFlowSubjectTypes } from "./FinanceEnums";


export interface IActionBalanceParams {
    dstBalance?: eid | null;
    dstType?: ECashFlowSubjectTypes | null ;
    value: number;
    isBonuses: boolean;
    srcBalance?: eid | null;
    srcType?: ECashFlowSubjectTypes | null;
    companyOrganization: eid;
}