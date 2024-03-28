import * as Utils from "~/lib/Utils";
import { MoApiClient } from "../MoApiClient";
import type { IApiDataListResult } from "../RequestResults";
import { injectable, inject } from "inversify";
import type { RecordsStore } from "../Records/RecordsStore";
import ScheduleTimeSpanEntity from "../Records/DataEntities/ScheduleTimeSpanEntity";
import ScheduleTimespanItem from "../Records/DataEntities/ScheduleTimespanItem";

@injectable()
export class ScheduleApiSection {
  constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("RecordsStore") protected _RecordsStore: RecordsStore) {}

  async getScheduleByItemGroup(fromDate: Date, toDate: Date, groupId: string) {
    const queryObj = {
      fromDate: Utils.getDateStr(fromDate),
      toDate: Utils.getDateStr(toDate),
      groupId,
    };
    const raw = await this._MoApiClient.send<any, ScheduleTimespanItem[]>("/Schedule/GetScheduleByItemGroup", queryObj, true);
    const res: ScheduleTimespanItem[] = [];
    for (const item in raw) res.push(this._RecordsStore.dataEntityFactory(ScheduleTimespanItem, raw[item]));
    return res;
  }
}
