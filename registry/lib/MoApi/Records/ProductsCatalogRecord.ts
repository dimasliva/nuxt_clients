import { injectable } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";

@injectable()
export class ProductsCatalogRecordData extends ApiRecordChData {
  title: string = "";
  code: string | null = null;
  comments: string | null = null;
  temporaryNotActive: boolean | null = null;
  notActive: boolean | null = null;
  advData: string | null = null;
}

@injectable()
export class ProductsCatalogRecord extends ApiRecord<ProductsCatalogRecordData> {
  static RightToken = "dbProductsCatalog";
  static RecCode = 1022;
  static BatchGetRecDataPath="/Products/GetProductsCatalogs";


  get RecCode() {
    return ProductsCatalogRecord.RecCode;
  }


  protected _createNewData() {
    return this._RecStore.dataEntityFactory(ProductsCatalogRecordData, null, this.Key);
  }

  protected _getApiRecordPathGet = () => "/Products/GetProductsCatalogs";

  protected _getApiRecordPathAdd = () => "/Products/AddProductsCatalog";

  protected _getApiRecordPathUpdate = () => "/Products/UpdateProductsCatalog";

  protected _getApiRecordPathDelete = () => "/Products/DeleteProductsCatalog";
}
