import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/src/common/lib/UserContext";
import type { MoApiClient } from "~/src/common/lib/MoApi/MoApiClient";
import { FinderDataProvider, type TDictViewVal } from "./FinderDataProvider";
import type { RecordsStore } from "~/src/common/lib/MoApi/Records/RecordsStore";
import { ScheduleItemGroupData, ScheduleItemGroupRecord } from "~/src/common/lib/MoApi/Records/ScheduleItemGroupRecord";
import { EFinderFormHistoryResultTypeStorage } from "~forms/WindowDialogs/~sub/FinderForms/FinderFormTemplate";
import FinderForm from "~forms/WindowDialogs/~sub/FinderForms/FinderForm.vue";
import FinderSelectForm from "~forms/WindowDialogs/~sub/FinderForms/~sub/FinderFormMultiple/~sub/FinderFormSelects/FinderFormSelect.vue";
import type { IApiDataListResult, IApiResult } from "~/src/common/lib/MoApi/RequestResults";
import { DataList } from "~/src/common/lib/DataList";
import { SelectFormTemplate } from "~forms/WindowDialogs/~sub/SelectForms/SelectFormTemplate";
import { ScheduleItemGroupListTemplate } from "~/src/widgets/Lists/~sub/SchedulerItemGroupListTemplate";
import { ScheduleApiSection } from "~/src/common/lib/MoApi/ApiSectionsV1/SchedulerApiSection";


@injectable()
export class ScheduleItemGroupFinderDataProvider extends FinderDataProvider {
  protected _listSizeLimit = 20;
  protected _selectedOptionsValues: any = [];

  constructor(
    @inject("MoApiClient") _MoApiClient: MoApiClient,
    @inject("UserContext") _UserContext: UserContext,
    @inject("diC") protected _diC: Container,
    @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    @inject(ScheduleApiSection) protected _ScheduleApiSection: ScheduleApiSection,
  ) {
    super(_MoApiClient, _UserContext);
  }

  override init(instName: string | null, multiselect = false, sizeLimit: number = 20) {
    super.init(instName, multiselect ? FinderSelectForm : FinderForm, null);
    this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.full;
    this._apiRequestTimeout = 2500;
    this._instName = instName;
    this._listSizeLimit = sizeLimit;

    const listTemplate = new ScheduleItemGroupListTemplate(this._diC, { selectStrategy: multiselect ? "page" : "single" });
    const selTemplate = new SelectFormTemplate(this._diC, { title: "Выбор раздела расписания", componentTemplate: listTemplate });

    this._selectFormComponent = defineComponent({
      setup: (p, c) => selTemplate.setup(p, c),
      render: selTemplate.render(),
    })

  }



  async getList(txt: string): Promise<TDictViewVal[]> {
    if (txt) {
      let rdl = await this._ScheduleApiSection.fuzzySearchScheduleItemGroups({ select: 'id, title', text: txt, where: '', searchBy: ['title'] });
      let res = rdl.toArray().map((item) => { return { value: item.id, title: item.title! } });
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
