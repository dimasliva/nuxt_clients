import type { IResponseFile } from "~/src/features/Files/model/types/files";

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
export interface IAddClientParams {
  name: string;
  surname: string;
  patronymic: string;
  gender: string;
  birthdate: string | null;
  notActive: null;
  advData: null;
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

export interface IRequestSetClientSdParams {
  id: string;
  citizenship: null;
  kinship: null;
  individualId: null;
  changedAt?: string;
  photo: string | null;
  comments: null;
  advData: null;
}

export interface IClientOtherDocument {
  typeCode: number;
  type: string | null;
  serial: string;
  number: string;
  when: string;
  who: string | null;
  whoCode: string | null;
  comment: string;
}

export interface IRequestSetClientDocumentsParams {
  id: string;
  changedAt: string;
  snils: string | null;
  mainDocument: number;
  mainDocumentSeries: string;
  mainDocumentNumber: string;
  mainDocumentWhen: string;
  mainDocumentWho: string;
  mainDocumentWhoCode: string;
  otherDocuments: IRectsOtherDocument[];
  advData: any | null;
}

export interface IClientOtherDocuments {
  typeCode: number;
  type: null;
  serial: string;
  number: string;
  when: string;
  who: null;
  whoCode: null;
  comment: string;
}

export type IOpenUserId = string | null | undefined;

export interface IClientContacts {
  changedAt: string;
  mainPhone: string;
  reservPhone: string;
  mainEmail: string;
}

export interface IClientPhoto {
  id: string | null;
  changedAt: string;
}

export interface IRectsOtherDocument {
  typeCode: number;
  serial: string;
  number: string;
  when: string;
  comment: string;
}

export interface IClientDocuments {
  id: string;
  changedAt: string;
  snils: string;
  mainDocument: number;
  mainDocumentSeries: string;
  mainDocumentNumber: string;
  mainDocumentWhen: string;
  mainDocumentWho: string;
  mainDocumentWhoCode: string;
  otherDocuments: IRectsOtherDocument[];
  advData: null;

  mainDocumentText: string;
}
export interface IClientAddressResponse {
  building: string;
  corp: string;
  country: number;
  district: string;
  flat: string;
  regionCode: number;
  settlement: string;
  settlementType: number;
  street: string;
  zip: string;
}
export interface IClientAddress extends IClientAddressResponse {
  countryText: string;
  regionText: string;
  settlementText: string;
}
export interface ISetClientAddresses {
  id: string;
  mainAddress: IClientAddressResponse;
  permanentRegistration: IClientAddressResponse | null;
  addressesEqual: boolean | null;
  advData: null;
  changedAt: string;
}
export interface IClientAddresses {
  id: string;
  mainAddress: IClientAddress;
  permanentRegistration: IClientAddress | null;
  addressesEqual: boolean | null;
  advData: null;
  changedAt: string;
}

export interface IOpenUser {
  avatarPreview: string | null;
  photoId: string | null;
  avatar: null | IResponseFile;
  changedAt: string;
  birthdate: string;
  selectedGender: string;
  gender: EGenders;
  id: string;
  name: string;
  patronymic: string;
  surname: string;
  contacts: IClientContacts;
  documents: IClientDocuments;
  addresses: IClientAddresses;
}

export enum EGenderProfile {
  male = "Мужской",
  female = "Женский",
}

export interface IResponseUpdateClient {
  changedAt: string;
  id: string;
}

export interface IUpdateClient {
  id: string;
  changedAt: string;
  name: string;
  surname: string;
  patronymic: string;
  gender: "m" | "f" | null;
  birthdate: string;
  notActive: boolean | null;
  advData: any | null;
}

export interface IUpdateClientContacts {
  advData: null;
  otherContacts: null;
  id: string;
  changedAt?: string;
  mainPhone: string;
  reservPhone: string | null;
  mainEmail: string;
}
