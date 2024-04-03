import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { FinderDataProvider, type TDictViewVal } from "./FinderDataProvider";
import type { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { ScheduleItemGroupRecord } from "~/lib/MoApi/Records/SchedulerItemGroupRecord";
import { EFinderFormHistoryResultTypeStorage } from "~/componentTemplates/forms/finderFormTemplate";
import FinderForm from "~/components/forms/FinderForm.vue";
import FinderSelectForm from "~/components/forms/FinderFormSelect.vue";
import type { IApiResult } from "~/lib/MoApi/RequestResults";

@injectable()
export class ScheduleItemFinderDataProvider extends FinderDataProvider {
  protected _listSizeLimit = 20;
  protected _selectedOptionsValues: any = [];

  constructor(
    @inject("MoApiClient") _MoApiClient: MoApiClient,
    @inject("UserContext") _UserContext: UserContext,
    @inject("diC") _diC: Container,
    @inject("RecordsStore") protected _RecordsStore: RecordsStore
  ) {
    super(_MoApiClient, _UserContext, _diC);
    this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.full;
    this._apiRequestTimeout = 2500;
  }

  init(instName: string | null, multiselect = false, sizeLimit: number = 20) {
    super.init(instName, multiselect ? FinderSelectForm : FinderForm);
    this._instName = instName;
    this._listSizeLimit = sizeLimit;
  }

  async edit(choosedValues?: any): Promise<any | null> {
    return new Promise((resolve) => {
      openDialog(
        this._editFormComponent,
        {
          diC: this._diC,
          title: "Поиск",
          finderDataProvider: this,
          apiRequestTimeout: this._apiRequestTimeout,
          selectedOptionsValues: this._selectedOptionsValues,
          historyResultTypeStorage: this._historyResultTypeStorage,
        },
        true,
        (e, d) => {
          if (e == "onBeforeClose") resolve(d);
          return true;
        }
      );
    });
  }

  async getList(txt: string): Promise<TDictViewVal[]> {
    if (txt) {
      let rdl = await this._MoApiClient.send<string, IApiResult>("/Schedule/FindScheduleItemGroups", "'" + txt + "'");
      let res = rdl.result.map((item) => {
        return { value: item.id, title: item.title! };
      });
      return res.sort((a, b) => a.title!.localeCompare(b.title!));
    }

    return [];
  }

  async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
    if (!value) return undefined;
    const rec = await this._RecordsStore.fetch(ScheduleItemGroupRecord, value);
    return;
  }
}
