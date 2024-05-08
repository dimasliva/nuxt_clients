import * as Utils from "~/lib/Utils";
import { MoApiClient } from "../MoApiClient";
import type { IApiDataListResult } from "../RequestResults";
import { injectable, inject } from "inversify";
import type { RecordsStore } from "../Records/RecordsStore";
import ScheduleTimeSpanEntity from "../Records/DataEntities/ScheduleTimeSpanEntity";
import ScheduleTimespanItem from "../Records/DataEntities/ScheduleTimespanItem";
import { QuerySchedule, QueryParamsScheduler } from "../RequestArgs";


export type TDatedScheduleTimespanItems = { [date: string]: ScheduleTimespanItem[] };

@injectable()
export class ScheduleApiSection {
  constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("RecordsStore") protected _RecordsStore: RecordsStore) { }



  async getScheduleByItemGroup(fromDate: Date, toDate: Date, groupId: string) {
    const queryObj = {
      fromDate: Utils.getDateStr(fromDate),
      toDate: Utils.getDateStr(toDate),
      groupId,
    };

    const raw = await this._MoApiClient.send<QueryParamsScheduler, TDatedScheduleTimespanItems>("/Schedule/GetScheduleByItemGroup", queryObj, true);
    const res: TDatedScheduleTimespanItems = {};
    for (const date in raw) res[date] = raw[date].map((item) => this._RecordsStore.dataEntityFactory(ScheduleTimespanItem, item));

    return res;
  }



  async getSchedule(queryArgs: QuerySchedule) {
    const raw = await this._MoApiClient.send<QuerySchedule, TDatedScheduleTimespanItems>("/Schedule/GetSchedule", queryArgs);
    const res: TDatedScheduleTimespanItems = {};
    for (const date in raw) res[date] = raw[date].map((item) => this._RecordsStore.dataEntityFactory(ScheduleTimespanItem, item));

    return res;
  }
}
