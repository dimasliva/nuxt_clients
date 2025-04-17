export enum EClientTabs {
  profile = "profile",
  contacts = "contacts",
  privacy = "privacy",
  documents = "documents",
  addresses = "addresses",
}

export enum EAddressTabs {
  actual = "actual",
  permanent = "permanent",
}

export interface IProfileActualAddress {
  county: string;
  region: string;
  municipalDistrict: string;
  localityType: string;
  localityName: string;
  postalCode: string;
  street: string;
  house: string;
  building: string;
  apartment: string;
}

export interface IOtherDocument {
  id: number;
  title: string;
  seria: string;
  number: string;
  date: string;
  comment: string;
}

export interface IActualAddress {
  county: string;
  region: string;
  municipalDistrict: string;
  localityType: string;
  localityName: string;
  postalCode: string;
  street: string;
  house: string;
  building: string;
  apartment: string;
}

export interface IClientParams {
  limit: number;
  orderBy: string;
  select: string;
  where: string;
}
export interface IClientData {
  id: string;
  name: string;
  surname: string;
  patronymic: string;
  birthdate: string;
}
export interface IClientResponse {
  data: string[][];
  headers: string[];
}

export type IOpenUserId = string | null | undefined;

export interface IClientOtherDocuments {
  comment: string;
  number: string;
  serial: string;
  typeCode: number;
  when: string;
}

export interface IOpenUser extends IUser {
  selectedGender: string;
  mainDocumentNumber: string;
  mainDocumentSeries: string;
  mainDocumentWhen: string;
  mainDocumentWho: string;
  mainDocumentWhoCode: string;
  otherDocuments: IClientOtherDocuments[];
}
