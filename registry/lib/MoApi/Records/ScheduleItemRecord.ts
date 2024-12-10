import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import ScheduleTimeSpanEntity from "./DataEntities/ScheduleTimeSpanEntity";
import { DataEntity } from "./DataEntities/DataEntity";
import { injectable } from "inversify";

@injectable()
export class ScheduleItemData extends ApiRecordChData {
  position: string = "";
  division: string | null = null;
  placement: string | null = null;
  beginDate: string = "";
  endDate: string = "";
  activityDays: number = 0;
  pauseDays: number = 0;
  exceptions: string = "";
  workExceptions: string = "";
  timespans: ScheduleTimeSpanEntity[] = [];
  defDuration: number | null = null;
  notActive?: boolean | null = null;
  advData?: any | null = null;

  override fromJsonObj(obj: any) {
    super.fromJsonObj(obj);
    this.timespans = obj.timespans ? obj.timespans.map((item) => this.__RecordStore.dataEntityFactory(ScheduleTimeSpanEntity, null, item)) : null;
  }
}


@injectable()
export class ScheduleItemRecord extends ApiRecord<ScheduleItemData> {
  static override RightToken = "dbScheduleItem";
  static override RecCode = 1026;
  static override BatchGetRecDataPath = "/Schedule/GetScheduleItems";
  static override RecordsFindPath = "/Schedule/FindScheduleItems";

  get RecCode() {
    return ScheduleItemRecord.RecCode;
  }

  protected _createNewData() {
    return this._RecStore.dataEntityFactory(ScheduleItemData, null, this.Key);
  }

  protected _getApiRecordPathGet = () => "/Schedule/GetScheduleItems";

  protected _getApiRecordPathAdd = () => "/Schedule/AddScheduleItem";

  protected _getApiRecordPathUpdate = () => "/Schedule//UpdateScheduleItem";

  protected _getApiRecordPathDelete = () => "/Schedule/DeleteScheduleItem";
}
