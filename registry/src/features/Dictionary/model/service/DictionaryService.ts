import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth } from "~/src/shared/api/api.config";

export const DictionaryService = {
  async getDocuments() {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseDictionary>
    >(API_URL.dictionaries(`/GetDictionaryItems`), {
      dictKey: "4",
      section: 0,
    });
    return data;
  },

  async getCountries() {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseDictionary>
    >(API_URL.dictionaries(`/GetDictionaryItems`), {
      dictKey: "2",
      section: 0,
    });
    return data;
  },

  async getRegions() {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseDictionary>
    >(API_URL.dictionaries(`/GetDictionaryItems`), {
      dictKey: "7",
      section: 0,
    });
    return data;
  },

  async getAllLocationTypes() {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseDictionary>
    >(API_URL.dictionaries(`/GetDictionaryItems`), {
      dictKey: "18",
      section: 0,
    });
    return data;
  },
};
