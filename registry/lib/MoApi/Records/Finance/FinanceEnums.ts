
export const enum ECashFlowSubjectTypes {
    Client = 1
}


export const enum ECashFlowOperationTypes {
    PaymentCash = 1,
    ChargeBackCash,
    PaymentBonus,
    ChargeBackBonus,
    BalanceTransferCash,
    BalanceTransferBonus,
    RefillBalance,
    RefillBalanceBonus,
    ChargeBackBalance,
    ChargeBackBalanceBonus
}


export const enum ECashFlowInstrumentCodes {
    None = 0,
    Other = 1,
    Сashdesk = 2,
    PosTerminal = 3,
    ExtPaymentSystem = 4
}


export const enum ECashFlowTypes {
    Other = 0,
    СashMoney = 1,
    NonСashMoney = 2
}