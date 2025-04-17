import type { IUser } from "~/src/entities/User/model/types/user";

export interface ITokens {
    access_token: string;
    refresh_token: string;
  }
  
  export interface IRefreshAccessToken extends ITokens {
    token_type: string;
    expires_at: number;
  }

export enum EGenders {
    m = 'm',
    f = 'f'
} 
  

export interface ICommonLicenseData {
    until: string;
    untilMax: string;
    constraints: Record<string, unknown>;
}

export interface ICompanyLicenseData {
    common: ICommonLicenseData;
}

export interface IUserRecordsRights {
    dbroles: string;
    dbcompany: string;
    dbemployee: string;
    dbfilelink: string;
    [key: string]: string; 
}

export interface IUserStorage {
    companyAppProfile: null;
    companyLicenseData: ICompanyLicenseData;
    employee: IUser;
    advData: null;
    birthdate: string;
    changedAt: string;
    gender: EGenders;
    id: string;
    linkedRecs: null;
    name: string;
    notActive: boolean;
    patronymic: string;
    photo: null;
    profile: null;
    rank: null;
    roles: string;
    surname: string;
    employeeAppProfile: {
        compSettings: Record<string, unknown>;
        pageSettings: Record<string, unknown>;
    };
    recordRestrictions: {
        maxRowsPerRequest: number;
        maxRecordsPerRequest: number;
    };
    userFeatureAccess: string;
    userRecordsRights: IUserRecordsRights;
    resultCode: string;
    resultDescription: string;
}

export interface ILoginResponse extends ITokens, IUser {

}