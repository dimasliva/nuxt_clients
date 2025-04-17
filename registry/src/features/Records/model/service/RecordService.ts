import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth } from "~/src/shared/api/api.config";
import type { IOpenUserId } from "~/src/features/NewClients/model/types/clients";
import type { IRecordResponse } from "../types/records";

export const RecordService = {
  async getClientRecords(id: Ref<IOpenUserId>) {
    const { data } = await axiosWithAuth.post<IResponseWithData<IRecordResponse[]>>(
      API_URL.records(`/GetRecs`),
      [
        {key: id.value, code: 1011},
        {key: id.value, code: 1012},
        {key: id.value, code: 1013},
        {key: id.value, code: 1014},
      ]
    );
    return data;
  },
};
