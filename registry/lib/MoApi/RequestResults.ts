

export interface IApiResult<T=any> {
    result: T;
    resultCode:string;
    resultDescription:string
}


export interface IApiDataListResult {
    headers:string[];
    data:any[][]
}



