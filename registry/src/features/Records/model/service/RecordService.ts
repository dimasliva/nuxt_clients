import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth } from "~/src/shared/api/api.config";
import type { IRecordResponse } from "../types/records";

export const RecordService = {
  async getClientRecords(id: string | null) {
    const { data } = await axiosWithAuth.post<IResponseWithData<IRecordResponse[]>>(
      API_URL.records(`/GetRecs`),
      [
        {key: id, code: 1011},
        {key: id, code: 1012},
        {key: id, code: 1013},
        {key: id, code: 1014},
      ]
    );
    return data;
  },
};
