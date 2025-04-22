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

export interface IClientAddress {
  building: string;
  corp: string;
  country: number;
  countryText: string;
  district: string;
  flat: string;
  regionCode: number;
  regionText: string;
  settlement: string;
  settlementType: number;
  settlementText: string;
  street: string;
  zip: string;
}

export interface IOpenUser {
  avatarPreview: string | null;
  photoId: string | null;
  avatar: null | IResponseFile;
  birthdate: string;
  gender: EGenders;
  id: string;
  name: string;
  patronymic: string;
  surname: string;

  selectedGender: string;
  mainDocumentNumber: string;
  mainDocumentSeries: string;
  mainDocumentWhen: string;
  mainDocumentWho: string;
  mainDocumentWhoCode: string;
  otherDocuments: IClientOtherDocuments[];
  mainEmail: string;
  mainPhone: string;
  reservPhone: string;
  mainDocument: number;
  mainDocumentText: string;

  mainAddress: IClientAddress;
  permanentRegistration: IClientAddress;
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
  gender: 'm' | 'f' | null; 
  birthdate: string;    
  notActive: boolean | null; 
  advData: any | null; 
}
