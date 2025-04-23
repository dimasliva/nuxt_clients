export type IFileRequestParams = string[];

export interface IUpdateFileRequest {
  filetype: number;
  file: Blob;
  filelinkId: string; 
}

export interface IResponseUpdateFileLink {
  changedAt: string;
  id: string;
}


export interface IResponseFile {
  advData: null;
  changedAt: string;
  client: string;
  createDate: null;
  docType: null;
  ext: string;
  fileCollection: null;
  fileType: number;
  group: null;
  hash: string;
  id: string;
  notActive: null;
  position: null;
  removeAfter: string;
  size: string;
  title: string;
  uid: null;
}
