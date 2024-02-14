import { Exception } from "~/lib/Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { QueryParamsScheduler } from "../RequestArgs";
import type { IApiDataListResult, IApiResult } from "../RequestResults";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type ScheduleTimeSpanEntity from "./DataEntities/ScheduleTimeSpanEntity";
import type { RecordsStore } from "./RecordsStore";

export class ScheduleItemGroupData extends ApiRecordChData {
  title: string = "";
  code: string | null = null;
  description: string | null = null;
  temporaryNotActive: boolean | null = false;
  notActive: boolean | null = false;
  advData: string | null = null;
}

export class ScheduleTimespanItem {
  timespan!: ScheduleTimeSpanEntity;
  position?: string;
  division?: string;
  placement?: string;
  products?: string[] | null;
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

  protected async _loadData() {
    const arr = await this._MoApiClient.send<any, any>(this._getApiRecordPathGet(), this._Key);
    this._Data = new Proxy(<ScheduleItemGroupData>arr, this._getProxyHanlders());
    this._ModifiedData = new Proxy(<ScheduleItemGroupData>arr, this._getModifingProxyHanlders());
    return this._Data;
  }

  protected _createNewData() {
    return this._RecStore.dataEntityFactory(ScheduleItemGroupData, this.Key);
  }

  protected _getApiRecordPathGet = () => "/Schedule/GetScheduleItemGroups";

  protected _getApiRecordPathAdd = () => "/Schedule/AddScheduleItemGroup";

  protected _getApiRecordPathUpdate = () => "/Schedule//UpdateScheduleItemGroup";

  protected _getApiRecordPathDelete = () => "/Schedule/DeleteScheduleItemGroup";
}
