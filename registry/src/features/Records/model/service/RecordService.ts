import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth } from "~/src/shared/api/api.config";

export const RecordService = {
  async getClientRecords(id: string | null) {
    // any потому что апи может вернуть любые ключи с любыми значениями
    const { data } = await axiosWithAuth.post<IResponseWithData<{[key: string]: any}[] | null[]>>(
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
  async lockRecord(id: string | null) {
    const { data } = await axiosWithAuth.post<IResponseWithData<boolean>>(
      API_URL.records(`/LockRecord`),
        {key: id, code: 1010},
    );
    return data;
  },
  async UnlockRecord(id: string | null) {
    const { data } = await axiosWithAuth.post<IResponseWithData<boolean>>(
      API_URL.records(`/UnlockRecord`),
        {key: id, code: 1010},
    );
    return data;
  },
};
