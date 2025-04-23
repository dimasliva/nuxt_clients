export interface IRecordParams {
    key: string;
    code: number;
}

export interface IRecordResponse {
    [key: string]: any // any потому что массив разных объектов 
}
  
export interface IRecData1 {
    id: string;
    changedAt: string;
    snils: string | null;
    mainDocument: number;
    mainDocumentSeries: string;
    mainDocumentNumber: string;
    mainDocumentWhen: string;
    mainDocumentWho: string;
    mainDocumentWhoCode: string;
    otherDocuments: IClientOtherDocuments[];
    advData: null;
  }
  
  export interface IRecData2 {
    id: string;
    changedAt: string;
    mainPhone: string;
    reservPhone: string;
    mainEmail: string;
    otherContacts: null;
    advData: null;
  }
  
export interface IRecData3 {
    id: string;
    changedAt: string;
    mainAddress: IClientAddress;
    permanentRegistration: IClientAddress;
    addressesEqual: null;
    advData: null;
  }
  