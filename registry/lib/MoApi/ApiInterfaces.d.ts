
 export interface 	ICouplingData {
    id:string;
    recCode:number;
 }


 export interface 	IRelData {
    id:string;
    recCode:string;
    relType:number;
 }


 export interface 	IRecordsRestricions {
   maxRowsPerRequest:number,
   maxRecordsPerRequest:number
}