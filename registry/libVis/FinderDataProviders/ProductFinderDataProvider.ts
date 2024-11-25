import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { Exception } from "~/lib/Exceptions";
import { FinderDataProvider, type TDictViewVal } from "./FinderDataProvider";
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import type { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { ProductViews } from "~/lib/MoApi/Views/ProductViews";
import { ProductRecord } from "~/lib/MoApi/Records/ProductRecord";
import { EFinderFormHistoryResultTypeStorage } from "~/componentTemplates/forms/finderFormTemplate";
import FinderForm from "~/components/forms/FinderForm.vue";
import FinderSelectForm from "~/components/forms/FinderFormSelect.vue";
import { ProductNavigatorTemplate } from "~/componentTemplates/navigatorTemplates/productNavigatorTemplate";
import { SelectFormTemplate } from "~/componentTemplates/forms/selectFormTemplate";

@injectable()
export class ProductFinderDataProvider extends FinderDataProvider {

  protected _listSizeLimit = 20;
  protected _selectedOptionsValues: any = [];

  constructor(
    @inject("MoApiClient") _MoApiClient: MoApiClient,
    @inject("UserContext") _UserContext: UserContext,
    @inject("diC") protected _diC: Container,
    @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    @inject(ProductViews) protected _ProductViews: ProductViews
  ) {
    super(_MoApiClient, _UserContext);
    this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.full;
    this._apiRequestTimeout = 2500;
  }



  override init(instName: string | null, multiselect = false, sizeLimit: number = 20, cats: any[] = [], selectComponentTemplate?: any | null) {
    super.init(instName, multiselect ? FinderSelectForm: FinderForm, null);
    this._instName = instName;
    this._listSizeLimit = sizeLimit;
    this._selectedOptionsValues = cats;


    if (selectComponentTemplate !== null) {
      const navTemplate = selectComponentTemplate ||
        new ProductNavigatorTemplate(
          this._diC,
          null,
          {
            selectMode: true,
            selectStrategy: multiselect ? "page" : "single",
            selectableTypes: ["product"]
          });

      const selTemplate = new SelectFormTemplate(this._diC, { title: "Выбор услуги", componentTemplate: navTemplate });

      const selComponent = defineComponent({
        setup: (p, c) => selTemplate.setup(p, c),
        render: selTemplate.render(),
      })

      this._selectFormComponent = selComponent;
    }
    return this;
  }



  override async find(choosedValues?: any): Promise<any | null> {
    return new Promise((resolve) => {
      openDialog(
        this._findFormComponent,
        {
          //diC: this._diC,
          title: "Поиск товаров и услуг",
          finderDataProvider: this,
          apiRequestTimeout: this._apiRequestTimeout,
          choosedValues: choosedValues,
          selectedOptionsValues: this._selectedOptionsValues,
          historyResultTypeStorage: this._historyResultTypeStorage,
          selectFormComponent: this._selectFormComponent,

        },
        true,
        true,
        (e, d) => {
          if (e == "onBeforeClose") resolve(d);
          return true;
        });
    });
  }



  async getList(txt: string, cats: any): Promise<TDictViewVal[]> {
    if (txt) {
      let rdl = await this._ProductViews.getProductFtsListView({
        select: "id, title, fullTitle, catalogTitle, sectionTitle",
        text: txt,
        limit: this._listSizeLimit,
        minRank: 1,
        notActive: false,
        productCatalogs: cats,
        temporaryNotActive: false,
      });
      let res = rdl.toArray().map((item) => { return { value: item.id, title: item.title! } });
      return res;
    }

    return [];
  }



  async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
    if (!value) return undefined;
    const rec = await this._RecordsStore.tryFetch(ProductRecord, value);
    return rec?.Data!.title;
  }
}
