import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/src/common/lib/UserContext";
import type { MoApiClient } from "~/src/common/lib/MoApi/MoApiClient";
import { FinderDataProvider, type TDictViewVal } from "../FinderDataProvider";
import type { RecordsStore } from "~/src/common/lib/MoApi/Records/RecordsStore";
import { EFinderFormHistoryResultTypeStorage } from "~forms/WindowDialogs/~sub/FinderForms/FinderFormTemplate";
import { PositionListTemplate } from "~/src/widgets/Lists/~sub/PositionListTemplate";
import { SelectFormTemplate } from "~forms/WindowDialogs/~sub/SelectForms/SelectFormTemplate";
import { PositionRecord } from "~/src/common/lib/MoApi/Records/PositionRecord";
import * as vHelpers from '~uilib/Helpers';
import type { IRenderedTemplateComponentProps } from "~components/types";


@injectable()
export class PositionFinderDataProvider extends FinderDataProvider {
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
    super.init(instName, null, null);
    this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.full;
    this._apiRequestTimeout = 2500;
    this._instName = instName;
    this._listSizeLimit = sizeLimit;


    const positionTemplate = new PositionListTemplate(this._diC, { selectStrategy: multiselect ? "page" : "single" });
    const selTemplate = new SelectFormTemplate(this._diC, { title: "Выбор должности", componentTemplate: positionTemplate });

    const selComponent = defineComponent({
      props: selTemplate.sprops(),
      setup: (p, c) => selTemplate.setup(p, c),
      render: selTemplate.render(),
    })

    this._selectFormComponent = selComponent;

  }



  async getList(txt: string): Promise<TDictViewVal[]> {
    return [];
  }


  async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
    if (!value) return undefined;
    try {
      const rec = await this._RecordsStore.fetch(PositionRecord, value);
      return `${await rec.getPositionTitle()} (${await rec.getEmployeeInitials()}|| "")`
    }
    catch (exc) {
      return ""
    }
  }
}
