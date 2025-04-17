import type { IUser } from "~/src/entities/User/model/types/user";
import { EGenders, type ILoginResponse, type ITokens, type IUserStorage } from "../types/auth";

export enum EnumTokens {
    "ACCESS_TOKEN" = "access_token",
    "REFRESH_TOKEN" = "refresh_token",
}
const access_token = useCookie(EnumTokens.ACCESS_TOKEN)
const refresh_token = useCookie(EnumTokens.REFRESH_TOKEN)
const user = useCookie<IUser>('user')


export const getUserFromStorage = (): IUser | null => {
    if (user.value) {
        return user.value;
    }

    return null;
};

export const getAccessToken = () => {
    return access_token.value
};
export const getRefreshToken = () => {
    return refresh_token.value
};
export const saveRefreshTokenStorage = (token: string) => {
    refresh_token.value = token
};
export const saveAccessTokenStorage = (token: string) => {
    access_token.value = token
};

export const saveTokensStorage = (data: ITokens) => {
    access_token.value = data.access_token
    refresh_token.value = data.refresh_token
};

export const saveUserToStorage = (data: IUser) => {
    user.value = {
        advData: data.advData,
        birthdate: data.birthdate,
        changedAt: data.changedAt,
        gender: data.gender,
        id: data.id,
        linkedRecs: data.linkedRecs,
        name: data.name,
        notActive: data.notActive,
        patronymic: data.patronymic,
        photo: data.photo,
        profile: data.profile,
        rank: data.rank,
        roles: data.roles,
        surname: data.surname,
        
    }
};