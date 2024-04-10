import * as Utils from "~/lib/Utils";
import { MoApiClient } from "../MoApiClient";
import type { IApiDataListResult } from "../RequestResults";
import { injectable, inject } from "inversify";
import type { RecordsStore } from "../Records/RecordsStore";
import ScheduleTimeSpanEntity from "../Records/DataEntities/ScheduleTimeSpanEntity";
import ScheduleTimespanItem from "../Records/DataEntities/ScheduleTimespanItem";
import { QuerySchedule, QueryParamsScheduler } from "../RequestArgs";

@injectable()
export class ScheduleApiSection {
  constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("RecordsStore") protected _RecordsStore: RecordsStore) {}

  async getScheduleByItemGroup(fromDate: Date, toDate: Date, groupId: string) {
    const queryObj = {
      fromDate: Utils.getDateStr(fromDate),
      toDate: Utils.getDateStr(toDate),
      groupId,
    };

    const raw = await this._MoApiClient.send<QueryParamsScheduler, ScheduleTimespanItem[][]>("/Schedule/GetScheduleByItemGroup", queryObj, true);
    const res: ScheduleTimespanItem[][] = [];
    for (const date in raw) res[date] = raw[date].map((item) => this._RecordsStore.dataEntityFactory(ScheduleTimespanItem, item));

    return res;
  }

  async getSchedule(queryArgs: QuerySchedule) {
    queryArgs.begDate = Utils.getDateStr(new Date(queryArgs.begDate));
    queryArgs.endDate = Utils.getDateStr(new Date(queryArgs.endDate));

    const raw = await this._MoApiClient.send<QuerySchedule, ScheduleTimespanItem[][]>("/Schedule/GetSchedule", queryArgs);
    const res: ScheduleTimespanItem[][] = [];
    for (const date in raw) res[date] = raw[date].map((item) => this._RecordsStore.dataEntityFactory(ScheduleTimespanItem, item));

    return res;
  }
}
