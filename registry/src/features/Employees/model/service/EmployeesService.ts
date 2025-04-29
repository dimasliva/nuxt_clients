import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth,  } from "~/src/shared/api/api.config";

export const EmployeesService = {

  async updateAppProfile(params: IUpdateAppProfileParamsRequestParams) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseUpdateFileLink>
    >(API_URL.employees(`/UpdateAppProfile`), params);
    return data;
  },
  
};
