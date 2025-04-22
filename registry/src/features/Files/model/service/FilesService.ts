import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth, axiosWithAuthTypeBlob } from "~/src/shared/api/api.config";
import type { IFileRequestParams, IResponseFile } from "../types/files";

export const FilesService = {
  async getDocuments(params: IFileRequestParams) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseFile[]>
    >(API_URL.files(`/GetFilelinks`), params);
    return data;
  },

  async downloadFile(id: string) {
    const { data } = await axiosWithAuthTypeBlob.get<Blob>(
      API_URL.files(`/DownloadFile?filelinkId=${id}`)
    );
    return data;
  },
};
