export interface IResponse {
  resultCode: string;
  resultDescription: string;
}

export interface IResponseWithData<T> extends IResponse {
  result: T;
}
