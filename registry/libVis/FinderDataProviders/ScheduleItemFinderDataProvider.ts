import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { FinderDataProvider, type TDictViewVal } from "./FinderDataProvider";
import type { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { ScheduleItemGroupData, ScheduleItemGroupRecord } from "~/lib/MoApi/Records/SchedulerItemGroupRecord";
import { EFinderFormHistoryResultTypeStorage } from "~/componentTemplates/forms/finderFormTemplate";
import FinderForm from "~/components/forms/FinderForm.vue";
import FinderSelectForm from "~/components/forms/FinderFormSelect.vue";
import type { IApiDataListResult, IApiResult } from "~/lib/MoApi/RequestResults";
import { DataList } from "~/lib/DataList";


@injectable()
export class ScheduleItemFinderDataProvider extends FinderDataProvider {
  protected _listSizeLimit = 20;
  protected _selectedOptionsValues: any = [];

  constructor(
    @inject("MoApiClient") _MoApiClient: MoApiClient,
    @inject("UserContext") _UserContext: UserContext,
    @inject("diC") protected _diC: Container,
    @inject("RecordsStore") protected _RecordsStore: RecordsStore
  ) {
    super(_MoApiClient, _UserContext);
  }

  override init(instName: string | null, multiselect = false, sizeLimit: number = 20) {
    super.init(instName, multiselect ? FinderSelectForm : FinderForm, null);
    this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.full;
    this._apiRequestTimeout = 2500;
    this._instName = instName;
    this._listSizeLimit = sizeLimit;
/*
    const positionTemplate = new PositionList(this._diC, { selectStrategy: multiselect ? "page" : "single" });
    const selTemplate = new SelectFormTemplate(this._diC, { title: "Выбор должности", componentTemplate: positionTemplate });

    const selComponent = defineComponent({
      setup: (p, c) => selTemplate.setup(p, c),
      render: selTemplate.render(),
    })

    this._selectFormComponent = selComponent;
    */
  }



  async getList(txt: string): Promise<TDictViewVal[]> {
    if (txt) {
      let rdl = await this._MoApiClient.send<any, IApiDataListResult>("/Schedule/FuzzySearchScheduleItemGroups", { select: 'id, title', text: txt, searchBy: ['title'] });
      let res = DataList.createFromApiDl<ScheduleItemGroupData>(rdl).toArray().map((item) => { return { value: item.id, title: item.title! } })
      return res.sort((a, b) => a.title.localeCompare(b.title));
    }

    return [];
  }


  async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
    if (!value) return undefined;
    const rec = await this._RecordsStore.fetch(ScheduleItemGroupRecord, value);
    return rec.Data?.title;
  }
}
