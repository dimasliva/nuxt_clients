import { injectable } from "inversify";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";



@injectable()
export class ProductGroupRecordData extends ApiRecordChData{
    title: string = '';
    code?: string | null= null;
    uid?: string | null= null;
    type?: number | null= null;
    description?: string | null= null;
    temporaryNotActive?: boolean | null= null;
    notActive?: boolean | null= null;
    advData?: any | null = null;
}



@injectable()
export class ProductGroupRecord extends ApiRecord<ProductGroupRecordData>{

    static override RightToken = "dbProductGroup";
    static override RecCode = 1034;
    static override BatchGetRecDataPath="/Products/GetProductGroups";


    get RecCode() { return ProductGroupRecord.RecCode; }

 
    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(ProductGroupRecordData, null,this.Key);
    }


    protected _getApiRecordPathGet = () => "/Products/GetProductGroups";


    protected _getApiRecordPathAdd = () => "/Products/AddProductGroup";


    protected _getApiRecordPathUpdate = () => "/Products/UpdateProductGroup";


    protected _getApiRecordPathDelete = () => "/Products/DeleteProductGroup";

}