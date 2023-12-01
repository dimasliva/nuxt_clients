
 export interface 	ICouplingData {
    id:string;
    recCode:number;
 }

 export interface 	IFullRecordIdT<T> {
   key:string;
   type: Class<T>;
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

