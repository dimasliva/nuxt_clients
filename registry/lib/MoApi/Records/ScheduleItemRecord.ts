import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import ScheduleTimeSpanEntity from "./DataEntities/ScheduleTimeSpanEntity";
import { DataEntity } from "./DataEntities/DataEntity";

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
    notActive?: boolean | null = null;
    advData?: any | null = null;

    override fromJsonObj(obj: any) {
      super.fromJsonObj(obj)
      this.timespans = obj.timespans ? obj.timespans.map(item => this.__RecordStore.dataEntityFactory(ScheduleTimeSpanEntity, null, item)) : null;
    }

    override getJsonObj(){
        let obj: any = {}
        for (let item in this){
            if (!item.startsWith("__") && typeof item != "function") {
                let val = this[item];
                if (val instanceof DataEntity){
                    obj[item] = val.getJsonObj();
                } else if (val instanceof Array) {
                     obj[item] = val.map(i => i);
                } else {
                    obj[item] = this[item];
                }
            }
        }
        return obj;
    }
}

export class ScheduleItemRecord extends ApiRecord<ScheduleItemData>{

    static RightToken = "dbScheduleItem";
    static RecCode = 1026;

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, __UserContext, _RecStore, ScheduleItemRecord, Key);
    }

    get RecCode() { return ScheduleItemRecord.RecCode; }

    protected _createNewData() {
      return   this._RecStore.dataEntityFactory(ScheduleItemData, this.Key);
  }

    protected _getApiRecordPathGet = () => "/Schedule/GetScheduleItems";


    protected _getApiRecordPathAdd = () => "/Schedule/AddScheduleItem";


    protected _getApiRecordPathUpdate = () => "/Schedule//UpdateScheduleItem";


    protected _getApiRecordPathDelete = () => "/Schedule/DeleteScheduleItem";

}