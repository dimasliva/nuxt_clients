import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth } from "~/src/shared/api/api.config";
import type { IClientParams, IClientResponse, IOpenUserId } from "../types/clients";

export const ClientService = {
  async getClients(params: IClientParams) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IClientResponse>
    >(API_URL.clients(`/ClientsListView`), params);
    return data;
  },

  async getClient(id: IOpenUserId) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IUser[]>
    >(API_URL.clients(`/GetClients`), [id]);
    return data;
  },

};
