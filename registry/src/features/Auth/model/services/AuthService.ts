import { API_URL, axiosClassic } from "~/src/shared/api/api.config";
import { getRefreshToken } from "./auth-token.service";
import type { IResponseWithData } from "~/src/app/types";
import type { IRefreshAccessToken } from "../types/auth";

export const AuthService = {
  // async signIn(login: string, password: string) {
  //   const { data } = await axiosClassic.post<IResponseWithData<ILoginResponse>>(
  //     API_URL.auth(`/login`),
  //     {
  //       login,
  //       password,
  //       scope: "",
  //     },
  //   );

  //   if (data.data.access_token) saveToStorage(data.data);

  //   return data.data;
  // },

  // async signOut(user_id?: number) {
  //   const { data } = await axiosWithAuth.post<IResponse>(
  //     API_URL.auth(`/logout`),
  //     {
  //       id: user_id,
  //     },
  //   );

  //   if (data.success) {
  //     removeFromStorage();
  //     removeUserFromStorage();
  //   }

  //   return data;
  // },

  // async signUp(formData: ISignUpForm) {
  //   const { data } = await axiosClassic.post<IResponseWithData<ILoginResponse>>(
  //     API_URL.admin(`/users/registration`),
  //     {
  //       repeatPass: formData.repeatPass,
  //       user: {
  //         name: formData.name,
  //         email: formData.email,
  //         password: formData.password,
  //         birthday: formData.birthday?.toString(),
  //         login: formData.login,
  //         lastname: formData.lastname,
  //       },
  //     },
  //   );

  //   return data.data;
  // },

  async getNewTokens() {
    const refreshToken = getRefreshToken();

    const response = await axiosClassic.post<
      IResponseWithData<IRefreshAccessToken>
    >(API_URL.auth(`/refresh`), {
      refresh_token: refreshToken,
    });

    return response.data.result;
  },
};
