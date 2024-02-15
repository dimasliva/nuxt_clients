import { Exception } from "~/lib/Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { QueryParamsScheduler } from "../RequestArgs";
import type { IApiDataListResult, IApiResult } from "../RequestResults";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type ScheduleTimeSpanEntity from "./DataEntities/ScheduleTimeSpanEntity";
import type { RecordsStore } from "./RecordsStore";
import { injectable } from "inversify";

@injectable()
export class ScheduleItemGroupData extends ApiRecordChData {
  title: string = "";
  code: string | null = null;
  description: string | null = null;
  temporaryNotActive: boolean | null = false;
  notActive: boolean | null = false;
  advData: string | null = null;
}


export class ScheduleItemGroupRecord extends ApiRecord<ScheduleItemGroupData> {
  static RightToken = "dbScheduleItemGroup";
  static RecCode = 1035;


  constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
    super(_MoApiClient, __UserContext, _RecStore, ScheduleItemGroupRecord, Key);
  }

  get RecCode() {
    return ScheduleItemGroupRecord.RecCode;
  }



  protected _createNewData() {
    return this._RecStore.dataEntityFactory(ScheduleItemGroupData, null, this.Key);
  }

  protected _getApiRecordPathGet = () => "/Schedule/GetScheduleItemGroups";

  protected _getApiRecordPathAdd = () => "/Schedule/AddScheduleItemGroup";

  protected _getApiRecordPathUpdate = () => "/Schedule//UpdateScheduleItemGroup";

  protected _getApiRecordPathDelete = () => "/Schedule/DeleteScheduleItemGroup";
}
