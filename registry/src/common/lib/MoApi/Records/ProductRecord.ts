import { EDictionaries } from "~/src/common/lib/Dicts/DictionaryStore";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import PricesEntity from "./DataEntities/PricesEntity";
import type { RecordsStore } from "./RecordsStore";
import { injectable, inject } from "inversify";
import { EWellKnownPageCaches, type PageMemoryCacheStore } from "~/src/common/lib/Cache/PageMemoryCacheStore";
import type { ProductCache } from "~/src/common/lib/Cache/ProductCache";


@injectable()
export class ProductRecordData extends ApiRecordChData {
  title: string = "";
  fullTitle: string | null = null;
  code: string | null = null;
  productsCatalog: string = "";
  productsCatalogSection: string | null = null;
  prices: PricesEntity | null = null;
  duration: number = 10;
  comments: string | null = null;
  temporaryNotActive: boolean | null = null;
  notActive: boolean | null = null;
  advData: any | null = null;

  override fromJsonObj(obj: any) {
    super.fromJsonObj(obj);
    this.prices = obj.prices ? this.__RecordStore.dataEntityFactory(PricesEntity, obj.prices) : null;
  }
}


@injectable()

export class ProductRecord extends ApiRecord<ProductRecordData> {
  static override RightToken = "dbProduct";
  static override RecCode = 1024;
  static override BatchGetRecDataPath = "/Products/GetProducts";
  static override RecordsFindPath = "/Products/FindProducts";

  constructor(
    @inject("MoApiClient") _MoApiClient: MoApiClient,
    @inject("UserContext") _UserContext: UserContext,
    @inject("PageCacheStore") protected _PageCacheStore: PageMemoryCacheStore,
  ) {
    super(_MoApiClient, _UserContext);
  }

  get RecCode() {
    return ProductRecord.RecCode;
  }

  protected _createNewData() {
    return this._RecStore.dataEntityFactory(ProductRecordData, null, this.Key);
  }


  override async save() {
    await super.save();

    const pcache = this._PageCacheStore.getWellKnownCache(EWellKnownPageCaches.Products) as ProductCache;
    if (this.Data?.notActive)
      pcache.removeValue(this.Key);
    else
      pcache.setValueByRec(this);
  }



  protected _getApiRecordPathGet = () => "/Products/GetProducts";

  protected _getApiRecordPathAdd = () => "/Products/AddProduct";

  protected _getApiRecordPathUpdate = () => "/Products/UpdateProduct";

  protected _getApiRecordPathDelete = () => "/Products/DeleteProduct";

  getPrice(priceId: string | number) {
    return this.Data!.prices?.getPrice(priceId);
  }

  async setPrice(priceId: string | number, val: number) {
    const ptsdict = await this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.PriceTypes);

    ptsdict.getValByCode(priceId); //проверка существовния в словаре priceId

    if (!this.MData!.prices) this.MData!.prices = this._RecStore.dataEntityFactory(PricesEntity, { priceId: val });
    else this.MData!.prices.setPrice(priceId, val);
  }

  async setPriceTitle(priceId: string) {
    const ptsdict = await this._MoApiClient.getDictionaryStore().getDictionary(EDictionaries.PriceTypes);
    return ptsdict.getValByCode(priceId);
  }
}
