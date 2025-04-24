import type { IResponseWithData } from "~/src/app/types";
import { API_URL, axiosWithAuth, axiosWithAuthTypeBlob, axiosWithAuthTypeFormData } from "~/src/shared/api/api.config";
import type { IFileRequestParams,  IResponseFile, IResponseUpdateFileLink } from "../types/files";

export const FilesService = {
  async uploadFile(params: FormData) {
    const { data } = await axiosWithAuthTypeFormData.post<
      IResponseWithData<IResponseFile>
    >(API_URL.files(`/UploadFile`), params);
    return data;
  },

  async updateFileLink(params: IResponseFile) {
    const { data } = await axiosWithAuth.post<
      IResponseWithData<IResponseUpdateFileLink>
    >(API_URL.files(`/UpdateFilelink`), params);
    return data;
  },
  
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
