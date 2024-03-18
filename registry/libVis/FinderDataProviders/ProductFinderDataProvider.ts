import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { Exception } from "~/lib/Exceptions";
import { FinderDataProvider, type TDictViewVal } from "./FinderDataProvider";
import type { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import * as Utils from "~/lib/Utils";
import { ProductFtsViews } from "~/lib/MoApi/Views/ProductFtsListView";
import { ProductRecord } from "~/lib/MoApi/Records/ProductRecord";
import { EFinderFormHistoryResultTypeStorage } from "~/componentTemplates/forms/finderFormTemplate";
import FinderForm from "~/components/forms/FinderForm.vue";
import FinderFormSelect from "~/components/forms/FinderFormSelect.vue";

@injectable()
export class ProductFinderDataProvider extends FinderDataProvider {
  protected _listSizeLimit = 20;

  constructor(
    @inject("MoApiClient") _MoApiClient: MoApiClient,
    @inject("UserContext") _UserContext: UserContext,
    @inject("diC") _diC: Container,
    @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    @inject(ProductFtsViews) protected _ProductsFtsListView: ProductFtsViews
  ) {
    super(_MoApiClient, _UserContext, _diC);
    this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.full;
    this._apiRequestTimeout = 2500;
  }

  init(instName: string | null, multiselect = false, sizeLimit: number = 20) {
    super.init(instName, multiselect ? FinderFormSelect : FinderForm);
    this._instName = instName;
    this._listSizeLimit = sizeLimit;
  }

  async getCatalogs() {}

  async getList(txt: string, cats: any): Promise<TDictViewVal[]> {
    if (txt) {
      console.log(cats);
      let rdl = await this._ProductsFtsListView.getProductFtsListView({
        select: "id, title, fullTitle, catalogTitle, sectionTitle",
        text: txt,
        limit: this._listSizeLimit,
        minRank: 1,
        notActive: false,
        productCatalogs: cats,
        temporaryNotActive: false,
      });
      let res = rdl.toArray().map((item) => {
        return { value: item.id, title: item.title! };
      });
      return res.sort((a, b) => a.title!.localeCompare(b.title!));
    }

    return [];
  }

  async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
    if (!value) return undefined;
    const rec = await this._RecordsStore.fetch(ProductRecord, value);
    return;
  }
}
