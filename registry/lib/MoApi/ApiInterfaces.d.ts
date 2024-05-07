
 export interface 	ICouplingData {
    key:string;
    params?:number;
 }

 export interface 	IFullRecordIdT<T> {
   key:string;
   type: InitializableClass<T>;
 }

export interface 	IFullRecordId {
   key:string;
   code:number;
}

 export interface 	IRelData {
    id:string;
    recCode:string;
    relType:number;
 }

 export interface 	IRecordsData {
   name:string;
   code:number;
   description:string;
}


 export interface 	IRecordsRestricions {
   maxRowsPerRequest:number,
   maxRecordsPerRequest:number
}

