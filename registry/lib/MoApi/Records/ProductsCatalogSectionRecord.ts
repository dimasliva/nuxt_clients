import { injectable, inject } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData, } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { EWellKnownPageCaches, type PageMemoryCacheStore } from "~/lib/Cache/PageMemoryCacheStore";
import type { ProductCatalogSectionCache } from "~/lib/Cache/ProductCatalogSectionCache";

@injectable()
export class ProductsCatalogSectionRecordData extends ApiRecordChData {
  title: string = "";
  code: string | null = null;
  productsCatalog: string = "";
  parent?: string | null = null;
  comments: string | null = null;
  temporaryNotActive: boolean | null = null;
  notActive: boolean | null = null;
  advData: string | null = null;
}

@injectable()
export class ProductsCatalogSectionRecord extends ApiRecord<ProductsCatalogSectionRecordData>{

  static override RightToken = "dbProductsCatalogSection";
  static override RecCode = 1023;
  static override BatchGetRecDataPath = "/Products/GetProductsCatalogSections";

  constructor(
    @inject("MoApiClient") _MoApiClient: MoApiClient,
    @inject("UserContext") _UserContext: UserContext,
    @inject("PageCacheStore") protected _PageCacheStore: PageMemoryCacheStore,
  ) {
    super(_MoApiClient, _UserContext);
  }


  get RecCode() { return ProductsCatalogSectionRecord.RecCode; }

  protected _createNewData() {
    return this._RecStore.dataEntityFactory(ProductsCatalogSectionRecordData, null, this.Key);
  }



  override async save() {
    await super.save();

    const pcache = this._PageCacheStore.getWellKnownCache(EWellKnownPageCaches.ProductCatalogSections) as ProductCatalogSectionCache;
    if (this.Data?.notActive)
      pcache.removeValue(this.Key);
    else
      pcache.setValueByRec(this);
  }



  protected _getApiRecordPathGet = () => "/Products/GetProductsCatalogSections";


  protected _getApiRecordPathAdd = () => "/Products/AddProductsCatalogSection";


  protected _getApiRecordPathUpdate = () => "/Products/UpdateProductsCatalogSection";


  protected _getApiRecordPathDelete = () => "/Products/DeleteProductsCatalogSection";
}