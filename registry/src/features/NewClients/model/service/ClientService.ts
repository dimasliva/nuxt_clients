import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth } from "~/src/shared/api/api.config";
import type { IAddClientParams, IClientParams, IClientResponse, IOpenUserId,  IRequestSetClientDocumentsParams,  IRequestSetClientSdParams,  IResponseUpdateClient, ISetClientAddresses, IUpdateClient, IUpdateClientContacts } from "../types/clients";

export const ClientService = {
  async getClients(params: IClientParams) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IClientResponse>
    >(API_URL.clients(`/ClientsListView`), params);
    return data;
  },

  async addClient(params: IAddClientParams) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseUpdateClient>
    >(API_URL.clients(`/AddClient`), params);
    return data;
  },

  async SetClientSd(params: IRequestSetClientSdParams) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IRequestSetClientSdParams>
    >(API_URL.clients(`/SetClientSd`), params);
    return data;
  },

  async getClient(id: IOpenUserId) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IUser[]>
    >(API_URL.clients(`/GetClients`), [id]);
    return data;
  },

  async setClientDocuments(params: IRequestSetClientDocumentsParams) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseUpdateClient>
    >(API_URL.clients(`/SetClientDocuments`), params);
    return data;
  },

  async setClientAddresses(params: ISetClientAddresses) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseUpdateClient>
    >(API_URL.clients(`/SetClientAddresses`), params);
    return data;
  },

  async updateClient(params: IUpdateClient) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseUpdateClient>
    >(API_URL.clients(`/UpdateClient`), params);
    return data;
  },

  async updateClientContacts(params: IUpdateClientContacts) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseUpdateClient>
    >(API_URL.clients(`/SetClientContacts`), params);
    return data;
  },

};
